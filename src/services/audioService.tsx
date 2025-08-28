import { Audio } from "expo-av"
import { Platform } from "react-native"

class AudioService {
  private sound: Audio.Sound | null = null
  private isPlaying = false
  // This promise will chain all audio operations, ensuring they run sequentially
  private currentOperation: Promise<void> = Promise.resolve()

  /**
   * Plays an audio file from a given URL.
   * This operation will be queued and executed after any previous audio operations complete.
   * @param audioUrl The URL of the audio file to play.
   */
  async playAudio(audioUrl: string): Promise<void> {
    // Chain the new play operation after the previous one completes
    this.currentOperation = this.currentOperation
      .then(async () => {
        try {
          console.log("🎵 AudioService: Attempting to play audio:", audioUrl)
          const urlParts = audioUrl.split("/")
          const fileName = urlParts[urlParts.length - 1]
          console.log("🎵 AudioService: File name being played:", fileName)

          // Ensure previous sound is stopped and unloaded before proceeding
          // This internal call is now part of the sequential chain
          await this.stopAudioInternal()

          const isRemoteUrl = audioUrl.startsWith("http://") || audioUrl.startsWith("https://")
          let fullUrl = audioUrl
          if (!isRemoteUrl) {
            const baseUrl = "https://trainmyears.softaims.com"
            fullUrl = `${baseUrl}${audioUrl.startsWith("/") ? audioUrl : "/" + audioUrl}`
          }
          console.log("🔊 AudioService: Using URL:", fullUrl)

          // For iOS, ensure audio session is properly activated before playing
          if (Platform.OS === "ios") {
            await Audio.setAudioModeAsync({
              playsInSilentModeIOS: true,
              staysActiveInBackground: false,
            })
          }

          const { sound } = await Audio.Sound.createAsync({ uri: fullUrl }, { shouldPlay: true })
          this.sound = sound
          this.isPlaying = true

          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
              if (status.error) {
                console.error("❌ AudioService: Playback error:", status.error)
                // Use internal stop method for cleanup
                this.stopAudioInternal()
              }
              return
            }
            if (status.didJustFinish) {
              console.log("🎶 AudioService: Successfully finished playing")
              // Use internal stop method for cleanup
              this.stopAudioInternal()
            }
          })

          console.log("✅ AudioService: Sound loaded and playing successfully")
          const status = await sound.getStatusAsync()
          if (status.isLoaded && status.durationMillis) {
            console.log("ℹ️ AudioService: Sound duration:", status.durationMillis / 1000, "seconds")
          }
        } catch (error) {
          console.error("❌ AudioService: Error in playAudio method:", error)
          if (error instanceof Error) {
            console.error("❌ AudioService: Error message:", error.message)
          }
          // Ensure cleanup on error
          await this.stopAudioInternal()
          throw error // Re-throw to propagate the error to the component
        }
      })
      .catch((error) => {
        // Catch errors from the previous operation in the chain
        console.error("AudioService: Previous operation in playAudio chain failed:", error)
        // Do not re-throw here, let the next operation try to proceed
      })

    return this.currentOperation // Return the promise for the current operation
  }

  /**
   * Internal method to stop and unload audio.
   * This method is called by other AudioService methods and is part of the sequential queue.
   */
  private async stopAudioInternal(): Promise<void> {
    const soundToStop = this.sound
    // Immediately clear the instance variable and playing state
    // This prevents race conditions if stopAudio is called multiple times rapidly
    this.sound = null
    this.isPlaying = false

    if (soundToStop) {
      try {
        console.log("🛑 AudioService: Stopping audio internally")
        const status = await soundToStop.getStatusAsync()
        if (status.isLoaded) {
          await soundToStop.stopAsync()
          await soundToStop.unloadAsync()
          console.log("✅ AudioService: Audio stopped and released internally")
        } else {
          console.log("🛑 AudioService: Sound not loaded or already unloaded, just clearing reference internally.")
        }
      } catch (error) {
        console.error("❌ AudioService: Error stopping or unloading audio internally:", error)
        // The sound reference is already null, so no further cleanup needed here
      }
    } else {
      console.log("AudioService: No sound currently playing to stop internally.")
    }
  }

  /**
   * Public method to stop audio.
   * This operation will be queued and executed after any previous audio operations complete.
   */
  async stopAudio(): Promise<void> {
    this.currentOperation = this.currentOperation
      .then(() => this.stopAudioInternal())
      .catch((error) => {
        console.error("AudioService: Error in public stopAudio chain:", error)
      })
    return this.currentOperation
  }

  /**
   * Checks if audio is currently playing.
   * This operation will be queued.
   */
  isAudioPlaying(): boolean {
    // This method is synchronous, so it doesn't need to be chained directly,
    // but its result depends on the state set by async operations.
    // For simplicity, we'll keep it synchronous and reflect the current state.
    return this.isPlaying
  }

  /**
   * Gets current playback position (if needed).
   * This operation will be queued.
   */
  async getCurrentTime(): Promise<number> {
    return this.currentOperation
      .then(async () => {
        if (this.sound) {
          const status = await this.sound.getStatusAsync()
          if (status.isLoaded) {
            return status.positionMillis / 1000 // Convert to seconds
          }
        }
        return 0
      })
      .catch(() => 0) // Return 0 if previous operation failed
  }

  /**
   * Sets volume (0 to 1).
   * This operation will be queued.
   */
  async setVolume(volume: number): Promise<void> {
    this.currentOperation = this.currentOperation
      .then(async () => {
        if (this.sound && volume >= 0 && volume <= 1) {
          await this.sound.setVolumeAsync(volume)
          console.log("🔊 AudioService: Volume set to:", volume)
        }
      })
      .catch((error) => {
        console.error("AudioService: Error in setVolume chain:", error)
      })
    return this.currentOperation
  }

  /**
   * Pauses audio.
   * This operation will be queued.
   */
  async pauseAudio(): Promise<void> {
    this.currentOperation = this.currentOperation
      .then(async () => {
        if (this.sound && this.isPlaying) {
          await this.sound.pauseAsync()
          this.isPlaying = false
          console.log("⏸️ AudioService: Audio paused")
        }
      })
      .catch((error) => {
        console.error("AudioService: Error in pauseAudio chain:", error)
      })
    return this.currentOperation
  }
}

export const audioService = new AudioService()

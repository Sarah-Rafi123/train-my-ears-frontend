import Sound from "react-native-sound"

class AudioService {
  private sound: Sound | null = null

  constructor() {
    // Enable playback in silence mode (iOS)
    Sound.setCategory("Playback")
  }

  async playAudio(audioUrl: string): Promise<void> {
    try {
      console.log("🎵 AudioService: Attempting to play audio:", audioUrl)

      // Stop and release previous sound if exists
      if (this.sound) {
        this.sound.stop()
        this.sound.release()
        this.sound = null
        console.log("🔇 AudioService: Stopped and released previous sound")
      }

      // Determine if this is a local file or remote URL
      let soundSource: string
      const basePath = ""

      if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
        // It's already a full URL
        soundSource = audioUrl
        console.log("🌐 AudioService: Using full URL:", soundSource)
      } else if (audioUrl.startsWith("/")) {
        // It's a relative path from API, construct full URL
        soundSource = `${process.env.API_BASE_URL}${audioUrl}`
        console.log("🔗 AudioService: Constructed URL:", soundSource)
      } else {
        // It's a relative path without leading slash
        soundSource = `${process.env.API_BASE_URL}/${audioUrl}`
        console.log("🔗 AudioService: Constructed URL with slash:", soundSource)
      }

      // Create new sound instance with proper error handling
      this.sound = new Sound(soundSource, basePath, (error) => {
        if (error) {
          console.error("❌ AudioService: Failed to load the sound:", error)
          console.error("❌ AudioService: Sound source was:", soundSource)
          return
        }

        console.log("✅ AudioService: Sound loaded successfully")

        // Play the sound
        this.sound?.play((success) => {
          if (success) {
            console.log("🎶 AudioService: Successfully finished playing")
          } else {
            console.error("❌ AudioService: Playback failed due to audio decoding errors")
          }

          // Clean up after playback
          if (this.sound) {
            this.sound.release()
            this.sound = null
          }
        })
      })
    } catch (error) {
      console.error("❌ AudioService: Error in playAudio method:", error)

      // Clean up on error
      if (this.sound) {
        this.sound.release()
        this.sound = null
      }
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        console.log("🛑 AudioService: Stopping audio")
        this.sound.stop()
        this.sound.release()
        this.sound = null
        console.log("✅ AudioService: Audio stopped and released")
      }
    } catch (error) {
      console.error("❌ AudioService: Error stopping audio:", error)
    }
  }

  // Method to check if audio is currently playing
  isPlaying(): boolean {
    return this.sound !== null
  }

  // Method to get current playback position (if needed)
  getCurrentTime(callback: (seconds: number) => void): void {
    if (this.sound) {
      this.sound.getCurrentTime(callback)
    } else {
      callback(0)
    }
  }

  // Method to set volume
  setVolume(volume: number): void {
    if (this.sound && volume >= 0 && volume <= 1) {
      this.sound.setVolume(volume)
      console.log("🔊 AudioService: Volume set to:", volume)
    }
  }
}

export const audioService = new AudioService()

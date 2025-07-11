import { Audio } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;

  constructor() {
    // No need for category setup here, expo-av handles it well by default
  }

  async playAudio(audioUrl: string): Promise<void> {
    try {
      console.log("🎵 AudioService: Attempting to play audio:", audioUrl);

      // Extract the file name from the URL for logging
      const urlParts = audioUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      console.log("🎵 AudioService: File name being played:", fileName);

      // Stop and release previous sound if exists
      await this.stopAudio();

      // Handle URLs properly
      const isRemoteUrl = audioUrl.startsWith("http://") || audioUrl.startsWith("https://");

      // If it's not already a full URL, construct it
      let fullUrl = audioUrl;
      if (!isRemoteUrl) {
        const baseUrl = "http://16.16.104.51" ;
        fullUrl = `${baseUrl}${audioUrl.startsWith("/") ? audioUrl : "/" + audioUrl}`;
      }

      console.log("🔊 AudioService: Using URL:", fullUrl);

      // Load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          // The player is not loaded (error occurred)
          if (status.error) {
            console.error("❌ AudioService: Playback error:", status.error);
            this.stopAudio();
          }
          return;
        }

        if (status.didJustFinish) {
          console.log("🎶 AudioService: Successfully finished playing");
          this.stopAudio();
        }
      });

      console.log("✅ AudioService: Sound loaded and playing successfully");
      console.log("ℹ️ AudioService: Sound duration:", (await sound.getStatusAsync()).durationMillis / 1000, "seconds");

    } catch (error) {
      console.error("❌ AudioService: Error in playAudio method:", error);

      // More detailed error logging
      if (error instanceof Error) {
        console.error("❌ AudioService: Error message:", error.message);
      }

      // Clean up on error
      await this.stopAudio();
      throw error;
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        console.log("🛑 AudioService: Stopping audio");
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        console.log("✅ AudioService: Audio stopped and released");
      }
    } catch (error) {
      console.error("❌ AudioService: Error stopping audio:", error);
      // Make sure to clean up even if there's an error
      this.sound = null;
      this.isPlaying = false;
    }
  }

  // Method to check if audio is currently playing
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  // Method to get current playback position (if needed)
  async getCurrentTime(): Promise<number> {
    if (this.sound) {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis / 1000; // Convert to seconds
      }
    }
    return 0;
  }

  // Method to set volume (0 to 1)
  async setVolume(volume: number): Promise<void> {
    if (this.sound && volume >= 0 && volume <= 1) {
      await this.sound.setVolumeAsync(volume);
      console.log("🔊 AudioService: Volume set to:", volume);
    }
  }

  // Optional: Pause method
  async pauseAudio(): Promise<void> {
    if (this.sound && this.isPlaying) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      console.log("⏸️ AudioService: Audio paused");
    }
  }
}

export const audioService = new AudioService();
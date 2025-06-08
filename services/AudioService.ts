/**
 * AudioService for BeepRunner
 * Handles programmatic beep generation and workout audio cues
 */

import { Audio } from 'expo-av';
import { AUDIO_CONFIG } from '@/constants/BeepTestConfig';

export type AudioCueType = 'beep' | 'countdown' | 'start' | 'level_up' | 'complete';

class AudioService {
  private isInitialized = false;
  
  /**
   * Initialize audio system and request permissions
   */
  async initialize(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('AudioService initialization failed:', error);
    }
  }

  /**
   * Generate a simple beep tone
   */
  private generateBeepBuffer(frequency: number, duration: number, sampleRate = 44100): Float32Array {
    const samples = Math.floor(sampleRate * (duration / 1000));
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const amplitude = 0.3 * Math.sin(2 * Math.PI * frequency * time);
      // Apply fade in/out to prevent clicking
      const fadeTime = 0.01; // 10ms fade
      const fadeSamples = Math.floor(sampleRate * fadeTime);
      
      if (i < fadeSamples) {
        buffer[i] = amplitude * (i / fadeSamples);
      } else if (i > samples - fadeSamples) {
        buffer[i] = amplitude * ((samples - i) / fadeSamples);
      } else {
        buffer[i] = amplitude;
      }
    }
    
    return buffer;
  }

  /**
   * Convert Float32Array to base64 WAV data URI
   */
  private arrayBufferToBase64(buffer: Float32Array): string {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataLength = buffer.length * 2; // 16-bit samples
    const fileLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(fileLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, fileLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Convert float samples to 16-bit integers
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    // Convert to base64
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return 'data:audio/wav;base64,' + btoa(binary);
  }

  /**
   * Play a workout beep
   */
  async playBeep(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const buffer = this.generateBeepBuffer(
        AUDIO_CONFIG.BEEP_FREQUENCY,
        AUDIO_CONFIG.BEEP_DURATION
      );
      const dataUri = this.arrayBufferToBase64(buffer);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      
      // Clean up after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }

  /**
   * Play countdown sequence (3, 2, 1)
   */
  async playCountdown(onCount?: (count: number) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    for (let i = 3; i >= 1; i--) {
      onCount?.(i);
      await this.playCountdownBeep();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Play a countdown beep (different from workout beep)
   */
  async playCountdownBeep(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const buffer = this.generateBeepBuffer(
        AUDIO_CONFIG.COUNTDOWN_FREQUENCY,
        AUDIO_CONFIG.COUNTDOWN_DURATION
      );
      const dataUri = this.arrayBufferToBase64(buffer);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play countdown beep:', error);
    }
  }

  /**
   * Play start signal
   */
  async playStart(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Start signal: two quick beeps
      await this.playBeep();
      await new Promise(resolve => setTimeout(resolve, 200));
      await this.playBeep();
    } catch (error) {
      console.warn('Failed to play start signal:', error);
    }
  }

  /**
   * Play level up signal
   */
  async playLevelUp(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Level up: ascending tone
      const buffer = this.generateBeepBuffer(1000, 300); // Higher pitch, longer duration
      const dataUri = this.arrayBufferToBase64(buffer);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Failed to play level up signal:', error);
    }
  }

  /**
   * Play workout complete signal
   */
  async playComplete(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Complete: triumphant sequence
      for (let i = 0; i < 3; i++) {
        const buffer = this.generateBeepBuffer(800 + (i * 200), 200);
        const dataUri = this.arrayBufferToBase64(buffer);
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: dataUri },
          { shouldPlay: true }
        );
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.warn('Failed to play complete signal:', error);
    }
  }

  /**
   * Stop all audio
   */
  async stopAll(): Promise<void> {
    try {
      // Note: Individual sounds are cleaned up automatically
      // This method is for future expansion if needed
    } catch (error) {
      console.warn('Failed to stop audio:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
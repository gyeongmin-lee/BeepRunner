/**
 * AudioProvider for BeepRunner
 * React Context implementation using expo-audio for workout audio cues
 */

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { AUDIO_CONFIG } from '@/constants/BeepTestConfig';

export interface AudioContextType {
  initialize: () => Promise<void>;
  playBeep: () => void;
  playCountdownBeep: () => void;
  playStart: () => void;
  playLevelUp: () => void;
  playComplete: () => void;
  playCountdown: (onCount?: (count: number) => void) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  // Generate beep buffers
  const generateBeepBuffer = useCallback((frequency: number, duration: number, sampleRate = 44100): Float32Array => {
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
  }, []);

  // Convert Float32Array to base64 WAV data URI
  const arrayBufferToBase64 = useCallback((buffer: Float32Array): string => {
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
  }, []);

  // Generate audio sources
  const beepSource = arrayBufferToBase64(generateBeepBuffer(AUDIO_CONFIG.BEEP_FREQUENCY, AUDIO_CONFIG.BEEP_DURATION));
  const countdownSource = arrayBufferToBase64(generateBeepBuffer(AUDIO_CONFIG.COUNTDOWN_FREQUENCY, AUDIO_CONFIG.COUNTDOWN_DURATION));
  const levelUpSource = arrayBufferToBase64(generateBeepBuffer(1000, 300));
  const completeSource1 = arrayBufferToBase64(generateBeepBuffer(800, 200));
  const completeSource2 = arrayBufferToBase64(generateBeepBuffer(1000, 200));
  const completeSource3 = arrayBufferToBase64(generateBeepBuffer(1200, 200));

  // Create audio players
  const beepPlayer = useAudioPlayer(beepSource);
  const countdownPlayer = useAudioPlayer(countdownSource);
  const levelUpPlayer = useAudioPlayer(levelUpSource);
  const completePlayer1 = useAudioPlayer(completeSource1);
  const completePlayer2 = useAudioPlayer(completeSource2);
  const completePlayer3 = useAudioPlayer(completeSource3);

  // Status tracking for cleanup
  const beepStatus = useAudioPlayerStatus(beepPlayer);
  const countdownStatus = useAudioPlayerStatus(countdownPlayer);
  const levelUpStatus = useAudioPlayerStatus(levelUpPlayer);
  const complete1Status = useAudioPlayerStatus(completePlayer1);
  const complete2Status = useAudioPlayerStatus(completePlayer2);
  const complete3Status = useAudioPlayerStatus(completePlayer3);

  // Reset players when they finish
  useEffect(() => {
    if (beepStatus.didJustFinish) {
      beepPlayer.seekTo(0);
    }
  }, [beepStatus.didJustFinish, beepPlayer]);

  useEffect(() => {
    if (countdownStatus.didJustFinish) {
      countdownPlayer.seekTo(0);
    }
  }, [countdownStatus.didJustFinish, countdownPlayer]);

  useEffect(() => {
    if (levelUpStatus.didJustFinish) {
      levelUpPlayer.seekTo(0);
    }
  }, [levelUpStatus.didJustFinish, levelUpPlayer]);

  useEffect(() => {
    if (complete1Status.didJustFinish) {
      completePlayer1.seekTo(0);
    }
  }, [complete1Status.didJustFinish, completePlayer1]);

  useEffect(() => {
    if (complete2Status.didJustFinish) {
      completePlayer2.seekTo(0);
    }
  }, [complete2Status.didJustFinish, completePlayer2]);

  useEffect(() => {
    if (complete3Status.didJustFinish) {
      completePlayer3.seekTo(0);
    }
  }, [complete3Status.didJustFinish, completePlayer3]);

  const initialize = useCallback(async (): Promise<void> => {
    try {
      await requestRecordingPermissionsAsync();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
    } catch (error) {
      console.warn('AudioProvider initialization failed:', error);
    }
  }, []);

  const playBeep = useCallback(() => {
    try {
      beepPlayer.play();
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }, [beepPlayer]);

  const playCountdownBeep = useCallback(() => {
    try {
      countdownPlayer.play();
    } catch (error) {
      console.warn('Failed to play countdown beep:', error);
    }
  }, [countdownPlayer]);

  const playStart = useCallback(async () => {
    try {
      // Start signal: two quick beeps
      beepPlayer.play();
      await new Promise(resolve => setTimeout(resolve, 200));
      beepPlayer.seekTo(0);
      beepPlayer.play();
    } catch (error) {
      console.warn('Failed to play start signal:', error);
    }
  }, [beepPlayer]);

  const playLevelUp = useCallback(() => {
    try {
      levelUpPlayer.play();
    } catch (error) {
      console.warn('Failed to play level up signal:', error);
    }
  }, [levelUpPlayer]);

  const playComplete = useCallback(async () => {
    try {
      // Complete: triumphant sequence
      completePlayer1.play();
      await new Promise(resolve => setTimeout(resolve, 300));
      completePlayer2.play();
      await new Promise(resolve => setTimeout(resolve, 300));
      completePlayer3.play();
    } catch (error) {
      console.warn('Failed to play complete signal:', error);
    }
  }, [completePlayer1, completePlayer2, completePlayer3]);

  const playCountdown = useCallback(async (onCount?: (count: number) => void): Promise<void> => {
    for (let i = 3; i >= 1; i--) {
      onCount?.(i);
      playCountdownBeep();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, [playCountdownBeep]);

  const contextValue: AudioContextType = {
    initialize,
    playBeep,
    playCountdownBeep,
    playStart,
    playLevelUp,
    playComplete,
    playCountdown,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
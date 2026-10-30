import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { webMidi } from '../utils/webAudioMidi.ts';

export interface AudioControllerContextType {
  isMidiPlaying: boolean;
  isVideoUnmuted: boolean;
  isAnythingPlaying: boolean;
  isGloballyMuted: boolean;
  toggleGlobalMute: () => void;
  toggleMidi: () => void;
  setMidiPlaying: (playing: boolean) => void;
  toggleVideoAudio: () => void;
  setVideoUnmuted: (unmuted: boolean) => void;
  registerVideoElement: (el: HTMLVideoElement | null) => void;
  playBuzzer: () => void;
  playChatReceive: () => void;
  playChatSend: () => void;
  playSwoosh: () => void;
  resumeAudioContext: () => void;
}

const AudioControllerContext = createContext<AudioControllerContextType | null>(null);

export const AudioControllerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMidiPlaying, setIsMidiPlayingState] = useState<boolean>(false);
  const [isVideoUnmuted, setIsVideoUnmutedState] = useState<boolean>(false);
  const [isGloballyMuted, setIsGloballyMuted] = useState<boolean>(false);

  // Store previous active states before a global mute was toggled
  const savedStatesRef = useRef<{ midi: boolean; video: boolean }>({
    midi: false,
    video: false,
  });

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Register HTML5 Video element from StickyVideo
  const registerVideoElement = useCallback((el: HTMLVideoElement | null) => {
    videoElementRef.current = el;
    if (el) {
      el.muted = !isVideoUnmuted;
    }
  }, [isVideoUnmuted]);

  // Keep HTML5 video element muted state synced whenever isVideoUnmuted changes
  useEffect(() => {
    if (videoElementRef.current) {
      videoElementRef.current.muted = !isVideoUnmuted;
    }
  }, [isVideoUnmuted]);

  // If anything is actively playing (either MIDI or unmuted video)
  const isAnythingPlaying = isMidiPlaying || isVideoUnmuted;

  const resumeAudioContext = useCallback(() => {
    webMidi.ensureAudioContext();
  }, []);

  const setMidiPlaying = useCallback((playing: boolean) => {
    if (playing) {
      setIsGloballyMuted(false);
      webMidi.setMasterMute(false);
      webMidi.startMidi();
      setIsMidiPlayingState(true);
    } else {
      webMidi.stopMidi();
      setIsMidiPlayingState(false);
    }
  }, []);

  const toggleMidi = useCallback(() => {
    if (isMidiPlaying) {
      setMidiPlaying(false);
    } else {
      setMidiPlaying(true);
    }
  }, [isMidiPlaying, setMidiPlaying]);

  const setVideoUnmuted = useCallback((unmuted: boolean) => {
    if (unmuted) {
      setIsGloballyMuted(false);
      webMidi.setMasterMute(false);
      webMidi.ensureAudioContext();
      if (videoElementRef.current) {
        videoElementRef.current.muted = false;
      }
      setIsVideoUnmutedState(true);
    } else {
      if (videoElementRef.current) {
        videoElementRef.current.muted = true;
      }
      setIsVideoUnmutedState(false);
    }
  }, []);

  const toggleVideoAudio = useCallback(() => {
    if (isVideoUnmuted) {
      setVideoUnmuted(false);
    } else {
      setVideoUnmuted(true);
    }
  }, [isVideoUnmuted, setVideoUnmuted]);

  /**
   * Global Audio Mute Controller:
   * - If anything is playing: mutes everything and saves the previous states.
   * - If muted: resumes previous states for each audio source (MIDI and/or Video).
   */
  const toggleGlobalMute = useCallback(() => {
    if (isAnythingPlaying) {
      savedStatesRef.current = {
        midi: isMidiPlaying,
        video: isVideoUnmuted,
      };

      // Mute MIDI
      webMidi.stopMidi();
      setIsMidiPlayingState(false);

      // Mute Video
      if (videoElementRef.current) {
        videoElementRef.current.muted = true;
      }
      setIsVideoUnmutedState(false);

      // Mute master audio gain (quiets all SFX as well)
      webMidi.setMasterMute(true);
      setIsGloballyMuted(true);
    } else {
      // Audio is currently muted or nothing is playing: resume previous states
      webMidi.setMasterMute(false);
      setIsGloballyMuted(false);

      const restore = savedStatesRef.current;
      // If neither was active before (e.g. user arrived and toggled unmute), default to resuming MIDI
      const shouldRestoreMidi = restore.midi || (!restore.midi && !restore.video);
      const shouldRestoreVideo = restore.video;

      if (shouldRestoreMidi) {
        webMidi.startMidi();
        setIsMidiPlayingState(true);
      }
      if (shouldRestoreVideo) {
        if (videoElementRef.current) {
          videoElementRef.current.muted = false;
        }
        setIsVideoUnmutedState(true);
      }
    }
  }, [isAnythingPlaying, isMidiPlaying, isVideoUnmuted]);

  const playBuzzer = useCallback(() => {
    if (!isGloballyMuted) {
      webMidi.playBuzzerSound();
    }
  }, [isGloballyMuted]);

  const playChatReceive = useCallback(() => {
    if (!isGloballyMuted) {
      webMidi.playChatReceiveSound();
    }
  }, [isGloballyMuted]);

  const playChatSend = useCallback(() => {
    if (!isGloballyMuted) {
      webMidi.playChatSendSound();
    }
  }, [isGloballyMuted]);

  const playSwoosh = useCallback(() => {
    if (!isGloballyMuted) {
      webMidi.playPopupSwoosh();
    }
  }, [isGloballyMuted]);

  // One-time window listener to safely unblock AudioContext on the very first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      webMidi.ensureAudioContext();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <AudioControllerContext.Provider
      value={{
        isMidiPlaying,
        isVideoUnmuted,
        isAnythingPlaying,
        isGloballyMuted,
        toggleGlobalMute,
        toggleMidi,
        setMidiPlaying,
        toggleVideoAudio,
        setVideoUnmuted,
        registerVideoElement,
        playBuzzer,
        playChatReceive,
        playChatSend,
        playSwoosh,
        resumeAudioContext,
      }}
    >
      {children}
    </AudioControllerContext.Provider>
  );
};

export const useAudioController = (): AudioControllerContextType => {
  const context = useContext(AudioControllerContext);
  if (!context) {
    throw new Error('useAudioController must be used within an AudioControllerProvider');
  }
  return context;
};

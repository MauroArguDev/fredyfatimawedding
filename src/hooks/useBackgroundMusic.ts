import { useCallback, useRef, useState, type RefObject } from 'react';

const BACKGROUND_MUSIC_SOURCE = '/audio/background-music.mp3';

interface UseBackgroundMusicResult {
  audioRef: RefObject<HTMLAudioElement>;
  audioSource: string;
  isPlaying: boolean;
  play: () => void;
  toggle: () => void;
}

export function useBackgroundMusic(): UseBackgroundMusicResult {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, []);

  const pause = useCallback((): void => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback((): void => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return { audioRef, audioSource: BACKGROUND_MUSIC_SOURCE, isPlaying, play, toggle };
}

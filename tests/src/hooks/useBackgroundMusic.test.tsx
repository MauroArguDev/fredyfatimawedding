import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

function attachAudioElement(audioRef: { current: HTMLAudioElement | null }): HTMLAudioElement {
  const audio = document.createElement('audio');
  audioRef.current = audio;
  return audio;
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('useBackgroundMusic', () => {
  it('startsPaused', () => {
    const { result } = renderHook(() => useBackgroundMusic());

    expect(result.current.isPlaying).toBe(false);
  });

  it('marksAsPlayingOncePlaybackStarts', async () => {
    const { result } = renderHook(() => useBackgroundMusic());
    attachAudioElement(result.current.audioRef);

    await act(async () => {
      result.current.play();
      await flushMicrotasks();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it('pausesWithoutResettingPlaybackPositionSoToggleResumesWhereItLeftOff', async () => {
    const { result } = renderHook(() => useBackgroundMusic());
    const audio = attachAudioElement(result.current.audioRef);
    const pauseSpy = vi.spyOn(audio, 'pause');

    await act(async () => {
      result.current.play();
      await flushMicrotasks();
    });
    act(() => {
      result.current.toggle();
    });

    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('degradesGracefullyWhenTheBrowserBlocksPlayback', async () => {
    const { result } = renderHook(() => useBackgroundMusic());
    const audio = attachAudioElement(result.current.audioRef);
    vi.spyOn(audio, 'play').mockRejectedValueOnce(new Error('NotAllowedError'));

    await act(async () => {
      result.current.play();
      await flushMicrotasks();
    });

    expect(result.current.isPlaying).toBe(false);
  });
});

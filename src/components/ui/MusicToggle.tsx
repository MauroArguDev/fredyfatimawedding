import type { ReactNode } from 'react';
import { musicToggleCopy } from '@/content/music';

const VINYL_RECORD_ASSET = '/assets/music/vinyl-record.svg';
const ICON_DROP_SHADOW = 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.15))';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const MusicToggle = ({ isPlaying, onToggle }: MusicToggleProps): ReactNode => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={isPlaying}
    aria-label={isPlaying ? musicToggleCopy.pauseLabel : musicToggleCopy.playLabel}
    className="fixed top-4 left-4 z-40 h-14 w-14 rounded-full bg-bg-base shadow-invitation-badge"
  >
    <img
      src={VINYL_RECORD_ASSET}
      alt=""
      aria-hidden="true"
      className="h-full w-full motion-safe:animate-spin-slow"
      style={{
        animationPlayState: isPlaying ? 'running' : 'paused',
        filter: ICON_DROP_SHADOW,
      }}
    />
  </button>
);

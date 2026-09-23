import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicToggle } from '@/components/ui/MusicToggle';
import { musicToggleCopy } from '@/content/music';

describe('MusicToggle', () => {
  it('exposesItsStateToAssistiveTechnologyWhilePlaying', () => {
    render(<MusicToggle isPlaying onToggle={vi.fn()} />);

    const button = screen.getByRole('button', { name: musicToggleCopy.pauseLabel });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('exposesItsStateToAssistiveTechnologyWhilePaused', () => {
    render(<MusicToggle isPlaying={false} onToggle={vi.fn()} />);

    const button = screen.getByRole('button', { name: musicToggleCopy.playLabel });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('callsOnToggleWhenClicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<MusicToggle isPlaying={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('keepsTheSpinAnimationAppliedAtAllTimesSoPausingFreezesItInPlaceInsteadOfResettingIt', () => {
    const { container, rerender } = render(<MusicToggle isPlaying={false} onToggle={vi.fn()} />);
    const getRecordImage = (): HTMLElement => {
      const image = container.querySelector('img');
      if (!image) {
        throw new Error('Vinyl record image not found');
      }
      return image;
    };

    expect(getRecordImage().className).toContain('animate-spin-slow');
    expect(getRecordImage().style.animationPlayState).toBe('paused');

    rerender(<MusicToggle isPlaying onToggle={vi.fn()} />);

    expect(getRecordImage().className).toContain('animate-spin-slow');
    expect(getRecordImage().style.animationPlayState).toBe('running');
  });

  it('appliesTheDropShadowAsAnInlineStyleBecauseTheGlobalDarkModeImgFilterResetOverridesUnlayeredTailwindUtilityClasses', () => {
    const { container } = render(<MusicToggle isPlaying={false} onToggle={vi.fn()} />);
    const image = container.querySelector('img');

    expect(image?.style.filter).toContain('drop-shadow');
  });
});

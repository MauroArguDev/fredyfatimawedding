import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, type TargetAndTransition } from 'framer-motion';

const MS_PER_SECOND = 1000;

const SEAL_CRACK_DURATION_S = 0.4;
const SEAL_SCALE_UP = 1.35;
const SEAL_ROTATE_DEG = -18;

const FLAP_OPEN_DELAY_S = 0.15;
const FLAP_OPEN_DURATION_S = 1;
const FLAP_ROTATE_DEG = 100;

const FADE_DELAY_S = 1;
const FADE_DURATION_S = 0.4;
const FADE_SCALE_UP = 1.05;

const REDUCED_MOTION_FADE_DURATION_S = 0.3;

const TOTAL_OPEN_DURATION_MS = (FADE_DELAY_S + FADE_DURATION_S) * MS_PER_SECOND;
const REDUCED_MOTION_TOTAL_DURATION_MS = REDUCED_MOTION_FADE_DURATION_S * MS_PER_SECOND;

function buildEnvelopeAnimation(
  isOpening: boolean,
  shouldReduceMotion: boolean,
): TargetAndTransition {
  return shouldReduceMotion
    ? { opacity: isOpening ? 0 : 1 }
    : { opacity: isOpening ? 0 : 1, scale: isOpening ? FADE_SCALE_UP : 1 };
}

function buildFlapAnimation(
  isOpening: boolean,
  shouldReduceMotion: boolean,
  direction: 1 | -1,
): TargetAndTransition {
  return shouldReduceMotion ? {} : { rotateY: isOpening ? direction * FLAP_ROTATE_DEG : 0 };
}

function buildSealAnimation(isOpening: boolean, shouldReduceMotion: boolean): TargetAndTransition {
  return shouldReduceMotion
    ? {}
    : {
        opacity: isOpening ? 0 : 1,
        scale: isOpening ? SEAL_SCALE_UP : 1,
        rotate: isOpening ? SEAL_ROTATE_DEG : 0,
      };
}

export function useEnvelopeOpenAnimation(onOpen: () => void) {
  const [isOpening, setIsOpening] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!isOpening) {
      return undefined;
    }

    const duration = shouldReduceMotion ? REDUCED_MOTION_TOTAL_DURATION_MS : TOTAL_OPEN_DURATION_MS;
    const timer = window.setTimeout(() => {
      onOpenRef.current();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpening, shouldReduceMotion]);

  return {
    isOpening,
    handleClick: (): void => {
      if (!isOpening) {
        setIsOpening(true);
      }
    },
    envelopeAnimate: buildEnvelopeAnimation(isOpening, shouldReduceMotion),
    envelopeTransition: shouldReduceMotion
      ? { duration: REDUCED_MOTION_FADE_DURATION_S }
      : { duration: FADE_DURATION_S, delay: FADE_DELAY_S, ease: 'easeIn' },
    leftFlapAnimate: buildFlapAnimation(isOpening, shouldReduceMotion, -1),
    rightFlapAnimate: buildFlapAnimation(isOpening, shouldReduceMotion, 1),
    flapTransition: { duration: FLAP_OPEN_DURATION_S, delay: FLAP_OPEN_DELAY_S, ease: 'easeInOut' },
    sealAnimate: buildSealAnimation(isOpening, shouldReduceMotion),
    sealTransition: { duration: SEAL_CRACK_DURATION_S, ease: 'easeOut' },
  };
}

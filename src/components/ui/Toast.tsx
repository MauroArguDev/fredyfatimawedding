import { useEffect, useRef, type ReactNode } from 'react';

const AUTO_DISMISS_MS = 5000;

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast = ({ message, onDismiss }: ToastProps): ReactNode => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismissRef.current();
    }, AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <p
        role="alert"
        className="w-full max-w-invitation rounded-invitation-sm bg-surface-dark px-4 py-3 text-center text-sm text-text-on-dark shadow-[0_10px_14px_0_rgba(0,0,0,0.3)]"
      >
        {message}
      </p>
    </div>
  );
};

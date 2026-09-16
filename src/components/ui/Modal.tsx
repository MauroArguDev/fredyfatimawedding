import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: ReactNode;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const useDialogController = (
  dialogRef: RefObject<HTMLDialogElement | null>,
  isOpen: boolean,
  onClose: () => void,
): void => {
  const triggerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      triggerRef.current = document.activeElement;
      dialog.showModal();
      const focusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? dialog).focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [dialogRef, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    const handleClose = (): void => {
      onCloseRef.current();
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };

    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [dialogRef]);
};

export const Modal = ({ isOpen, onClose, titleId, title, children }: ModalProps): ReactNode => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useDialogController(dialogRef, isOpen, onClose);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>): void => {
    if (event.key === 'Escape') {
      dialogRef.current?.close();
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="rounded-invitation-sm bg-surface-muted p-6 text-text-body backdrop:bg-black/50"
    >
      <h2 id={titleId} className="text-lg font-bold">
        {title}
      </h2>
      {children}
    </dialog>
  );
};

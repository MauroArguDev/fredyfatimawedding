import type { ReactNode } from 'react';

interface PublicPageContainerProps {
  children: ReactNode;
}

export const PublicPageContainer = ({ children }: PublicPageContainerProps): ReactNode => {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-invitation flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center text-text-body">
      {children}
    </main>
  );
};

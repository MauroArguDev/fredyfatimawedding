import type { ReactNode } from 'react';
import { PublicPageContainer } from '@/components/ui/PublicPageContainer';
import { notFoundCopy } from '@/content/appShell';

const NotFoundPage = (): ReactNode => {
  return (
    <PublicPageContainer>
      <h1 className="text-2xl font-semibold text-text-heading">{notFoundCopy.heading}</h1>
      <p>{notFoundCopy.body}</p>
    </PublicPageContainer>
  );
};

export default NotFoundPage;

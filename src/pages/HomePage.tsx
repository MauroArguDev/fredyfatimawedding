import type { ReactNode } from 'react';
import { PublicPageContainer } from '@/components/ui/PublicPageContainer';
import { homeCopy } from '@/content/appShell';

const HomePage = (): ReactNode => {
  return (
    <PublicPageContainer>
      <h1 className="text-2xl font-semibold text-text-heading">{homeCopy.heading}</h1>
      <p>{homeCopy.body}</p>
    </PublicPageContainer>
  );
};

export default HomePage;

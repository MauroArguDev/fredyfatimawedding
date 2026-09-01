import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/HomePage';
import InvitationPage from '@/pages/invitation/InvitationPage';
import NotFoundPage from '@/pages/NotFoundPage';
import StyleguidePage from '@/pages/StyleguidePage';
import { adminShellCopy } from '@/content/appShell';

const AdminApp = lazy(() => import('@/pages/admin/AdminApp'));
const queryClient = new QueryClient();

export const App = (): ReactNode => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/i/:token" element={<InvitationPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<p>{adminShellCopy.loading}</p>}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

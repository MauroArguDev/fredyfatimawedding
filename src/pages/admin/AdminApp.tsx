import type { ReactNode } from 'react';
import { adminShellCopy } from '@/content/appShell';

const AdminApp = (): ReactNode => {
  return (
    <main className="p-8">
      <p>{adminShellCopy.placeholder}</p>
    </main>
  );
};

export default AdminApp;

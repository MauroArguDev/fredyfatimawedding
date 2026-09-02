import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/admin/primitives/button';
import { downloadGuestsExport } from '@/components/admin/guests/exportGuestsCsv';
import { resolveAdminApiErrorMessage } from '@/components/admin/guests/resolveAdminApiErrorMessage';
import { adminGuestsExportCopy } from '@/content/adminGuests';

export const ExportGuestsButton = (): ReactNode => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsDownloading(true);

    try {
      await downloadGuestsExport();
    } catch (error) {
      toast.error(resolveAdminApiErrorMessage(error) ?? adminGuestsExportCopy.error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isDownloading}
      onClick={() => {
        void handleClick();
      }}
    >
      {isDownloading ? adminGuestsExportCopy.downloading : adminGuestsExportCopy.trigger}
    </Button>
  );
};

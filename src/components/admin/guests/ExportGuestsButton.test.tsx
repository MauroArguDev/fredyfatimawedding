import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportGuestsButton } from '@/components/admin/guests/ExportGuestsButton';
import { downloadGuestsExport } from '@/components/admin/guests/exportGuestsCsv';
import { adminGuestsExportCopy } from '@/content/adminGuests';

const { toastErrorMock } = vi.hoisted(() => ({ toastErrorMock: vi.fn() }));

vi.mock('@/components/admin/guests/exportGuestsCsv', () => ({ downloadGuestsExport: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: toastErrorMock } }));

const downloadGuestsExportMock = vi.mocked(downloadGuestsExport);

describe('ExportGuestsButton', () => {
  it('triggersTheDownloadWhenClicked', async () => {
    downloadGuestsExportMock.mockResolvedValue(undefined);
    render(<ExportGuestsButton />);

    await userEvent.click(screen.getByRole('button', { name: adminGuestsExportCopy.trigger }));

    await waitFor(() => {
      expect(downloadGuestsExport).toHaveBeenCalledTimes(1);
    });
  });

  it('showsAnErrorToastAndReEnablesTheButtonWhenTheDownloadFails', async () => {
    downloadGuestsExportMock.mockRejectedValue(new Error('network down'));
    render(<ExportGuestsButton />);

    const button = screen.getByRole('button', { name: adminGuestsExportCopy.trigger });
    await userEvent.click(button);

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
    expect(button).toBeEnabled();
  });
});

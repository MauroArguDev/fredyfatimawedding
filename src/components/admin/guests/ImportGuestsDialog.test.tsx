import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ImportGuestsDialog } from '@/components/admin/guests/ImportGuestsDialog';
import { fetchAdminApi } from '@/components/admin/auth/fetchAdminApi';
import { adminGuestsImportCopy } from '@/content/adminGuests';

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/components/admin/auth/fetchAdminApi', () => ({ fetchAdminApi: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: toastSuccessMock, error: toastErrorMock } }));

const fetchAdminApiMock = vi.mocked(fetchAdminApi);

function renderDialog() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ImportGuestsDialog />
    </QueryClientProvider>,
  );
}

async function openDialogAndSelectFile(
  content = 'firstName,lastName,titleLabel,guestLimit,phone\n',
): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: adminGuestsImportCopy.trigger }));
  const file = new File([content], 'guests.csv', { type: 'text/csv' });
  await userEvent.upload(screen.getByLabelText(adminGuestsImportCopy.fileLabel), file);
}

describe('ImportGuestsDialog', () => {
  it('keepsTheSubmitButtonDisabledUntilAFileIsSelected', async () => {
    renderDialog();

    await userEvent.click(screen.getByRole('button', { name: adminGuestsImportCopy.trigger }));

    expect(screen.getByRole('button', { name: adminGuestsImportCopy.submit })).toBeDisabled();
  });

  it('enablesSubmitOnceAFileIsSelectedAndSendsItsTextToTheServer', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(JSON.stringify({ imported: 2, skipped: 1 }), { status: 200 }),
    );
    renderDialog();
    await openDialogAndSelectFile(
      'firstName,lastName,titleLabel,guestLimit,phone\nOrlando,,,3,+50370000000\n',
    );

    await userEvent.click(screen.getByRole('button', { name: adminGuestsImportCopy.submit }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    });
    const [, init] = vi.mocked(fetchAdminApi).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { csv: string };
    expect(body.csv).toContain('Orlando');
  });

  it('showsTheRowErrorsInsideTheDialogWhenTheServerRejectsTheCsv', async () => {
    fetchAdminApiMock.mockResolvedValue(
      new Response(
        JSON.stringify({ code: 'INVALID_CSV', errors: [{ row: 2, message: 'Phone is invalid' }] }),
        { status: 400 },
      ),
    );
    renderDialog();
    await openDialogAndSelectFile();

    await userEvent.click(screen.getByRole('button', { name: adminGuestsImportCopy.submit }));

    await waitFor(() => {
      expect(screen.getByText(/Phone is invalid/)).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

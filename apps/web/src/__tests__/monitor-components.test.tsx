import { randomUUID } from 'node:crypto';
import { fireEvent, render, screen } from '@testing-library/react';
import { WatchForm } from '@/components/monitor/watch-form';
import { apiFetch } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  apiErrorMessage: (error: Error) => error.message,
}));

Object.defineProperty(globalThis.crypto, 'randomUUID', { configurable: true, value: randomUUID });

describe('Monitor watch form', () => {
  it('rejects an invalid Stellar address before submitting to the API', async () => {
    const onAdd = jest.fn();
    render(<WatchForm open onAdd={onAdd} onClose={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('G..., C..., or name*domain.com'), {
      target: { value: 'invalid' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start watching' }));

    expect(await screen.findByText(/enter a valid stellar account/i)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows transaction-count fields and removes them with the alert rule', () => {
    render(<WatchForm open onAdd={jest.fn()} onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add rule' }));
    const typeOption = screen.getByRole('option', { name: 'Transaction count reaches' });
    fireEvent.change(typeOption.closest('select')!, { target: { value: 'transaction_count' } });

    expect(screen.getByPlaceholderText('Transaction count')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/window in minutes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove rule' }));
    expect(screen.queryByPlaceholderText('Transaction count')).not.toBeInTheDocument();
  });
});

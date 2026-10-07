import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProductImportView } from './ProductImportView';
import { ADMIN_USER, json, mockFetch, sessionFor, storeSession } from '../../test/fetchMock';

beforeEach(() => storeSession(sessionFor(ADMIN_USER)));

test('shows the report returned by POST /admin/import and stores nothing locally', async () => {
  mockFetch({
    'POST /admin/import': () =>
      json(
        {
          status: 'completed',
          report: {
            generated_at: '2026-10-06T10:00:00.000Z',
            mode: 'import',
            source_status: 'passed',
            import_status: 'completed',
            import_stats: { products_changed: 3, products_removed: 0 },
            validation: {
              status: 'failed',
              rows_per_table: { products: 89 },
              assertions: { duplicate_model: true, orphan_media: false },
            },
          },
        },
        201
      ),
  });
  const onImportComplete = jest.fn();
  render(<ProductImportView onImportComplete={onImportComplete} />);

  fireEvent.click(screen.getByRole('button', { name: /Trigger Server Import/ }));

  expect(await screen.findByText('Import xong nhưng kiểm tra dữ liệu chưa đạt')).toBeInTheDocument();
  expect(screen.getByText('products_changed').nextSibling).toHaveTextContent('3');
  expect(screen.getByText('products').nextSibling).toHaveTextContent('89');
  expect(screen.getByRole('alert')).toHaveTextContent('Kiểm tra không đạt: orphan_media');
  expect(onImportComplete).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  expect(Object.keys(localStorage)).toEqual(['reeco_admin_session']);
});

test('a running import is reported as such', async () => {
  mockFetch({ 'POST /admin/import': () => json({ message: 'A product import is already running' }, 409) });
  render(<ProductImportView />);

  fireEvent.click(screen.getByRole('button', { name: /Trigger Server Import/ }));

  expect(await screen.findByText('Import đang chạy')).toBeInTheDocument();
  expect(screen.getByText('Một tiến trình import đang chạy. Vui lòng thử lại sau.')).toBeInTheDocument();
});

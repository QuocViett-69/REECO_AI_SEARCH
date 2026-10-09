import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductImportView } from './ProductImportView';

test('demo import is read-only and offers no write action', () => {
  render(<ProductImportView />);
  expect(screen.getByRole('note')).toHaveTextContent('read-only');
  expect(screen.queryByRole('button')).toBeNull();
});

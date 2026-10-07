import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OrderListView, SEARCH_DEBOUNCE_MS } from './OrderListView';
import { OrderDetailView } from './OrderDetailView';
import { ADMIN_USER, json, makeOrder, mockFetch, sessionFor, storeSession } from '../../test/fetchMock';

beforeEach(() => storeSession(sessionFor(ADMIN_USER)));

function renderDetail(orderId = 'REECO-1001') {
  return render(
    <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrderListView', () => {
  test('debounces search by 300ms and resets to page 1', async () => {
    jest.useFakeTimers();
    const calls = mockFetch({ 'GET /admin/orders': () => json({ items: [makeOrder()], total: 45 }) });
    render(
      <MemoryRouter initialEntries={['/orders?page=2']}>
        <OrderListView />
      </MemoryRouter>
    );
    await act(async () => {});
    expect(calls).toHaveLength(1);
    expect(calls[0].query.get('page')).toBe('2');

    const input = screen.getByLabelText('Tìm đơn hàng');
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.change(input, { target: { value: 'ha' } });
    fireEvent.change(input, { target: { value: 'hai' } });
    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(calls).toHaveLength(1);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(calls).toHaveLength(2);
    expect(calls[1].query.get('search')).toBe('hai');
    expect(calls[1].query.get('page')).toBe('1');
    jest.useRealTimers();
  });

  test('filters by status, pages through results and shows every column', async () => {
    const calls = mockFetch({ 'GET /admin/orders': () => json({ items: [makeOrder()], total: 45 }) });
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <OrderListView />
      </MemoryRouter>
    );

    const row = (await screen.findByRole('link', { name: 'REECO-1001' })).closest('tr');
    expect(within(row).getByText('Hai Tran')).toBeInTheDocument();
    expect(within(row).getByText('haitran@example.com')).toBeInTheDocument();
    expect(within(row).getByText('COD')).toBeInTheDocument();
    expect(within(row).getByText(/13\.460\.000/)).toBeInTheDocument();
    expect(within(row).getByText('Đang xử lý')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Mã đơn',
      'Khách hàng',
      'Ngày đặt',
      'Sản phẩm',
      'Thanh toán',
      'Tổng tiền',
      'Trạng thái',
      '',
    ]);
    expect(screen.getByText('Trang 1 / 3')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Lọc trạng thái'), { target: { value: 'SHIPPED' } });
    await waitFor(() => expect(calls.at(-1).query.get('status')).toBe('SHIPPED'));

    await waitFor(() => expect(screen.getByLabelText('Trang sau')).toBeEnabled());
    fireEvent.click(screen.getByLabelText('Trang sau'));
    await waitFor(() => expect(calls.at(-1).query.get('page')).toBe('2'));
    expect(calls.at(-1).query.get('status')).toBe('SHIPPED');
  });

  test('shows the API error instead of an empty list', async () => {
    mockFetch({ 'GET /admin/orders': () => json({ message: 'Lỗi tải danh sách đơn hàng quản trị' }, 503) });
    render(
      <MemoryRouter>
        <OrderListView />
      </MemoryRouter>
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/Server không khả dụng/);
  });
});

describe('OrderDetailView', () => {
  test('shows customer, address, items and status history', async () => {
    mockFetch({ 'GET /admin/orders/REECO-1001': () => json(makeOrder()) });
    renderDetail();

    expect(await screen.findByText('Đơn REECO-1001', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('+84 908 123 456')).toBeInTheDocument();
    expect(screen.getByText('12 Nguyen Hue, Ho Chi Minh, HCM, Vietnam')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CS655' })).toHaveAttribute('href', '/products/CSI_CS655');
    expect(screen.getByText('Chờ thanh toán → Đang xử lý')).toBeInTheDocument();
  });

  test('the dropdown lists only the transitions allowed from the current status', async () => {
    mockFetch({ 'GET /admin/orders/REECO-1001': () => json(makeOrder({ status: 'PROCESSING' })) });
    renderDetail();

    const select = await screen.findByLabelText('Chuyển sang trạng thái');
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.value)
      .filter(Boolean);
    expect(options).toEqual(['FORWARDED_TO_MANUFACTURER', 'SHIPPED', 'CANCELLED']);
  });

  test('a final status has no dropdown', async () => {
    mockFetch({ 'GET /admin/orders/REECO-1001': () => json(makeOrder({ status: 'DELIVERED' })) });
    renderDetail();

    expect(await screen.findByText(/không thể chuyển tiếp/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Chuyển sang trạng thái')).toBeNull();
  });

  test('saves the status with the note and reloads the order', async () => {
    let status = 'PROCESSING';
    const calls = mockFetch({
      'GET /admin/orders/REECO-1001': () => json(makeOrder({ status })),
      'PATCH /admin/orders/REECO-1001/status': ({ body }) => {
        status = body.status;
        return json(makeOrder({ status }));
      },
    });
    renderDetail();

    fireEvent.change(await screen.findByLabelText('Chuyển sang trạng thái'), { target: { value: 'FORWARDED_TO_MANUFACTURER' } });
    fireEvent.change(screen.getByLabelText('Ghi chú (không bắt buộc)'), { target: { value: 'PO-77' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));

    expect(await screen.findByText('Đã chuyển đơn sang "Đã chuyển hãng".')).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'PATCH').body).toEqual({ status: 'FORWARDED_TO_MANUFACTURER', note: 'PO-77' });
    expect(calls.filter((c) => c.method === 'GET')).toHaveLength(2);
    const options = within(screen.getByLabelText('Chuyển sang trạng thái'))
      .getAllByRole('option')
      .map((option) => option.value)
      .filter(Boolean);
    expect(options).toEqual(['SHIPPED', 'CANCELLED']);
  });

  test('CANCELLED asks for confirmation and does nothing when declined', async () => {
    const calls = mockFetch({
      'GET /admin/orders/REECO-1001': () => json(makeOrder()),
      'PATCH /admin/orders/REECO-1001/status': () => json(makeOrder({ status: 'CANCELLED' })),
    });
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderDetail();

    fireEvent.change(await screen.findByLabelText('Chuyển sang trạng thái'), { target: { value: 'CANCELLED' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('REECO-1001'));
    expect(calls.some((c) => c.method === 'PATCH')).toBe(false);

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PATCH')).toBe(true));
  });

  test('a 409 from the API shows the allowed statuses', async () => {
    mockFetch({
      'GET /admin/orders/REECO-1001': () => json(makeOrder()),
      'PATCH /admin/orders/REECO-1001/status': () =>
        json({ message: 'Không thể chuyển trạng thái từ "SHIPPED" sang "FORWARDED_TO_MANUFACTURER".', allowed_statuses: ['DELIVERED', 'CANCELLED'] }, 409),
    });
    renderDetail();

    fireEvent.change(await screen.findByLabelText('Chuyển sang trạng thái'), { target: { value: 'FORWARDED_TO_MANUFACTURER' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu trạng thái' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Trạng thái hợp lệ: Đã giao hàng, Đã hủy.');
  });
});

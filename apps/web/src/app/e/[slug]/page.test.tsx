import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Event, PublicTicketType } from '@/lib/api/events';

const usePublicEvent = vi.fn();
const register = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'wedding' }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/hooks/use-events', () => ({
  usePublicEvent: (slug: string) => usePublicEvent(slug),
}));
vi.mock('@/lib/api/registration', () => ({
  registrationApi: { register: (...args: unknown[]) => register(...args) },
}));

import PublicEventPageRoute from './page';

function ticket(overrides: Partial<PublicTicketType> = {}): PublicTicketType {
  return {
    id: 'tt-general',
    name: 'General Admission',
    price: '0',
    currency: 'ZAR',
    quantity: null,
    quantitySold: 0,
    maxPerOrder: 10,
    minPerOrder: 1,
    isVisible: true,
    ...overrides,
  };
}

function event(ticketTypes: PublicTicketType[]): Event {
  return {
    id: 'evt-1',
    name: 'Wedding',
    slug: 'wedding',
    type: 'IN_PERSON',
    status: 'PUBLISHED',
    startDate: '2026-09-19T08:08:00.000Z',
    endDate: '2026-09-19T16:00:00.000Z',
    timezone: 'Africa/Johannesburg',
    organizationId: 'org-1',
    createdAt: '2026-09-12T00:00:00.000Z',
    updatedAt: '2026-09-12T00:00:00.000Z',
    ticketTypes,
  };
}

describe('Public event registration', () => {
  beforeEach(() => {
    usePublicEvent.mockReset();
    register.mockReset();
  });

  it('explains that registration is closed when the event has no ticket types', () => {
    usePublicEvent.mockReturnValue({ data: event([]), isLoading: false, error: null });
    render(<PublicEventPageRoute />);

    expect(screen.getByText(/Registration is not open yet/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Confirm registration/i })).toBeNull();
    expect(screen.queryByLabelText(/Ticket type/i)).toBeNull();
  });

  it('lists ticket types in a dropdown, disabling sold-out ones', () => {
    usePublicEvent.mockReturnValue({
      data: event([
        ticket({ id: 'tt-vip', name: 'VIP', price: '1500', quantity: 10, quantitySold: 10 }),
        ticket(),
      ]),
      isLoading: false,
      error: null,
    });
    render(<PublicEventPageRoute />);

    const select = screen.getByLabelText(/Ticket type/i) as HTMLSelectElement;
    const options = Array.from(select.options);
    expect(options.map((o) => o.textContent)).toEqual([
      'VIP · ZAR 1,500 (sold out)',
      'General Admission · Free',
    ]);
    expect(options[0]?.disabled).toBe(true);
    expect(select.value).toBe('tt-general');
    expect(screen.getByRole('button', { name: /Confirm registration/i })).toBeTruthy();
  });

  it('submits the selected ticket type with the attendee details', async () => {
    usePublicEvent.mockReturnValue({
      data: event([ticket(), ticket({ id: 'tt-vip', name: 'VIP', price: '1500' })]),
      isLoading: false,
      error: null,
    });
    register.mockResolvedValue({ status: 'requires_payment', orderId: 'ord-1', checkoutUrl: null });
    render(<PublicEventPageRoute />);

    fireEvent.change(screen.getByLabelText(/Ticket type/i), { target: { value: 'tt-vip' } });
    expect(screen.getByRole('button', { name: /Continue to payment/i })).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'Vuyo' } });
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Ndzukuma' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'vuyo@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    expect(register).toHaveBeenCalledWith('evt-1', {
      ticketTypeId: 'tt-vip',
      attendees: [
        {
          firstName: 'Vuyo',
          lastName: 'Ndzukuma',
          email: 'vuyo@example.com',
          phone: undefined,
          company: undefined,
        },
      ],
    });
  });
});

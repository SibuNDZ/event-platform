import type { PublicTicketType } from '@/lib/api/events';

export function isSoldOut(ticket: PublicTicketType): boolean {
  return ticket.quantity != null && ticket.quantitySold >= ticket.quantity;
}

export function formatTicketPrice(ticket: PublicTicketType): string {
  const price = Number(ticket.price);
  if (!price) return 'Free';
  return `${ticket.currency} ${price.toLocaleString()}`;
}

export function ticketOptionLabel(ticket: PublicTicketType): string {
  const label = `${ticket.name} · ${formatTicketPrice(ticket)}`;
  return isSoldOut(ticket) ? `${label} (sold out)` : label;
}

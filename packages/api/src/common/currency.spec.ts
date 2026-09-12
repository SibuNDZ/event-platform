import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { ISO_CURRENCY_CODE, normalizeCurrency } from './currency';
import { CreateEventDto, UpdateEventDto } from '../modules/events/dto/event.dto';
import { CreateTicketTypeDto } from '../modules/registration/dto/ticket-type.dto';
import { UpdateOrganizationDto } from '../modules/organizations/dto/update-organization.dto';

describe('currency', () => {
  it('accepts 3-letter codes in any case and rejects anything else', () => {
    expect(ISO_CURRENCY_CODE.test('ZAR')).toBe(true);
    expect(ISO_CURRENCY_CODE.test('usd')).toBe(true);
    expect(ISO_CURRENCY_CODE.test('ZAR 1200')).toBe(false);
    expect(ISO_CURRENCY_CODE.test('R')).toBe(false);
    expect(ISO_CURRENCY_CODE.test('')).toBe(false);
  });

  it('normalizes to uppercase and passes undefined through', () => {
    expect(normalizeCurrency(' zar ')).toBe('ZAR');
    expect(normalizeCurrency(undefined)).toBeUndefined();
  });

  const eventBase = {
    name: 'Wedding',
    startDate: '2026-09-19T08:00:00Z',
    endDate: '2026-09-19T16:00:00Z',
  };

  it.each([
    ['CreateEventDto', CreateEventDto, eventBase],
    ['UpdateEventDto', UpdateEventDto, {}],
    ['CreateTicketTypeDto', CreateTicketTypeDto, { name: 'General', price: 0 }],
    ['UpdateOrganizationDto', UpdateOrganizationDto, {}],
  ])('%s rejects a currency that is not a 3-letter code', async (_name, Dto, base) => {
    const bad = await validate(plainToInstance(Dto, { ...base, currency: 'ZAR 1200' }));
    expect(bad.some((e) => e.property === 'currency')).toBe(true);

    const good = await validate(plainToInstance(Dto, { ...base, currency: 'zar' }));
    expect(good.some((e) => e.property === 'currency')).toBe(false);
  });
});

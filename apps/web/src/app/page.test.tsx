import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Landing page', () => {
  it('describes the shipped organizer workflow instead of unused enterprise features', () => {
    render(<Home />);

    expect(screen.getByText(/working event workspace/i)).toBeTruthy();
    expect(screen.getByText(/Create and publish events/i)).toBeTruthy();
    expect(screen.getByText(/QR check-in/i)).toBeTruthy();
    expect(screen.queryByText('Summit Series 2026')).toBeNull();
    expect(screen.queryByText('R8.7M')).toBeNull();
    expect(screen.queryByText(/SSO, and API keys for the rest of your stack/i)).toBeNull();
  });
});

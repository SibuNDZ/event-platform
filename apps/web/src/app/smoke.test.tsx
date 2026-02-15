import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Web App Smoke Test', () => {
    it('should render a heading', () => {
        render(<h1>Hello World</h1>);
        const heading = screen.getByText('Hello World');
        expect(heading).toBeDefined();
    });
});

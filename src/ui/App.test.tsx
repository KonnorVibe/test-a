import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('App', () => {
  it('renders the Today preview with a statement and the ring', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Periode in 5 Tagen');
    expect(screen.getByRole('img', { name: /Zyklustag 25/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Periode begonnen' })).toBeTruthy();
  });
});

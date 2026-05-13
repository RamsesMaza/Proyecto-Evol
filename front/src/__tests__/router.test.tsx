import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from '../routes/AppRouter';

describe('AppRouter', () => {
  it('should render home page on root route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(await screen.findByText(/¿Por qué trabajar con nosotros/i)).toBeInTheDocument();
  });

  it('should show 404 for unknown routes', async () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(await screen.findByText(/404 - No encontrado/i)).toBeInTheDocument();
  });
});

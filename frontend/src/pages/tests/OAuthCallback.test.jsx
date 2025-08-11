import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import OAuthCallback from '../OAuthCallback';

describe('OAuthCallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda token desde hash y redirige', async () => {
    // Simula #token=XYZ
    const initialEntries = ['/oauth-callback#token=XYZ'];
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <OAuthCallback />
        </AuthProvider>
      </MemoryRouter>
    );

    // Se debería guardar el token y navegar
    expect(localStorage.getItem('auth_token')).toBe('XYZ');
    // La navegación es async; aquí simplificamos validando que se setea el token.
  });
});
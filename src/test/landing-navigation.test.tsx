import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PLATFORM_URL } from '@/components/landing-demos';

const auth = vi.hoisted(() => ({ user: null as { id: string } | null, loading: false }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));
afterEach(() => { cleanup(); auth.user = null; });

function openDashboard() {
  render(<MemoryRouter initialEntries={['/dashboard']}><Routes>
    <Route path="/dashboard" element={<ProtectedRoute><div>Learning home</div></ProtectedRoute>} />
    <Route path="/auth" element={<div>Account access</div>} />
  </Routes></MemoryRouter>);
}

describe('landing and dashboard destinations', () => {
  it('links landing account actions to /auth', () => {
    expect(PLATFORM_URL).toBe('/auth');
  });
  it('keeps /dashboard inaccessible without a session', () => {
    openDashboard();
    expect(screen.queryByText('Learning home')).toBeNull();
    expect(screen.getByText('Account access')).toBeInTheDocument();
  });
  it('allows signed-in learners to reach /dashboard', () => {
    auth.user = { id: 'learner' };
    openDashboard();
    expect(screen.getByText('Learning home')).toBeInTheDocument();
    expect(screen.queryByText('Account access')).toBeNull();
  });
});
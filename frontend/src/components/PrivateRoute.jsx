/**
 * frontend/src/components/PrivateRoute.jsx
 * Client-side route guard. Verifies the session via a server call (not by
 * reading any token — tokens live in httpOnly cookies the JS can't see).
 *
 * Security note: Prevents unauthenticated/unauthorized users from reaching
 * protected screens. NOTE: this is UX enforcement only — the API must ALWAYS
 * re-check auth server-side; never trust the client guard alone.
 *
 * Env variables: none.
 */

import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../utils/api';

/**
 * Usage:
 *   <Route element={<PrivateRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */
export default function PrivateRoute({ allowedRoles }) {
  const location = useLocation();
  const [status, setStatus] = useState('checking'); // checking | authed | denied
  const [role, setRole] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Server reads the httpOnly cookie and returns the current user.
        const { data } = await api.get('/auth/me');
        if (!active) return;
        setRole(data?.user?.role || null);
        setStatus('authed');
      } catch {
        if (active) setStatus('denied');
      }
    })();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (status === 'checking') {
    return <div role="status" aria-live="polite">Checking access…</div>;
  }

  if (status === 'denied') {
    // Redirect to login, preserving where the user was headed.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Optional role gate.
  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

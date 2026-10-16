import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { roleHasPermission, type DataResponse, type LoginInput, type Permission, type PrincipalDto, type SessionDto } from '@mytutor/contracts';
import { apiRequest, setCsrfToken, setUnauthenticatedHandler } from '../../lib/api';

export const SESSION_KEY = ['session'] as const;

interface SessionContextValue {
  user: PrincipalDto | null;
  isLoading: boolean;
  can(permission: Permission): boolean;
  login(input: LoginInput): Promise<PrincipalDto>;
  logout(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchSession(): Promise<SessionDto | null> {
  const res = await apiRequest<DataResponse<SessionDto | null>>('/auth/session', { silentAuth: true });
  return res.data;
}

/**
 * Resolves the signed-in user from the server (cookie session). Role information here only
 * decides what to display; every protected operation is authorized by the API.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: SESSION_KEY, queryFn: fetchSession, staleTime: 5 * 60_000, retry: false });
  const session = query.data ?? null;

  useEffect(() => {
    setCsrfToken(session?.csrfToken ?? null);
  }, [session]);

  const clear = useCallback(() => {
    setCsrfToken(null);
    queryClient.setQueryData(SESSION_KEY, null);
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] === 'admin' });
  }, [queryClient]);

  useEffect(() => {
    // Any 401 from a protected call means the session ended (expired, revoked, deactivated).
    setUnauthenticatedHandler(clear);
    return () => setUnauthenticatedHandler(null);
  }, [clear]);

  const login = useCallback(
    async (input: LoginInput) => {
      const res = await apiRequest<DataResponse<SessionDto>>('/auth/login', { method: 'POST', body: input, silentAuth: true });
      setCsrfToken(res.data.csrfToken);
      queryClient.setQueryData(SESSION_KEY, res.data);
      return res.data.user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/auth/logout', { method: 'POST', body: {}, silentAuth: true });
    } finally {
      clear();
    }
  }, [clear]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: session?.user ?? null,
      isLoading: query.isPending,
      can: (permission) => (session ? roleHasPermission(session.user.role, permission) : false),
      login,
      logout,
    }),
    [session, query.isPending, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

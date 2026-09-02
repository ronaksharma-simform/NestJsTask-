import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import {
  authApi,
  readStoredUser,
  storeUser,
  type LoginPayload,
  type RegisterPayload,
} from '../services/api';

interface AuthContextValue {
  user: User | null;
  /** True until the locally persisted session has been restored. */
  initializing: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setInitializing(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const { user: loggedInUser } = await authApi.login(payload);
    storeUser(loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const { user: createdUser } = await authApi.register(payload);
      storeUser(createdUser);
      setUser(createdUser);
      return createdUser;
    },
    [],
  );

  const logout = useCallback(() => {
    storeUser(null);
    setUser(null);
    // The API keeps the session in the accessToken cookie (path "/"). Expire
    // it for the current origin so it is not sent anymore.
    document.cookie = 'accessToken=; Max-Age=0; path=/';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}

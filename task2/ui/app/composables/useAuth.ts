import { useApi } from './useApi'
import type { Login, Signup } from '~/types';

export const useAuth = () => {
  const api = useApi();
  const user = useState<any>('user', () => null);
  const fetched = useState('auth_fetched', () => false);
  const error = useState<string | null>('auth_error', () => null);
  const loading = useState<boolean>('auth_loading', () => false);
  const isAuthenticated = computed(() => !!user.value);

  const fetchUser = async () => {
    if (fetched.value) return;
    fetched.value = true;
    try {
      user.value = await api('/me');
    } catch {
      user.value = null;
    }
  };

  const login = async (data: Login) => {
    const empty = Object.values(data).some(v => v.trim() === '');
    if (empty) { error.value = 'All fields are required'; return; }

    loading.value = true;
    error.value = null;
    try {
      user.value = await api('/login', { method: 'POST', body: data });
      await navigateTo('/');
    } catch (err: any) {
      user.value = null;
      error.value = err?.data?.message || 'Login failed';
    } finally {
      loading.value = false;
    }
  };

  const signup = async (data: Signup) => {
    const empty = Object.values(data).some(v => v.trim() === '');
    if (empty) { error.value = 'All fields are required'; return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) { error.value = 'Invalid email address'; return; }

    loading.value = true;
    error.value = null;
    try {
      user.value = await api('/signup', { method: 'POST', body: data });
      await navigateTo('/');
    } catch (err: any) {
      error.value = err?.data?.message || 'Registration failed';
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api('/logout', { method: 'POST' });
    } catch {}
    user.value = null;
    fetched.value = false;
    await navigateTo('/login');
  };

  return { user, isAuthenticated, fetchUser, login, signup, logout, error, loading };
};

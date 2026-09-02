// Auth store — backed by localStorage + custom event
import { useEffect, useState, useCallback } from 'react';
import api from './api';

const TOKEN_KEY = 'starvnt_token';
const USER_KEY = 'starvnt_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('starvnt:auth-changed'));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('starvnt:auth-changed'));
}

export async function login({ email, password }) {
  const { data } = await api.post('/identity/auth/login', { email, password });
  persistSession(data.data.token, data.data.user);
  return data.data.user;
}

export async function register(payload) {
  const { data } = await api.post('/identity/auth/register', payload);
  persistSession(data.data.token, data.data.user);
  return data.data.user;
}

export function logout() {
  clearSession();
}

export function useAuth() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener('starvnt:auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('starvnt:auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) return null;
    setLoading(true);
    try {
      const { data } = await api.get('/identity/me');
      const fresh = data.data;
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      setUser(fresh);
      return fresh;
    } catch {
      clearSession();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, refresh, login, register, logout };
}

export function isCustomer(user) {
  return user && user.role === 'CUSTOMER';
}
export function isAdmin(user) {
  return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
}
export function isPartner(user) {
  return user && (user.role === 'PARTNER_OWNER' || user.role === 'PARTNER_STAFF');
}

import * as SecureStore from 'expo-secure-store';

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
let token = null;

export async function loadToken() {
  token = await SecureStore.getItemAsync('token');
  return token;
}

export async function saveToken(value) {
  token = value;
  if (value) await SecureStore.setItemAsync('token', value);
  else await SecureStore.deleteItemAsync('token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(
      err.name === 'AbortError'
        ? 'Server terlalu lama merespons'
        : 'Tidak dapat terhubung ke server'
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Terjadi kesalahan');
    error.status = res.status;
    throw error;
  }
  return data;
}
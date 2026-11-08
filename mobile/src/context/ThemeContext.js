import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { palettes } from '../theme';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const system = useColorScheme();
  const [theme, setTheme] = useState(system === 'dark' ? 'dark' : 'light');

  // Ambil pilihan tema yang tersimpan di perangkat
  useEffect(() => {
    AsyncStorage.getItem('theme').then((t) => {
      if (t === 'dark' || t === 'light') setTheme(t);
    });
  }, []);

  // Saat login, pakai preferensi dari database
  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
      AsyncStorage.setItem('theme', user.theme);
    }
  }, [user]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    AsyncStorage.setItem('theme', next);
    if (user) api('/auth/theme', { method: 'PATCH', body: { theme: next } }).catch(() => {});
  }

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', colors: palettes[theme], toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
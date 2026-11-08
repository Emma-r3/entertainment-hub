import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import LoginModal from '../components/LoginModal';

const LibraryContext = createContext(null);
const keyOf = (item) => `${item.type}:${item.id}`;

function payload(item) {
  return {
    contentId: item.id,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl || null,
  };
}

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [watched, setWatched] = useState(new Set());
  const [favorites, setFavorites] = useState({}); // "type:id" _id favorit
  const [ready, setReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState('');
  const pending = useRef(new Set());
  const toastTimer = useRef(null);

  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }

  // Muat data personal saat login, kosongkan saat logout
  useEffect(() => {
    setReady(false);
    if (!user) {
      setWatched(new Set());
      setFavorites({});
      return;
    }
    Promise.all([api('/watched/ids'), api('/favorites')])
      .then(([w, f]) => {
        setWatched(new Set(w.ids));
        const map = {};
        f.favorites.forEach((x) => {
          map[`${x.type}:${x.contentId}`] = x._id;
        });
        setFavorites(map);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [user?.id]);

  const isWatched = (item) => watched.has(keyOf(item));
  const isFavorite = (item) => Boolean(favorites[keyOf(item)]);

  async function toggleWatched(item) {
    if (!user) return setShowLogin(true);
    const k = keyOf(item);
    if (pending.current.has(`w:${k}`)) return;
    pending.current.add(`w:${k}`);

    try {
      const d = await api('/watched/toggle', { method: 'POST', body: payload(item) });
      setWatched((prev) => {
        const next = new Set(prev);
        if (d.watched) next.add(k);
        else next.delete(k);
        return next;
      });
      const verb = item.type === 'music' ? 'didengar' : 'ditonton';
      notify(d.watched ? `Ditandai sudah ${verb}` : `Ditandai belum ${verb}`);
    } catch (err) {
      notify(err.message);
    } finally {
      pending.current.delete(`w:${k}`);
    }
  }

  async function toggleFavorite(item) {
    if (!user) return setShowLogin(true);
    const k = keyOf(item);
    if (pending.current.has(`f:${k}`)) return;
    pending.current.add(`f:${k}`);

    try {
      if (favorites[k]) {
        await api(`/favorites/${favorites[k]}`, { method: 'DELETE' });
        setFavorites((prev) => {
          const next = { ...prev };
          delete next[k];
          return next;
        });
        notify('Dihapus dari favorit');
      } else {
        const d = await api('/favorites', { method: 'POST', body: payload(item) });
        setFavorites((prev) => ({ ...prev, [k]: d.favorite._id }));
        notify('Ditambahkan ke favorit');
      }
    } catch (err) {
      notify(err.message);
    } finally {
      pending.current.delete(`f:${k}`);
    }
  }

  const value = {
    ready,
    watched,
    favorites,
    isWatched,
    isFavorite,
    toggleWatched,
    toggleFavorite,
    notify,
    requireLogin: () => setShowLogin(true),
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {toast ? (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[styles.toastWrap, { bottom: insets.bottom + 80 }]}
        >
          <View style={[styles.toast, { backgroundColor: colors.text }]}>
            <Text style={{ color: colors.bg, fontSize: 14 }}>{toast}</Text>
          </View>
        </View>
      ) : null}
    </LibraryContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
});

export const useLibrary = () => useContext(LibraryContext);
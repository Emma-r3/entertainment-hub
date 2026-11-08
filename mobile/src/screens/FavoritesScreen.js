import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import ContentSection from '../components/ContentSection';
import GuestPrompt from '../components/GuestPrompt';

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'movie', label: 'Film' },
  { key: 'tv', label: 'Serial' },
  { key: 'music', label: 'Musik' },
];

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, ready } = useLibrary();
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    api('/favorites')
      .then((d) => {
        const items = d.favorites.map((f) => ({
          id: f.contentId,
          type: f.type,
          title: f.title,
          posterUrl: f.posterUrl,
        }));
        setState({ items, loading: false, error: '' });
      })
      .catch((err) => setState({ items: [], loading: false, error: err.message }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load])
  );

  if (!user) {
    return (
      <GuestPrompt
        icon="heart-outline"
        title="Simpan favoritmu"
        text="Masuk untuk menyimpan film, serial, dan musik yang kamu suka."
      />
    );
  }

  // Hanya tampilkan yang masih berstatus favorit
  const visible = state.items.filter(
    (i) => isFavorite(i) && (filter === 'all' || i.type === filter)
  );
  const loading = state.loading || !ready;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.head}>
          <Text style={[styles.h1, { color: colors.text }]} accessibilityRole="header">
            Favorit saya
          </Text>
          <Text style={{ color: colors.text2 }}>{loading ? 'Memuat...' : `${visible.length} konten`}</Text>
        </View>

        <View style={styles.chips} accessibilityRole="tablist">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface2,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.onPrimary : colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ContentSection
          layout="grid"
          items={visible}
          loading={loading}
          error={state.error}
          onRetry={() => {
            setState((s) => ({ ...s, loading: true, error: '' }));
            load();
          }}
          emptyText={
            filter === 'all'
              ? 'Belum ada favorit. Ketuk ikon hati pada konten yang kamu suka.'
              : 'Belum ada favorit di kategori ini.'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { paddingHorizontal: 16, paddingTop: 8, gap: 4 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  chip: {
    minHeight: 40, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
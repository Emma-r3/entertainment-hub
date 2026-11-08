import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useList from '../hooks/useList';
import ContentSection from '../components/ContentSection';
import ThemeToggle from '../components/ThemeToggle';

const TABS = [
  { key: 'movie', label: 'Film' },
  { key: 'tv', label: 'Serial' },
  { key: 'music', label: 'Musik' },
];
const FILTERS = [{ key: 'all', label: 'Semua' }, ...TABS];

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [type, setType] = useState('movie');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  const searching = debounced.length > 0;

  const fresh = useList(searching ? null : `/content/new/${type}`);
  const trending = useList(searching ? null : `/content/trending/${type}`);
  const results = useList(
    searching ? `/content/search?q=${encodeURIComponent(debounced)}&type=${filter}` : null
  );

  const chips = searching ? FILTERS : TABS;
  const activeChip = searching ? filter : type;
  const selectChip = searching ? setFilter : setType;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: colors.text }]} numberOfLines={1}>
              {user ? `Halo, ${user.name}` : 'Temukan hiburanmu'}
            </Text>
            <Text style={{ color: colors.text2, fontSize: 14 }}>
              Film, serial TV, dan musik dalam satu daftar.
            </Text>
          </View>
          <ThemeToggle />
        </View>

        <View
          style={[
            styles.search,
            {
              backgroundColor: colors.surface2,
              borderColor: focused ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.text2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari film, serial, atau lagu..."
            placeholderTextColor={colors.text2}
            accessibilityLabel="Cari konten"
            returnKeyType="search"
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian"
              style={styles.clear}
            >
              <Ionicons name="close-circle" size={20} color={colors.text2} />
            </Pressable>
          )}
        </View>

        <View style={styles.chips} accessibilityRole="tablist">
          {chips.map((c) => {
            const active = activeChip === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => selectChip(c.key)}
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
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {searching ? (
          <ContentSection
            title={`Hasil untuk "${debounced}"`}
            layout="grid"
            items={results.items}
            loading={results.loading}
            error={results.error}
            onRetry={results.retry}
            emptyText={`Tidak ada hasil untuk "${debounced}".`}
          />
        ) : (
          <>
            <ContentSection
              title="New Release"
              items={fresh.items}
              loading={fresh.loading}
              error={fresh.error}
              onRetry={fresh.retry}
              emptyText="Belum ada rilisan terbaru."
            />
            <ContentSection
              title="Trending"
              items={trending.items}
              loading={trending.loading}
              error={trending.error}
              onRetry={trending.retry}
              emptyText="Belum ada konten trending."
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, marginHorizontal: 16,
    marginTop: 16, paddingLeft: 16, paddingRight: 4, borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16, minHeight: 46, paddingVertical: 0 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  chip: {
    minHeight: 40, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
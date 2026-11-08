import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import Button from '../components/Button';
import CollectionForm from '../components/CollectionForm';
import GuestPrompt from '../components/GuestPrompt';
import Skeleton from '../components/Skeleton';
import StateBox from '../components/StateBox';

export default function CollectionsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { notify } = useLibrary();
  const [state, setState] = useState({ collections: [], loading: true, error: '' });
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api('/collections')
      .then((d) => setState({ collections: d.collections, loading: false, error: '' }))
      .catch((err) => setState({ collections: [], loading: false, error: err.message }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) load();
    }, [user, load])
  );

  if (!user) {
    return (
      <GuestPrompt
        icon="albums-outline"
        title="Buat koleksimu sendiri"
        text="Masuk untuk mengelompokkan konten ke dalam koleksi pribadi."
      />
    );
  }

  async function create(data) {
    const d = await api('/collections', { method: 'POST', body: data });
    setCreating(false);
    notify(`Koleksi "${d.collection.name}" dibuat`);
    load();
  }

  const { collections, loading, error } = state;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.text }]} accessibilityRole="header">
            Koleksi
          </Text>
          <Text style={{ color: colors.text2, fontSize: 14 }}>Kelompokkan konten dengan caramu sendiri.</Text>
        </View>
        <Pressable
          onPress={() => setCreating(true)}
          accessibilityRole="button"
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Buat</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {error ? (
          <StateBox
            text={error}
            actionLabel="Coba lagi"
            onAction={() => {
              setState((s) => ({ ...s, loading: true, error: '' }));
              load();
            }}
          />
        ) : loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 150 }} />)
        ) : collections.length === 0 ? (
          <View style={{ gap: 12 }}>
            <StateBox text="Belum ada koleksi. Buat yang pertama untuk mulai menyusun daftarmu." />
            <View style={{ marginHorizontal: 16 }}>
              <Button title="Buat koleksi" onPress={() => setCreating(true)} />
            </View>
          </View>
        ) : (
          collections.map((c) => (
            <Pressable
              key={c._id}
              onPress={() => navigation.navigate('CollectionDetail', { id: c._id })}
              accessibilityRole="button"
              accessibilityLabel={`${c.name}, ${c.itemCount} konten`}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={styles.previews}>
                {[0, 1, 2, 3].map((i) =>
                  c.previews[i] ? (
                    <Image key={i} source={{ uri: c.previews[i] }} style={styles.thumb} />
                  ) : (
                    <View key={i} style={[styles.thumb, { backgroundColor: colors.surface2 }]} />
                  )
                )}
              </View>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={{ color: colors.text2, fontSize: 12 }}>{c.itemCount} konten</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {creating && (
        <CollectionForm
          title="Buat koleksi baru"
          submitLabel="Buat koleksi"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44,
    paddingHorizontal: 16, borderRadius: 12,
  },
  list: { padding: 16, gap: 16, paddingBottom: 32 },
  card: { gap: 4, padding: 12, borderRadius: 16, borderWidth: 1 },
  previews: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  thumb: { flex: 1, aspectRatio: 1, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600' },
});
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import Button from '../components/Button';
import CollectionForm from '../components/CollectionForm';
import ContentCard from '../components/ContentCard';
import Skeleton from '../components/Skeleton';
import StateBox from '../components/StateBox';

export default function CollectionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { notify } = useLibrary();
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - 32 - 16) / 2);

  const [state, setState] = useState({ collection: null, loading: true, error: '' });
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api(`/collections/${id}`)
      .then((d) => setState({ collection: d.collection, loading: false, error: '' }))
      .catch((err) => setState({ collection: null, loading: false, error: err.message }));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const { collection, loading, error } = state;

  async function rename(data) {
    const d = await api(`/collections/${id}`, { method: 'PUT', body: data });
    setState((s) => ({ ...s, collection: d.collection }));
    setEditing(false);
    notify('Koleksi diperbarui');
  }

  function confirmDelete() {
    Alert.alert(
      'Hapus koleksi',
      `Hapus koleksi "${collection.name}"? Konten di dalamnya tidak ikut terhapus dari aplikasi.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api(`/collections/${id}`, { method: 'DELETE' });
              notify('Koleksi dihapus');
              navigation.goBack();
            } catch (err) {
              notify(err.message);
            }
          },
        },
      ]
    );
  }

  async function removeItem(item) {
    try {
      const d = await api(`/collections/${id}/items/${item.type}/${item.contentId}`, {
        method: 'DELETE',
      });
      setState((s) => ({ ...s, collection: d.collection }));
      notify('Dihapus dari koleksi');
    } catch (err) {
      notify(err.message);
    }
  }

  if (loading && !collection) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg, padding: 16, gap: 12 }]}>
        <Skeleton style={{ height: 32, width: '60%' }} />
        <Skeleton style={{ height: 14, width: '40%' }} />
      </View>
    );
  }

  if (error || !collection) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: colors.bg }]}>
        <StateBox text={error || 'Koleksi tidak ditemukan'} actionLabel="Coba lagi" onAction={load} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.h1, { color: colors.text }]} accessibilityRole="header">
            {collection.name}
          </Text>
          {collection.description ? (
            <Text style={{ color: colors.text2, fontSize: 16 }}>{collection.description}</Text>
          ) : null}
          <Text style={{ color: colors.text2 }}>{collection.items.length} konten</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Ubah" variant="secondary" onPress={() => setEditing(true)} style={{ flex: 1 }} />
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            style={[styles.delBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          >
            <Text style={{ color: colors.error, fontSize: 16, fontWeight: '600' }}>Hapus</Text>
          </Pressable>
        </View>

        {collection.items.length === 0 ? (
          <View style={{ gap: 12 }}>
            <StateBox text='Koleksi masih kosong. Buka halaman Detail suatu konten, lalu pilih "Tambah ke koleksi".' />
            <Button
              title="Jelajahi konten"
              onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {collection.items.map((i) => (
              <View key={`${i.type}:${i.contentId}`} style={{ width: cardWidth }}>
                <ContentCard
                  item={{ id: i.contentId, type: i.type, title: i.title, posterUrl: i.posterUrl }}
                  width={cardWidth}
                />
                <Pressable
                  onPress={() => removeItem(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus ${i.title} dari koleksi`}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={14} color={colors.text2} />
                  <Text style={{ color: colors.text2, fontSize: 12, fontWeight: '500' }}>
                    Hapus dari koleksi
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {editing && (
        <CollectionForm
          title="Ubah koleksi"
          submitLabel="Simpan perubahan"
          initial={collection}
          onSubmit={rename}
          onClose={() => setEditing(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 48, gap: 20 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  actions: { flexDirection: 'row', gap: 12 },
  delBtn: {
    flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, rowGap: 20 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
});
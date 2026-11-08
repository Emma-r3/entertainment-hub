import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import useKeyboardHeight from '../hooks/useKeyboardHeight';

export default function CollectionPicker({ item, onClose }) {
  const { colors } = useTheme();
  const { notify } = useLibrary();
  const keyboardHeight = useKeyboardHeight();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/collections')
      .then((d) => setCollections(d.collections))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const body = {
    contentId: item.id,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl || null,
  };

  async function addTo(collection) {
    if (busy) return;
    setBusy(true);
    try {
      await api(`/collections/${collection._id}/items`, { method: 'POST', body });
      notify(`Ditambahkan ke "${collection.name}"`);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        notify(`Sudah ada di "${collection.name}"`);
        onClose();
      } else {
        notify(err.message);
        setBusy(false);
      }
    }
  }

  async function createAndAdd() {
    const name = newName.trim();
    if (!name) {
      setError('Nama koleksi wajib diisi');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const d = await api('/collections', { method: 'POST', body: { name } });
      await api(`/collections/${d.collection._id}/items`, { method: 'POST', body });
      notify(`Ditambahkan ke koleksi baru "${name}"`);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingBottom: keyboardHeight }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup" />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.text }]}>Tambah ke koleksi</Text>

          {loading ? (
            <Text style={{ color: colors.text2 }}>Memuat koleksi...</Text>
          ) : (
            <>
              {collections.length > 0 ? (
                <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                  <View style={{ gap: 8 }}>
                    {collections.map((c) => (
                      <Pressable
                        key={c._id}
                        disabled={busy}
                        onPress={() => addTo(c)}
                        accessibilityRole="button"
                        style={[styles.row, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                      >
                        <Text style={{ color: colors.text, fontWeight: '500', flex: 1 }} numberOfLines={1}>
                          {c.name}
                        </Text>
                        <Text style={{ color: colors.text2, fontSize: 13 }}>{c.itemCount} konten</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <Text style={{ color: colors.text2 }}>
                  Kamu belum punya koleksi. Buat yang pertama di bawah.
                </Text>
              )}

              <View style={styles.newRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface2,
                      borderColor: error ? colors.error : colors.border,
                    },
                  ]}
                  placeholder="Nama koleksi baru"
                  placeholderTextColor={colors.text2}
                  accessibilityLabel="Nama koleksi baru"
                  maxLength={50}
                  value={newName}
                  onChangeText={setNewName}
                  onSubmitEditing={createAndAdd}
                />
                <Pressable
                  onPress={createAndAdd}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel="Buat koleksi dan tambahkan"
                  style={[styles.addBtn, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
                >
                  <Ionicons name="add" size={26} color={colors.onPrimary} />
                </Pressable>
              </View>
              {error ? <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text> : null}
            </>
          )}

          <Pressable onPress={onClose} accessibilityRole="button" style={styles.cancel}>
            <Text style={{ color: colors.text2, fontWeight: '500' }}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1,
    padding: 24, paddingBottom: 32, gap: 16,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2 },
  title: { fontSize: 20, fontWeight: '700' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1,
  },
  newRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minHeight: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  addBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
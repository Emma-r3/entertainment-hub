import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useKeyboardHeight from '../hooks/useKeyboardHeight';
import Button from './Button';
import TextField from './TextField';

export default function CollectionForm({ title, submitLabel, initial, onSubmit, onClose }) {
  const { colors } = useTheme();
  const keyboardHeight = useKeyboardHeight();
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Nama koleksi wajib diisi');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
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
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          <TextField
            label="Nama koleksi"
            placeholder="Contoh: Tontonan akhir pekan"
            maxLength={50}
            autoFocus
            value={name}
            onChangeText={setName}
            error={error}
          />

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>
              Deskripsi (opsional)
            </Text>
            <TextInput
              style={[
                styles.textarea,
                { color: colors.text, backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
              placeholder="Tentang koleksi ini"
              placeholderTextColor={colors.text2}
              accessibilityLabel="Deskripsi"
              multiline
              maxLength={200}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <Button title={submitLabel} onPress={handleSubmit} loading={busy} />
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
  textarea: { minHeight: 80, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
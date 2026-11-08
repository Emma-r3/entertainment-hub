import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { navigate } from '../navigation';
import Button from './Button';

export default function LoginModal({ onClose }) {
  const { colors } = useTheme();

  function go(screen) {
    onClose();
    setTimeout(() => navigate(screen), 150);
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Tutup"
        />
        <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Masuk dulu untuk menyimpan</Text>
          <Text style={[styles.text, { color: colors.text2 }]}>
            Favorit, watched, rating, dan koleksi tersimpan di akunmu. Masuk atau daftar gratis untuk
            memakainya.
          </Text>
          <View style={styles.actions}>
            <Button title="Masuk" onPress={() => go('Login')} style={{ flex: 1 }} />
            <Button title="Daftar" variant="secondary" onPress={() => go('Register')} style={{ flex: 1 }} />
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" style={styles.later}>
            <Text style={{ color: colors.text2, fontWeight: '500' }}>Nanti saja</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.55)',
  },
  box: { borderRadius: 16, borderWidth: 1, padding: 24, gap: 16 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  later: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
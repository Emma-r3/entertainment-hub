import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import GuestPrompt from '../components/GuestPrompt';

const STATS = [
  { key: 'watched', label: 'Sudah ditonton', icon: 'checkmark-circle-outline' },
  { key: 'favorites', label: 'Favorit', icon: 'heart-outline' },
  { key: 'collections', label: 'Koleksi', icon: 'albums-outline' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Muat ulang statistik setiap tab Profil dibuka
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api('/auth/stats')
        .then((d) => {
          setStats(d);
          setError('');
        })
        .catch((err) => setError(err.message));
    }, [user])
  );

  if (!user) {
    return (
      <GuestPrompt
        icon="person-outline"
        title="Profilmu"
        text="Masuk untuk melihat statistik tontonan dan mengatur akunmu."
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]} accessibilityRole="header">
            {user.name}
          </Text>
          <Text style={{ color: colors.text2 }}>{user.email}</Text>
        </View>

        {error ? (
          <Text style={{ color: colors.error, fontSize: 14 }}>Statistik belum bisa dimuat: {error}</Text>
        ) : null}

        <View style={styles.stats}>
          {STATS.map((s) => (
            <View
              key={s.key}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name={s.icon} size={22} color={colors.link} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stats ? stats[s.key] : '-'}</Text>
              <Text style={{ color: colors.text2, fontSize: 12, textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Mode gelap</Text>
            <Text style={{ color: colors.text2, fontSize: 13, marginTop: 2 }}>
              Pilihanmu tersimpan di akun dan dipakai di semua perangkat.
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            accessibilityLabel="Mode gelap"
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Button title="Logout" variant="secondary" onPress={logout} />

        <Text style={{ color: colors.text2, fontSize: 12, textAlign: 'center' }}>
          Data film dan serial dari TMDB, musik dari Deezer.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 20 },
  head: { alignItems: 'center', gap: 4, paddingTop: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  stats: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 16, paddingHorizontal: 4,
    borderRadius: 16, borderWidth: 1,
  },
  statValue: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16,
    borderRadius: 16, borderWidth: 1,
  },
});
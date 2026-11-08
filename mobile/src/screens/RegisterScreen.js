import { useState } from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import ThemeToggle from '../components/ThemeToggle';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!emailRegex.test(form.email.trim())) errs.email = 'Format email tidak valid';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.confirm !== form.password) errs.confirm = 'Konfirmasi password tidak cocok';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <ThemeToggle />
          </View>

          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Ionicons name="film" size={32} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: colors.text2 }]}>
              Your One Entertainment List
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Daftar</Text>
          <Text style={[styles.subtitle, { color: colors.text2 }]}>
            Buat akun baru dalam hitungan detik.
          </Text>

          {serverError ? (
            <View style={[styles.alert, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{serverError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Nama"
              placeholder="Nama lengkap"
              autoComplete="name"
              value={form.name}
              onChangeText={set('name')}
              error={errors.name}
            />
            <TextField
              label="Email"
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
            />
            <PasswordField
              label="Password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChangeText={set('password')}
              error={errors.password}
            />
            <PasswordField
              label="Konfirmasi password"
              placeholder="Ulangi password"
              value={form.confirm}
              onChangeText={set('confirm')}
              onSubmitEditing={handleSubmit}
              error={errors.confirm}
            />
            <Button title="Daftar" onPress={handleSubmit} loading={submitting} />
          </View>

          <View style={styles.links}>
            <Text style={{ color: colors.text2 }}>
              Sudah punya akun?{' '}
              <Text
                style={[styles.link, { color: colors.link }]}
                accessibilityRole="link"
                onPress={() => navigation.navigate('Login')}
              >
                Masuk
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32 },
  top: { alignItems: 'flex-end' },
  brand: { alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 32 },
  logo: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  alert: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  form: { gap: 16 },
  links: { alignItems: 'center', marginTop: 24 },
  link: { fontWeight: '600' },
});
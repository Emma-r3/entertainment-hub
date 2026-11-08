import { useState } from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import ThemeToggle from '../components/ThemeToggle';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

  async function handleSubmit() {
    const errs = {};
    if (!emailRegex.test(email.trim())) errs.email = 'Format email tidak valid';
    if (!password) errs.password = 'Password wajib diisi';
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      goHome();
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

          <Text style={[styles.title, { color: colors.text }]}>Masuk</Text>
          <Text style={[styles.subtitle, { color: colors.text2 }]}>Selamat datang kembali.</Text>

          {serverError ? (
            <View style={[styles.alert, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{serverError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Email"
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <PasswordField
              label="Password"
              placeholder="Masukkan password"
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSubmit}
              error={errors.password}
            />
            <Button title="Masuk" onPress={handleSubmit} loading={submitting} />
          </View>

          <View style={styles.links}>
            <Text style={{ color: colors.text2 }}>
              Belum punya akun?{' '}
              <Text
                style={[styles.link, { color: colors.link }]}
                accessibilityRole="link"
                onPress={() => navigation.navigate('Register')}
              >
                Daftar
              </Text>
            </Text>
            <Pressable onPress={goHome} accessibilityRole="link" style={styles.guest}>
              <Text style={[styles.link, { color: colors.link }]}>Jelajahi sebagai tamu</Text>
            </Pressable>
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
  links: { alignItems: 'center', gap: 4, marginTop: 24 },
  link: { fontWeight: '600' },
  guest: { minHeight: 44, justifyContent: 'center' },
});
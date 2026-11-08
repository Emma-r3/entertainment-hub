import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

export default function GuestPrompt({ icon, title, text }) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.body}>
        <View style={[styles.circle, { backgroundColor: colors.surface2 }]}>
          <Ionicons name={icon} size={40} color={colors.link} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.text, { color: colors.text2 }]}>{text}</Text>
        <View style={styles.actions}>
          <Button title="Masuk" onPress={() => navigation.navigate('Login')} />
          <Button title="Daftar" variant="secondary" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  circle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  text: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 12, marginTop: 12 },
});
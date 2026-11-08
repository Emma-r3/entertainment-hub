import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={24} color={colors.text2} />
    </Pressable>
  );
}
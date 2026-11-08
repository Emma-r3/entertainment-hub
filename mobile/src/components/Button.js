import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  const off = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: primary ? colors.primary : colors.surface2,
          borderColor: primary ? colors.primary : colors.border,
          opacity: off ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.onPrimary : colors.text} />
      ) : (
        <Text style={[styles.text, { color: primary ? colors.onPrimary : colors.text }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
});
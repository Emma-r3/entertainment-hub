import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TextField({ label, error, right, ...props }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.surface2,
            borderColor: error ? colors.error : focused ? colors.primary : colors.border,
          },
        ]}
      >
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={colors.text2}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: colors.text }]}
        />
        {right}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '500' },
  wrap: {
    flexDirection: 'row', alignItems: 'center', minHeight: 48, borderRadius: 12,
    borderWidth: 1, paddingLeft: 16, paddingRight: 4,
  },
  input: { flex: 1, fontSize: 16, minHeight: 46, paddingVertical: 0 },
  error: { fontSize: 14 },
});
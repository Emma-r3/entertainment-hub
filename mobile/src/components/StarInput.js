import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function StarInput({ value, onChange }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Beri rating 1 sampai 5 bintang">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === n }}
          accessibilityLabel={`${n} bintang`}
          style={styles.btn}
        >
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={32} color={colors.star} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
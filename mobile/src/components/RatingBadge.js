import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function RatingBadge({ rating, type }) {
  const { colors } = useTheme();

  if (rating == null) {
    return <Text style={[styles.none, { color: colors.text2 }]}>Belum ada rating</Text>;
  }

  const scale = type === 'music' ? 5 : 10;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Rating ${rating.toFixed(1)} dari ${scale}`}
    >
      <Ionicons name="star" size={14} color={colors.star} />
      <Text style={[styles.value, { color: colors.star }]}>{rating.toFixed(1)}</Text>
      <Text style={[styles.scale, { color: colors.text2 }]}>/{scale}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  value: { fontSize: 13, fontWeight: '600' },
  scale: { fontSize: 12 },
  none: { fontSize: 12, marginTop: 4 },
});
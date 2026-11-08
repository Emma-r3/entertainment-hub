import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ContentCard from './ContentCard';
import Skeleton from './Skeleton';
import StateBox from './StateBox';

const ROW_CARD = 140;
const GAP = 16;

function SkeletonCard({ width }) {
  return (
    <View style={{ width }}>
      <Skeleton style={{ width, aspectRatio: 2 / 3 }} />
      <Skeleton style={{ height: 14, marginTop: 10, width: '90%' }} />
      <Skeleton style={{ height: 14, marginTop: 6, width: '55%' }} />
    </View>
  );
}

export default function ContentSection({
  title,
  items,
  loading,
  error,
  onRetry,
  layout = 'row',
  emptyText = 'Belum ada konten.',
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const gridWidth = Math.floor((width - 32 - GAP) / 2);

  let body;
  if (error) {
    body = <StateBox text={error} actionLabel="Coba lagi" onAction={onRetry} />;
  } else if (loading) {
    body =
      layout === 'grid' ? (
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} width={gridWidth} />
          ))}
        </View>
      ) : (
        <View style={styles.skelRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} width={ROW_CARD} />
          ))}
        </View>
      );
  } else if (items.length === 0) {
    body = <StateBox text={emptyText} />;
  } else if (layout === 'grid') {
    body = (
      <View style={styles.grid}>
        {items.map((item) => (
          <ContentCard key={`${item.type}:${item.id}`} item={item} width={gridWidth} />
        ))}
      </View>
    );
  } else {
    body = (
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => `${item.type}:${item.id}`}
        renderItem={({ item }) => <ContentCard item={item} width={ROW_CARD} />}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsHorizontalScrollIndicator={false}
      />
    );
  }

  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 32, paddingHorizontal: 16, marginBottom: 12 },
  skelRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, rowGap: 20, paddingHorizontal: 16 },
});
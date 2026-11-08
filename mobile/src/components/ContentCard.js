import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import RatingBadge from './RatingBadge';

export default function ContentCard({ item, width }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { isWatched, isFavorite, toggleFavorite } = useLibrary();
  const watched = isWatched(item);
  const favorite = isFavorite(item);
  const isMusic = item.type === 'music';

  return (
    <View style={{ width }}>
      <Pressable
        onPress={() => navigation.navigate('Detail', { type: item.type, id: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. Buka detail`}
      >
        <View
          style={[
            styles.poster,
            {
              aspectRatio: isMusic ? 1 : 2 / 3,
              backgroundColor: colors.surface2,
              borderColor: colors.border,
            },
          ]}
        >
          {item.posterUrl ? (
            <Image source={{ uri: item.posterUrl }} style={styles.img} resizeMode="cover" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name={isMusic ? 'musical-notes' : 'film'} size={32} color={colors.text2} />
            </View>
          )}

          {watched && (
            <View style={[styles.watched, { backgroundColor: colors.watched }]}>
              <Ionicons name="checkmark" size={12} color={colors.onWatched} />
              <Text style={[styles.watchedText, { color: colors.onWatched }]}>Watched</Text>
            </View>
          )}
        </View>

        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[styles.sub, { color: colors.text2 }]}>
          {(isMusic ? item.subtitle : item.year) || ' '}
        </Text>
        {item.rating !== undefined && <RatingBadge rating={item.rating} type={item.type} />}
      </Pressable>

      <Pressable
        onPress={() => toggleFavorite(item)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        accessibilityState={{ selected: favorite }}
        style={[styles.fav, { backgroundColor: favorite ? '#FFFFFF' : 'rgba(0,0,0,0.6)' }]}
      >
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={18}
          color={favorite ? '#D6284A' : '#FFFFFF'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  poster: { width: '100%', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, lineHeight: 16 },
  watched: {
    position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center',
    gap: 2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
  },
  watchedText: { fontSize: 12, fontWeight: '600' },
  fav: {
    position: 'absolute', top: 6, right: 6, width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
});
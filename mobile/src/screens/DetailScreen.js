import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import useKeyboardHeight from '../hooks/useKeyboardHeight';
import AudioPreview from '../components/AudioPreview';
import CollectionPicker from '../components/CollectionPicker';
import ReviewSection from '../components/ReviewSection';
import Skeleton from '../components/Skeleton';
import StateBox from '../components/StateBox';
import TrailerPlayer from '../components/TrailerPlayer';

const TYPES = ['movie', 'tv', 'music'];
const TYPE_LABEL = { movie: 'Film', tv: 'Serial', music: 'Musik' };
const EMPTY_REVIEWS = { average: null, count: 0, reviews: [] };

const formatDuration = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function ActionButton({ icon, label, color, active, onPress }) {
  const { colors } = useTheme();
  const tint = active ? color : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active) }}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: colors.surface2,
          borderColor: active ? color : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={24} color={tint} />
      <Text style={[styles.actionText, { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

function StatBox({ children }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="star" size={18} color={colors.star} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export default function DetailScreen({ route }) {
  const { type, id } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isFavorite, isWatched, toggleFavorite, toggleWatched, requireLogin } = useLibrary();

  const [state, setState] = useState({ item: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const [reviews, setReviews] = useState(EMPTY_REVIEWS);
  const [reviewsError, setReviewsError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const scrollRef = useRef(null);
  const reviewY = useRef(0);
  const keyboardHeight = useKeyboardHeight();

  function scrollToReview() {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: reviewY.current, animated: true });
    }, 150);
  }

  const valid = TYPES.includes(type) && /^\d+$/.test(String(id || ''));

  // Detail konten
  useEffect(() => {
    if (!valid) {
      setState({ item: null, loading: false, error: 'Konten tidak ditemukan' });
      return;
    }
    let cancelled = false;
    setState({ item: null, loading: true, error: '' });

    api(`/content/${type}/${id}`)
      .then((item) => !cancelled && setState({ item, loading: false, error: '' }))
      .catch((err) => !cancelled && setState({ item: null, loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, [type, id, valid, tick]);

  // Ulasan
  const loadReviews = useCallback(async () => {
    try {
      const d = await api(`/reviews/${type}/${id}`);
      setReviews(d);
      setReviewsError('');
    } catch (err) {
      setReviewsError(err.message);
    }
  }, [type, id]);

  useEffect(() => {
    if (!valid) return;
    setReviews(EMPTY_REVIEWS);
    loadReviews();
  }, [valid, loadReviews]);

  const { item, loading, error } = state;

  function openPicker() {
    if (!user) return requireLogin();
    setPickerOpen(true);
  }

  /* Loading / error */
  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg, padding: 16, gap: 12 }]}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Skeleton style={{ width: 120, aspectRatio: 2 / 3 }} />
          <View style={{ flex: 1, gap: 10 }}>
            <Skeleton style={{ height: 28, width: '90%' }} />
            <Skeleton style={{ height: 14, width: '60%' }} />
            <Skeleton style={{ height: 14, width: '40%' }} />
          </View>
        </View>
        <Skeleton style={{ height: 14 }} />
        <Skeleton style={{ height: 14 }} />
        <Skeleton style={{ height: 14, width: '70%' }} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: colors.bg }]}>
        <StateBox
          text={error || 'Konten tidak ditemukan'}
          actionLabel={valid ? 'Coba lagi' : undefined}
          onAction={() => setTick((t) => t + 1)}
        />
      </View>
    );
  }

  /* Data turunan */
  const isMusic = item.type === 'music';
  const favorite = isFavorite(item);
  const watched = isWatched(item);

  const meta = isMusic
    ? [item.artist, item.album, item.duration ? formatDuration(item.duration) : null]
    : [
        item.year,
        item.type === 'tv' && item.seasons ? `${item.seasons} musim` : null,
        item.runtime ? `${item.runtime} menit${item.type === 'tv' ? '/episode' : ''}` : null,
      ];

  const watchedLabel = watched
    ? isMusic ? 'Sudah didengar' : 'Sudah ditonton'
    : isMusic ? 'Tandai didengar' : 'Tandai ditonton';

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: 48 + keyboardHeight }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header info */}
        <View style={styles.top}>
          <View
            style={[
              styles.poster,
              { aspectRatio: isMusic ? 1 : 2 / 3, backgroundColor: colors.surface2, borderColor: colors.border },
            ]}
          >
            {item.posterUrl ? (
              <Image source={{ uri: item.posterUrl }} style={styles.img} resizeMode="cover" />
            ) : (
              <View style={styles.posterEmpty}>
                <Ionicons name={isMusic ? 'musical-notes' : 'film'} size={40} color={colors.text2} />
              </View>
            )}
          </View>

          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.typeChip, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: '600' }}>
                {TYPE_LABEL[item.type]}
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
              {item.title}
            </Text>
            {item.tagline ? (
              <Text style={{ color: colors.text2, fontStyle: 'italic' }}>{item.tagline}</Text>
            ) : null}
            <Text style={{ color: colors.text2, fontSize: 14 }}>{meta.filter(Boolean).join(' • ')}</Text>
          </View>
        </View>

        {item.genres && item.genres.length > 0 && (
          <View style={styles.genres}>
            {item.genres.map((g) => (
              <View key={g} style={[styles.genre, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={{ color: colors.text, fontSize: 13 }}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Rating */}
        <View style={{ gap: 8 }}>
          {!isMusic && (
            <StatBox>
              {item.rating != null ? (
                <Text style={{ color: colors.text }}>
                  <Text style={{ fontWeight: '700' }}>{item.rating.toFixed(1)}</Text>
                  <Text style={{ color: colors.text2 }}>/10</Text> · TMDB
                </Text>
              ) : (
                <Text style={{ color: colors.text2 }}>Belum ada rating TMDB</Text>
              )}
            </StatBox>
          )}
          <StatBox>
            {reviews.count > 0 ? (
              <Text style={{ color: colors.text }}>
                <Text style={{ fontWeight: '700' }}>{reviews.average.toFixed(1)}</Text>
                <Text style={{ color: colors.text2 }}>/5</Text> · Komunitas ({reviews.count} ulasan)
              </Text>
            ) : (
              <Text style={{ color: colors.text2 }}>Belum ada rating komunitas</Text>
            )}
          </StatBox>
        </View>

        {/* Tombol aksi */}
        <View style={styles.actions}>
          <ActionButton
            icon={favorite ? 'heart' : 'heart-outline'}
            label={favorite ? 'Favorit' : 'Tambah favorit'}
            color={colors.favorite}
            active={favorite}
            onPress={() => toggleFavorite(item)}
          />
          <ActionButton
            icon={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
            label={watchedLabel}
            color={colors.watched}
            active={watched}
            onPress={() => toggleWatched(item)}
          />
          <ActionButton icon="add-circle-outline" label="Tambah ke koleksi" onPress={openPicker} />
        </View>

        {/* Sinopsis */}
        {item.overview ? (
          <View style={{ gap: 8 }}>
            <Text style={[styles.h3, { color: colors.text }]}>Sinopsis</Text>
            <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>{item.overview}</Text>
          </View>
        ) : null}

        {item.cast && item.cast.length > 0 && (
          <Text style={{ color: colors.text2, lineHeight: 22 }}>
            <Text style={{ fontWeight: '600' }}>Pemeran: </Text>
            {item.cast.join(', ')}
          </Text>
        )}

        {/* Trailer */}
        <View style={{ gap: 12 }}>
          <Text style={[styles.h2, { color: colors.text }]} accessibilityRole="header">
            {isMusic ? 'Preview lagu' : 'Trailer'}
          </Text>
          {isMusic ? (
            item.previewUrl ? (
              <AudioPreview url={item.previewUrl} />
            ) : (
              <StateBox text="Preview tidak tersedia untuk lagu ini." />
            )
          ) : item.trailerKey ? (
            <TrailerPlayer trailerKey={item.trailerKey} />
          ) : (
            <StateBox text="Trailer tidak tersedia." />
          )}
        </View>

        {/* Ulasan */}
        <View
          onLayout={(e) => {
            reviewY.current = e.nativeEvent.layout.y;
          }}
        >
          <ReviewSection
            type={item.type}
            contentId={item.id}
            data={reviews}
            error={reviewsError}
            reload={loadReviews}
            onFocusField={scrollToReview}
          />
        </View>
      </ScrollView>

      {pickerOpen && <CollectionPicker item={item} onClose={() => setPickerOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 48, gap: 20 },
  top: { flexDirection: 'row', gap: 16 },
  poster: { width: 120, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  posterEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  typeChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genre: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingHorizontal: 4, borderRadius: 12, borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600' },
});
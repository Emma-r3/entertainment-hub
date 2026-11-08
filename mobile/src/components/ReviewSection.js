import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import Button from './Button';
import StarInput from './StarInput';

function Stars({ value, color }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessible accessibilityLabel={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= value ? 'star' : 'star-outline'} size={14} color={color} />
      ))}
    </View>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return String(iso).slice(0, 10);
  }
}

export default function ReviewSection({ type, contentId, data, error, reload, onFocusField }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { notify, requireLogin } = useLibrary();

  const mine = user ? data.reviews.find((r) => String(r.userId) === String(user.id)) : null;

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showForm = user && (!mine || editing);

  function startEdit() {
    setRating(mine.rating);
    setComment(mine.comment || '');
    setFormError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setRating(0);
    setComment('');
    setFormError('');
  }

  async function submit() {
    if (!rating) {
      setFormError('Pilih rating 1 sampai 5 bintang');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editing && mine) {
        await api(`/reviews/${mine._id}`, { method: 'PUT', body: { rating, comment: comment.trim() } });
      } else {
        await api('/reviews', { method: 'POST', body: { contentId, type, rating, comment: comment.trim() } });
      }
      await reload();
      notify(editing ? 'Ulasan diperbarui' : 'Ulasan terkirim');
      cancelEdit();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function confirmRemove() {
    Alert.alert('Hapus ulasan', 'Hapus ulasanmu?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/reviews/${mine._id}`, { method: 'DELETE' });
            await reload();
            notify('Ulasan dihapus');
          } catch (err) {
            notify(err.message);
          }
        },
      },
    ]);
  }

  const card = { backgroundColor: colors.surface, borderColor: colors.border };

  return (
    <View style={{ gap: 12 }}>
      <Text style={[styles.h2, { color: colors.text }]} accessibilityRole="header">
        Ulasan
      </Text>
      <Text style={{ color: colors.text2 }}>
        {data.count > 0
          ? `${data.average.toFixed(1)}/5 dari ${data.count} ulasan`
          : 'Belum ada ulasan. Jadilah yang pertama!'}
      </Text>

      {!user && (
        <View style={[styles.box, card]}>
          <Text style={{ color: colors.text2 }}>Masuk untuk memberi rating dan menulis ulasan.</Text>
          <Button title="Masuk untuk memberi rating" onPress={requireLogin} />
        </View>
      )}

      {showForm && (
        <View style={[styles.box, card]}>
          <Text style={[styles.h3, { color: colors.text }]}>
            {editing ? 'Ubah ulasanmu' : 'Beri rating dan ulasan'}
          </Text>
          <StarInput value={rating} onChange={setRating} />
          <TextInput
            style={[styles.textarea, { color: colors.text, backgroundColor: colors.surface2, borderColor: colors.border }]}
            placeholder="Tulis ulasanmu (opsional)"
            placeholderTextColor={colors.text2}
            accessibilityLabel="Ulasan"
            multiline
            maxLength={500}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            onFocus={onFocusField}
          />
          <Text style={{ color: colors.text2, fontSize: 12, textAlign: 'right' }}>{comment.length}/500</Text>
          {formError ? <Text style={{ color: colors.error, fontSize: 14 }}>{formError}</Text> : null}
          <Button
            title={editing ? 'Simpan perubahan' : 'Kirim ulasan'}
            onPress={submit}
            loading={submitting}
          />
          {editing && <Button title="Batal" variant="secondary" onPress={cancelEdit} />}
        </View>
      )}

      {error ? <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text> : null}

      {data.reviews.map((r) => {
        const isMine = mine && r._id === mine._id;
        return (
          <View key={r._id} style={[styles.box, card, isMine && { borderColor: colors.primary }]}>
            <View style={styles.head}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>{r.userName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                  {isMine ? `${r.userName} (kamu)` : r.userName}
                </Text>
                <Text style={{ color: colors.text2, fontSize: 12 }}>{formatDate(r.createdAt)}</Text>
              </View>
              <Stars value={r.rating} color={colors.star} />
            </View>
            {r.comment ? <Text style={{ color: colors.text, lineHeight: 22 }}>{r.comment}</Text> : null}
            {isMine && !editing && (
              <View style={styles.actions}>
                <Pressable onPress={startEdit} accessibilityRole="button" style={styles.textBtn}>
                  <Text style={{ color: colors.link, fontWeight: '600' }}>Ubah</Text>
                </Pressable>
                <Pressable onPress={confirmRemove} accessibilityRole="button" style={styles.textBtn}>
                  <Text style={{ color: colors.error, fontWeight: '600' }}>Hapus</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 18, fontWeight: '600' },
  box: { gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  textarea: { minHeight: 96, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  textBtn: { minHeight: 44, paddingRight: 16, justifyContent: 'center' },
});
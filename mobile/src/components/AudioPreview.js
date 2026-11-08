import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';

const fmt = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function AudioPreview({ url }) {
  const { colors } = useTheme();
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  // Agar suara tetap keluar walau iPhone dalam mode senyap
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.2) {
      player.seekTo(0);
    }
    player.play();
  }

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Jeda preview' : 'Putar preview'}
        style={[styles.play, { backgroundColor: colors.primary }]}
      >
        <Ionicons name={status.playing ? 'pause' : 'play'} size={24} color={colors.onPrimary} />
      </Pressable>

      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.track, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.times}>
          <Text style={{ color: colors.text2, fontSize: 12 }}>{fmt(status.currentTime)}</Text>
          <Text style={{ color: colors.text2, fontSize: 12 }}>
            {status.duration > 0 ? fmt(status.duration) : '0:30'}
          </Text>
        </View>
        <Text style={{ color: colors.text2, fontSize: 12 }}>Cuplikan 30 detik dari Deezer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  play: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
});
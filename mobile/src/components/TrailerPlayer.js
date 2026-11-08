import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function TrailerPlayer({ trailerKey }) {
  const { colors } = useTheme();

  if (!/^[\w-]+$/.test(trailerKey || '')) return null;

  const html = `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%}</style>
    </head><body>
    <iframe src="https://www.youtube.com/embed/${trailerKey}?playsinline=1&rel=0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>
    </body></html>`;

  return (
    <View style={{ gap: 8 }}>
      <View style={[styles.frame, { borderColor: colors.border }]}>
        <WebView
          source={{ html, baseUrl: 'https://www.youtube.com' }}
          originWhitelist={['*']}
          javaScriptEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          nestedScrollEnabled
          setSupportMultipleWindows={false}
          style={{ backgroundColor: '#000' }}
        />
      </View>
      <Pressable
        onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`)}
        accessibilityRole="link"
        style={styles.link}
      >
        <Ionicons name="logo-youtube" size={18} color={colors.link} />
        <Text style={{ color: colors.link, fontWeight: '600' }}>Video tidak tampil? Buka di YouTube</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 16 / 9, borderRadius: 16, borderWidth: 1, overflow: 'hidden', backgroundColor: '#000' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
});
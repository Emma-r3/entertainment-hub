import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

export default function StateBox({ text, actionLabel, onAction }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { borderColor: colors.border }]}>
      <Text style={{ color: colors.text2, fontSize: 16, textAlign: 'center' }}>{text}</Text>
      {actionLabel ? <Button title={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 12, alignItems: 'center', padding: 24, marginHorizontal: 16,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 12,
  },
});
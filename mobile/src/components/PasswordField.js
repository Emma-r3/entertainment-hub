import { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TextField from './TextField';

export default function PasswordField(props) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      secureTextEntry={!show}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <Pressable
          onPress={() => setShow((s) => !s)}
          accessibilityRole="button"
          accessibilityLabel={show ? 'Sembunyikan password' : 'Tampilkan password'}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.text2} />
        </Pressable>
      }
    />
  );
}
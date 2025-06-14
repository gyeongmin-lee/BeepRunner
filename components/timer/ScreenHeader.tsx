import { ThemedText } from '@/components/ThemedText';
import { MODE_COLORS } from '@/constants/BeepTestConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  mode: 'personal' | 'standard';
  onBack: () => void;
}

export const ScreenHeader = React.memo(function ScreenHeader({ title, mode, onBack }: ScreenHeaderProps) {
  const modeColor = React.useMemo(() => 
    mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD,
    [mode]
  );

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={modeColor} />
      </Pressable>
      <ThemedText type="title" style={[styles.title, { color: modeColor }]}>
        {title}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60, // Account for modal screen safe area
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 12,
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
});
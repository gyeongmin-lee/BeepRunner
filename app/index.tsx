import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
export default function HomeScreen() {
  
  const navigateToStandardTimer = () => {
    router.push('/standard-timer');
  };

  const navigateToPersonalTimer = () => {
    router.push('/personal-timer');
  };

  const navigateToHistory = () => {
    // Placeholder for now
    console.log('Navigate to history');
  };

  const navigateToSettings = () => {
    // Placeholder for now
    console.log('Navigate to settings');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

      {/* Mode Selection Cards */}
      <View style={styles.modeContainer}>
        {/* Personal Beep Test Card */}
        <Pressable 
          style={[styles.modeCard, { backgroundColor: MODE_COLORS.PERSONAL_TINT }]}
          onPress={navigateToPersonalTimer}
        >
          <View style={styles.modeHeader}>
            <MaterialIcons name="person" size={32} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="subtitle" style={[styles.modeTitle, { color: MODE_COLORS.PERSONAL }]}>
              Personal Training
            </ThemedText>
          </View>
          
          <ThemedText type="bodyLarge" style={styles.modeDescription}>
            Customized for your space
          </ThemedText>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="timer" size={16} color={MODE_COLORS.PERSONAL} />
              <ThemedText type="body" style={styles.featureText}>Time-based auto setup</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="tune" size={16} color={MODE_COLORS.PERSONAL} />
              <ThemedText type="body" style={styles.featureText}>Adaptive difficulty</ThemedText>
            </View>
          </View>
          
          <View style={styles.cardAction}>
            <ThemedText type="button" style={[styles.actionText, { color: MODE_COLORS.PERSONAL }]}>
              Start Personal Test
            </ThemedText>
            <MaterialIcons name="arrow-forward" size={20} color={MODE_COLORS.PERSONAL} />
          </View>
        </Pressable>

        {/* Standard Beep Test Card */}
        <Pressable 
          style={[styles.modeCard, { backgroundColor: MODE_COLORS.STANDARD_TINT }]}
          onPress={navigateToStandardTimer}
        >
          <View style={styles.modeHeader}>
            <MaterialIcons name="straighten" size={32} color={MODE_COLORS.STANDARD} />
            <ThemedText type="subtitle" style={[styles.modeTitle, { color: MODE_COLORS.STANDARD }]}>
              Standard Shuttle Run
            </ThemedText>
          </View>
          
          <ThemedText type="bodyLarge" style={styles.modeDescription}>
            Official 20m regulation test
          </ThemedText>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="track-changes" size={16} color={MODE_COLORS.STANDARD} />
              <ThemedText type="body" style={styles.featureText}>Standard beep test</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="verified" size={16} color={MODE_COLORS.STANDARD} />
              <ThemedText type="body" style={styles.featureText}>Consistent measurement</ThemedText>
            </View>
          </View>
          
          <View style={styles.cardAction}>
            <ThemedText type="button" style={[styles.actionText, { color: MODE_COLORS.STANDARD }]}>
              Start Standard Test
            </ThemedText>
            <MaterialIcons name="arrow-forward" size={20} color={MODE_COLORS.STANDARD} />
          </View>
        </Pressable>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickActionButton} onPress={navigateToHistory}>
          <MaterialIcons name="bar-chart" size={24} color={MODE_COLORS.ACCENT} />
          <ThemedText type="caption" style={styles.quickActionText}>Workout History</ThemedText>
        </Pressable>
        
        <Pressable style={styles.quickActionButton} onPress={navigateToSettings}>
          <MaterialIcons name="settings" size={24} color={MODE_COLORS.ACCENT} />
          <ThemedText type="caption" style={styles.quickActionText}>Settings</ThemedText>
        </Pressable>
      </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Account for tab bar + extra spacing
    paddingTop: 60, // Top margin for tab screen safe area
  },
  modeContainer: {
    gap: 20,
    marginBottom: 40,
  },
  modeCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modeTitle: {
    flex: 1,
  },
  modeDescription: {
    marginBottom: 16,
    opacity: 0.8,
  },
  featureList: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    opacity: 0.7,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    minWidth: UI_CONFIG.MIN_TOUCH_TARGET,
  },
  quickActionText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

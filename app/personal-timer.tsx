import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MODE_COLORS, UI_CONFIG } from '@/constants/BeepTestConfig';

type PersonalTimerStep = 'calibration' | 'timer' | 'feedback';

export default function PersonalTimerScreen() {
  const [currentStep, setCurrentStep] = useState<PersonalTimerStep>('calibration');

  const goBack = () => {
    router.back();
  };

  const renderCalibrationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="directions-run" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Space Calibration
        </ThemedText>
      </View>
      
      <View style={styles.instructionContainer}>
        <ThemedText style={styles.instructionText}>
          Measure your available space by running from point A to point B
        </ThemedText>
        
        <View style={styles.guidelineContainer}>
          <View style={styles.guidelineHeader}>
            <MaterialIcons name="lightbulb-outline" size={20} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.guidelineTitle}>Guidelines:</ThemedText>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.guidelineText}>
              Run at a conversational pace
            </ThemedText>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.guidelineText}>
              Maintain consistent comfortable speed
            </ThemedText>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.guidelineText}>
              Stop when you reach your end point
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable 
        style={[styles.button, styles.primaryButton]} 
        onPress={() => setCurrentStep('timer')}
      >
        <ThemedText style={styles.buttonText}>Start Calibration</ThemedText>
      </Pressable>
    </View>
  );

  const renderTimerStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="timer" size={32} color={MODE_COLORS.PERSONAL} />
        <ThemedText type="title" style={styles.stepTitle}>
          Personal Beep Test
        </ThemedText>
      </View>
      
      <ThemedText style={styles.placeholderText}>
        Timer functionality will be implemented here
      </ThemedText>
      
      <Pressable 
        style={[styles.button, styles.primaryButton]} 
        onPress={() => setCurrentStep('feedback')}
      >
        <ThemedText style={styles.buttonText}>Complete Workout</ThemedText>
      </Pressable>
    </View>
  );

  const renderFeedbackStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.titleWithIcon}>
        <MaterialIcons name="celebration" size={32} color={MODE_COLORS.ACCENT} />
        <ThemedText type="title" style={styles.stepTitle}>
          Workout Complete!
        </ThemedText>
      </View>
      
      <View style={styles.feedbackContainer}>
        <ThemedText style={styles.resultText}>
          Reached Level 4 • 31 total reps
        </ThemedText>
        
        <ThemedText style={styles.feedbackPrompt}>
          How was this workout?
        </ThemedText>
        
        <View style={styles.feedbackButtons}>
          <Pressable style={[styles.button, styles.feedbackButton]}>
            <MaterialIcons name="sentiment-very-satisfied" size={32} color={MODE_COLORS.ACCENT} />
            <ThemedText style={styles.feedbackText}>Too Easy</ThemedText>
            <ThemedText style={styles.feedbackSubtext}>(Next: faster)</ThemedText>
          </Pressable>
          
          <Pressable style={[styles.button, styles.feedbackButton]}>
            <MaterialIcons name="thumb-up" size={32} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.feedbackText}>Perfect</ThemedText>
            <ThemedText style={styles.feedbackSubtext}>(Keep settings)</ThemedText>
          </Pressable>
          
          <Pressable style={[styles.button, styles.feedbackButton]}>
            <MaterialIcons name="sentiment-very-dissatisfied" size={32} color={MODE_COLORS.DANGER} />
            <ThemedText style={styles.feedbackText}>Too Hard</ThemedText>
            <ThemedText style={styles.feedbackSubtext}>(Next: slower)</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={MODE_COLORS.PERSONAL} />
            <ThemedText type="defaultSemiBold" style={{ color: MODE_COLORS.PERSONAL }}>
              Back
            </ThemedText>
          </Pressable>
          <ThemedText type="title" style={[styles.title, { color: MODE_COLORS.PERSONAL }]}>
            Personal Beep Test
          </ThemedText>
        </View>

        {/* Step Content */}
        {currentStep === 'calibration' && renderCalibrationStep()}
        {currentStep === 'timer' && renderTimerStep()}
        {currentStep === 'feedback' && renderFeedbackStep()}

        {/* Personal Mode Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={16} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.infoText}>Customized for your space</ThemedText>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="tune" size={16} color={MODE_COLORS.PERSONAL} />
            <ThemedText style={styles.infoText}>Adaptive difficulty • Time-based scaling</ThemedText>
          </View>
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
    paddingBottom: 100, // Extra space for better scrolling
    flexGrow: 1, // Allow content to grow naturally
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60, // Account for modal screen safe area
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
    gap: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 80,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 400, // Ensure minimum height for content
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  stepTitle: {
    textAlign: 'center',
  },
  instructionContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  guidelineContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  feedbackContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  feedbackPrompt: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  feedbackButtons: {
    gap: 16,
    width: '100%',
  },
  feedbackButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: UI_CONFIG.MIN_TOUCH_TARGET,
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: MODE_COLORS.PERSONAL,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});
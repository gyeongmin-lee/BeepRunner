import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { WorkoutSession } from '@/services/DatabaseService';
import { MODE_COLORS } from '@/constants/BeepTestConfig';

interface WorkoutGraphProps {
  workouts: WorkoutSession[];
}

export function WorkoutGraph({ workouts }: WorkoutGraphProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const chartData = useMemo(() => {
    // Sort workouts by date
    const sortedWorkouts = [...workouts]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20); // Show last 20 workouts

    const maxLevel = Math.max(...sortedWorkouts.map(w => w.max_level), 1);
    const minLevel = Math.min(...sortedWorkouts.map(w => w.max_level), 0);
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 60; // Account for padding and y-axis labels
    const chartHeight = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 30 };

    return {
      workouts: sortedWorkouts,
      maxLevel,
      minLevel,
      chartWidth,
      chartHeight,
      padding,
    };
  }, [workouts]);

  const generateLinePath = () => {
    if (chartData.workouts.length === 0) return '';
    
    const { padding, chartWidth, chartHeight, maxLevel, minLevel } = chartData;
    const levelRange = maxLevel - minLevel || 1;
    const xStep = (chartWidth - padding.left - padding.right) / Math.max(chartData.workouts.length - 1, 1);
    
    const points = chartData.workouts.map((workout, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - (workout.max_level - minLevel) / levelRange);
      return { x, y, workout };
    });
    
    // Generate smooth path
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const x = points[i].x;
      const y = points[i].y;
      const prevX = points[i - 1].x;
      const prevY = points[i - 1].y;
      
      // Create control points for smooth curve
      const cp1x = prevX + (x - prevX) * 0.5;
      const cp1y = prevY;
      const cp2x = prevX + (x - prevX) * 0.5;
      const cp2y = y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }
    
    return { path, points };
  };
  
  const { path, points } = generateLinePath();

  if (workouts.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No Data Available
        </ThemedText>
        <ThemedText type="body" style={styles.emptyDescription}>
          Complete some workouts to see your progress chart
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Level Progress
        </ThemedText>
        <ThemedText type="caption" style={styles.subtitle}>
          Last {Math.min(chartData.workouts.length, 20)} workouts
        </ThemedText>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartData.chartWidth} height={chartData.chartHeight}>
          {/* Y-axis */}
          <Line
            x1={chartData.padding.left}
            y1={chartData.padding.top}
            x2={chartData.padding.left}
            y2={chartData.chartHeight - chartData.padding.bottom}
            stroke={borderColor}
            strokeWidth="1"
          />
          
          {/* X-axis */}
          <Line
            x1={chartData.padding.left}
            y1={chartData.chartHeight - chartData.padding.bottom}
            x2={chartData.chartWidth - chartData.padding.right}
            y2={chartData.chartHeight - chartData.padding.bottom}
            stroke={borderColor}
            strokeWidth="1"
          />
          
          {/* Y-axis labels */}
          {[...Array(5)].map((_, i) => {
            const level = chartData.minLevel + (chartData.maxLevel - chartData.minLevel) * (1 - i / 4);
            const y = chartData.padding.top + (chartData.chartHeight - chartData.padding.top - chartData.padding.bottom) * (i / 4);
            return (
              <SvgText
                key={i}
                x={chartData.padding.left - 10}
                y={y + 4}
                fontSize="10"
                fill={textColor}
                textAnchor="end"
              >
                {Math.round(level)}
              </SvgText>
            );
          })}
          
          {/* Line graph */}
          {chartData.workouts.length > 0 && (
            <>
              <Path
                d={path}
                fill="none"
                stroke={MODE_COLORS.ACCENT}
                strokeWidth="2"
              />
              
              {/* Data points */}
              {points?.map((point, index) => {
                const workout = point.workout;
                const color = workout.workout_mode === 'personal' ? MODE_COLORS.PERSONAL : MODE_COLORS.STANDARD;
                const date = new Date(workout.date);
                const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                
                return (
                  <React.Fragment key={workout.id || index}>
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* Date labels for first, last, and some middle points */}
                    {(index === 0 || index === points.length - 1 || index % Math.max(1, Math.floor(points.length / 4)) === 0) && (
                      <SvgText
                        x={point.x}
                        y={chartData.chartHeight - chartData.padding.bottom + 15}
                        fontSize="10"
                        fill={textColor}
                        textAnchor="middle"
                      >
                        {dateLabel}
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </Svg>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MODE_COLORS.PERSONAL }]} />
          <ThemedText type="caption" style={styles.legendText}>
            Personal
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MODE_COLORS.STANDARD }]} />
          <ThemedText type="caption" style={styles.legendText}>
            Standard
          </ThemedText>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText type="bodyLarge" style={styles.statValue}>
            {Math.max(...workouts.map(w => w.max_level))}
          </ThemedText>
          <ThemedText type="caption" style={styles.statLabel}>
            Best Level
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="bodyLarge" style={styles.statValue}>
            {workouts.length}
          </ThemedText>
          <ThemedText type="caption" style={styles.statLabel}>
            Total Workouts
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText type="bodyLarge" style={styles.statValue}>
            {Math.round(workouts.reduce((sum, w) => sum + w.max_level, 0) / workouts.length) || 0}
          </ThemedText>
          <ThemedText type="caption" style={styles.statLabel}>
            Avg Level
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    opacity: 0.7,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    fontSize: 24,
  },
  statLabel: {
    opacity: 0.6,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
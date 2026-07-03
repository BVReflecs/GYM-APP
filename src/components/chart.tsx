import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface ChartPoint {
  label: string;
  value: number;
}

/**
 * Dependency-free mini bar chart for a single series.
 * - One hue for all bars; the best value is highlighted and labeled ("PR"),
 *   so the highlight never relies on color alone.
 * - Only the max gets a value label (selective labeling).
 */
export function MiniBarChart({
  data,
  color = colors.accent,
  highlightColor = colors.gold,
  unit = '',
  height = 120,
}: {
  data: ChartPoint[];
  color?: string;
  highlightColor?: string;
  unit?: string;
  height?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const maxIdx = data.findIndex((d) => d.value === max);

  return (
    <View>
      <View style={[styles.plot, { height }]}>
        {data.map((d, i) => {
          const h = Math.max(6, (d.value / max) * (height - 26));
          const isMax = i === maxIdx;
          return (
            <View key={i} style={styles.col}>
              {isMax && (
                <Text style={styles.prLabel} numberOfLines={1}>
                  🏆 {formatValue(d.value)}
                  {unit ? ` ${unit}` : ''}
                </Text>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: isMax ? highlightColor : color,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      {/* X labels: first and last only, to avoid collisions */}
      <View style={styles.xAxis}>
        <Text style={styles.xLabel}>{data[0].label}</Text>
        {data.length > 1 && <Text style={styles.xLabel}>{data[data.length - 1].label}</Text>}
      </View>
    </View>
  );
}

function formatValue(v: number): string {
  if (v >= 10000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString();
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4, // surface gap between bars
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 0,
  },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  bar: {
    alignSelf: 'stretch',
    borderTopLeftRadius: radius.sm / 2,
    borderTopRightRadius: radius.sm / 2,
    minWidth: 6,
  },
  prLabel: { fontSize: 10, fontWeight: '800', color: colors.text },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  xLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '600' },
});

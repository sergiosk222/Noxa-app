import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { mockSearchSections } from '@/src/data';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import type { SearchCategory, SearchResult } from '@/src/types';

const FILTERS: { label: string; value: SearchCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Drivers', value: 'drivers' },
  { label: 'Cars', value: 'cars' },
  { label: 'Crews', value: 'crews' },
  { label: 'Events', value: 'events' },
];

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  drivers: 'Driver',
  cars: 'Car',
  crews: 'Crew',
  events: 'Event',
};

function HeaderButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityLabel="Go back" activeOpacity={0.78} onPress={onPress} style={styles.headerButton}>
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ResultRow({ item }: { item: SearchResult }) {
  return (
    <TouchableOpacity activeOpacity={0.82} style={styles.resultRow}>
      <View style={styles.resultIconWrap}>
        <Ionicons name={item.icon} size={20} color={colors.text} />
      </View>
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.resultSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{TYPE_LABELS[item.type]}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<SearchCategory>('all');
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockSearchSections
      .map((section) => ({
        ...section,
        results: section.results.filter((result) => {
          const matchesFilter = activeFilter === 'all' || result.type === activeFilter;
          const searchableText = `${result.title} ${result.subtitle} ${TYPE_LABELS[result.type]}`.toLowerCase();
          const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

          return matchesFilter && matchesQuery;
        }),
      }))
      .filter((section) => section.results.length > 0);
  }, [activeFilter, query]);

  return (
    <NoxaScreen>
      <NoxaHeader title="SEARCH" left={<HeaderButton onPress={() => router.back()} />} />

      <View style={styles.searchShell}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search drivers, cars, crews, events"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((filter) => (
          <FilterChip key={filter.value} active={activeFilter === filter.value} label={filter.label} onPress={() => setActiveFilter(filter.value)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.results.map((result, index) => (
                  <View key={`${section.title}-${result.id}`}>
                    <ResultRow item={result} />
                    {index < section.results.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={26} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>Try a driver, car, crew, or event name.</Text>
          </View>
        )}
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#11141B',
  },
  searchShell: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#11141B',
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  filterChip: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  filterChipActive: {
    borderColor: 'rgba(255,45,45,0.46)',
    backgroundColor: 'rgba(255,45,45,0.16)',
  },
  filterText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  filterTextActive: {
    color: colors.text,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: '#101319',
  },
  resultRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultIconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1A1E27',
  },
  resultCopy: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: -0.25,
  },
  resultSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  typeBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginLeft: 74,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#101319',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});

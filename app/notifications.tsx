import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { mockNotifications } from '@/src/data';
import type { NotificationFilter, NoxaNotification } from '@/src/types';
import { NoxaEmptyState, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

const filters: { label: string; value: NotificationFilter; types?: NoxaNotification['type'][] }[] = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'events', types: ['event'] },
  { label: 'Social', value: 'social', types: ['social', 'comment', 'car', 'achievement'] },
  { label: 'Crews', value: 'crews', types: ['crew'] },
];

const sections: NoxaNotification['section'][] = ['Today', 'Earlier'];

function BackButton() {
  const router = useRouter();

  return (
    <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

function FilterChip({ isActive, label, onPress }: { isActive: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.filterChip, isActive && styles.filterChipActive, pressed && styles.pressed]}>
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

function NotificationCard({ notification }: { notification: NoxaNotification }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, notification.isImportant && styles.importantCard, pressed && styles.pressed]}>
      <View style={[styles.iconRail, notification.isImportant && styles.importantIconRail]}>
        <Ionicons name={notification.icon} size={20} color={notification.isImportant ? colors.accent : colors.text} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{notification.title}</Text>
          {notification.isUnread ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.cardSubtitle}>{notification.subtitle}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{notification.time}</Text>
          {notification.actionLabel ? (
            <>
              <View style={styles.metaDot} />
              <Text style={[styles.actionText, notification.isImportant && styles.actionTextImportant]}>{notification.actionLabel}</Text>
            </>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

function EmptyState() {
  return (
    <NoxaEmptyState
      icon="notifications-off-outline"
      title="No notifications yet"
      body="When crews, events, drivers, and garage updates need attention, they’ll land here."
    />
  );
}

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const visibleNotifications = useMemo(() => {
    const filter = filters.find((item) => item.value === activeFilter);

    if (!filter?.types) {
      return mockNotifications;
    }

    return mockNotifications.filter((notification) => filter.types?.includes(notification.type));
  }, [activeFilter]);

  return (
    <NoxaScreen padded={false}>
      <View style={styles.shell}>
        <NoxaHeader left={<BackButton />} title="NOTIFICATIONS" subtitle="What needs your attention" />

        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <FilterChip key={filter.value} isActive={activeFilter === filter.value} label={filter.label} onPress={() => setActiveFilter(filter.value)} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {visibleNotifications.length === 0 ? (
            <EmptyState />
          ) : (
            sections.map((section) => {
              const sectionNotifications = visibleNotifications.filter((notification) => notification.section === section);

              if (sectionNotifications.length === 0) {
                return null;
              }

              return (
                <View key={section} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section}</Text>
                  <View style={styles.cardStack}>
                    {sectionNotifications.map((notification) => (
                      <NotificationCard key={notification.id} notification={notification} />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.primaryMuted,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  filterTextActive: {
    color: colors.text,
  },
  scrollContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardStack: {
    gap: spacing.md,
  },
  card: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  importantCard: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.surfaceRaised,
  },
  iconRail: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  importantIconRail: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.primarySubtle,
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    lineHeight: 21,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
  },
  actionText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actionTextImportant: {
    color: colors.accent,
  },
});

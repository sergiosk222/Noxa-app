import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { animations, colors, radius, shadows, spacing, typography } from '@/src/theme';

type EventRow = {
  id: string;
  title: string;
  location_name: string;
  starts_at: string;
  is_public: boolean;
};

type EventWithCount = EventRow & { attendeeCount: number };

function useSlideUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(animations.entranceDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: animations.entrance, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: animations.entrance, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function EventCard({ event, index }: { event: EventWithCount; index: number }) {
  const router = useRouter();

  return (
    <Animated.View style={[styles.eventCard, useSlideUp(120 + index * 55)]}>
      <Pressable
        accessibilityLabel={`View ${event.title}`}
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })}
        style={({ pressed }) => [styles.eventPressable, pressed && styles.pressed]}>
        <View style={styles.redAccent} />
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <NoxaBadge label={event.is_public ? 'PUBLIC' : 'PRIVATE'} variant={event.is_public ? 'primary' : 'default'} />
        </View>
        <View style={styles.eventMetaGrid}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatEventDate(event.starts_at)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{event.location_name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{event.attendeeCount} going</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);

    const { data, error: eventsError } = await supabase
      .from('events')
      .select('id,title,location_name,starts_at,is_public')
      .eq('status', 'scheduled')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true });

    if (eventsError) {
      setError(eventsError.message);
      setEvents([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const rows = (data ?? []) as EventRow[];
    const ids = rows.map((event) => event.id);
    const counts = new Map<string, number>();

    if (ids.length > 0) {
      const { data: attendeeRows, error: attendeesError } = await supabase.from('event_attendees').select('event_id').in('event_id', ids);

      if (attendeesError) {
        setError(attendeesError.message);
        setEvents([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      for (const attendee of attendeeRows ?? []) {
        counts.set(attendee.event_id, (counts.get(attendee.event_id) ?? 0) + 1);
      }
    }

    setEvents(rows.map((event) => ({ ...event, attendeeCount: counts.get(event.id) ?? 0 })));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadEvents(false);
  }, [loadEvents]);

  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} refreshControl={<RefreshControl tintColor={colors.primary} refreshing={refreshing} onRefresh={onRefresh} />}>
        <NoxaHeader title="EVENTS" subtitle="Real meets from the NOXA community" />
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <NoxaBadge label="LIVE EVENTS" variant="primary" />
          <Text style={styles.heroTitle}>Find the next clean meet.</Text>
          <Text style={styles.heroText}>Upcoming public events and your private hosted plans appear here.</Text>
          <NoxaButton title="Create Event" fullWidth onPress={() => router.push('/event-editor')} />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <Text style={styles.sectionMeta}>{events.length} events</Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Loading events…</Text></View>
        ) : error ? (
          <View style={styles.stateCard}><Text style={styles.stateTitle}>Events unavailable</Text><Text style={styles.stateText}>{error}</Text><NoxaButton title="Retry" onPress={() => void loadEvents()} /></View>
        ) : events.length === 0 ? (
          <View style={styles.stateCard}><Text style={styles.stateTitle}>No upcoming events</Text><Text style={styles.stateText}>Create the first scheduled NOXA event.</Text></View>
        ) : (
          events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)
        )}
      </ScrollView>

      <View style={styles.bottomAction} pointerEvents="box-none">
        <Pressable accessibilityLabel="Create Event" accessibilityRole="button" onPress={() => router.push('/event-editor')} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.text} />
          <Text style={styles.createText}>Create Event</Text>
        </Pressable>
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 164, gap: spacing.lg },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  heroCard: { overflow: 'hidden', gap: spacing.md, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  heroGlow: { position: 'absolute', right: -72, top: -64, width: 190, height: 190, borderRadius: 95, backgroundColor: colors.primaryMuted },
  heroTitle: { color: colors.text, fontSize: typography.h1, fontWeight: '900', letterSpacing: -0.8 },
  heroText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700', lineHeight: 22 },
  listHeader: { marginTop: spacing.xs, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900', letterSpacing: -0.3 },
  sectionMeta: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  eventCard: { overflow: 'hidden', borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  eventPressable: { padding: spacing.lg, gap: spacing.sm },
  redAccent: { position: 'absolute', left: 0, top: spacing.lg, bottom: spacing.lg, width: 3, borderTopRightRadius: radius.pill, borderBottomRightRadius: radius.pill, backgroundColor: colors.primary },
  eventHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  eventTitle: { flex: 1, color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', letterSpacing: -0.2 },
  eventMetaGrid: { gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { flex: 1, color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', lineHeight: 19 },
  stateCard: { gap: spacing.md, alignItems: 'center', padding: spacing.xl, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  stateTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  stateText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700', textAlign: 'center' },
  bottomAction: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 106, alignItems: 'center' },
  createButton: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.xxl, borderRadius: radius.pill, backgroundColor: colors.primary, ...shadows.redGlow },
  createText: { color: colors.text, fontSize: typography.body, fontWeight: '900', letterSpacing: 0.2 },
});

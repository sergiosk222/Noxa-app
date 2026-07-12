import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type EventRow = { id: string; creator_id: string; title: string; description: string | null; location_name: string; starts_at: string; ends_at: string | null; cover_image_url: string | null; is_public: boolean; status: string; created_at: string; updated_at: string };
type CreatorProfile = { id: string; display_name: string | null; username: string | null; avatar_url: string | null; city: string | null };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const placeholderImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=88';

function HeaderAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><Ionicons name={icon} size={21} color={colors.text} /></Pressable>;
}
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)); }
function displayName(profile: CreatorProfile | null) { return profile?.display_name || profile?.username || 'NOXA driver'; }

export default function EventDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const [event, setEvent] = useState<EventRow | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const isHost = useMemo(() => Boolean(event && currentUserId === event.creator_id), [currentUserId, event]);

  const loadAttendance = useCallback(async (id: string, userId: string | null) => {
    const { count, error: countError } = await supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('event_id', id);
    if (countError) throw countError;
    setAttendeeCount(count ?? 0);
    if (userId) {
      const { data, error: mineError } = await supabase.from('event_attendees').select('event_id').eq('event_id', id).eq('user_id', userId).maybeSingle();
      if (mineError) throw mineError;
      setIsAttending(Boolean(data));
    } else setIsAttending(false);
  }, []);

  const loadEvent = useCallback(async () => {
    setLoading(true); setError(null); setNotFound(false);
    if (!uuidPattern.test(eventId)) { setNotFound(true); setLoading(false); return; }
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    setCurrentUserId(userId);
    const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle();
    if (eventError) { setError(eventError.message); setLoading(false); return; }
    if (!eventData) { setNotFound(true); setLoading(false); return; }
    const loadedEvent = eventData as EventRow;
    setEvent(loadedEvent);
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('id,display_name,username,avatar_url,city').eq('id', loadedEvent.creator_id).maybeSingle();
    if (profileError) { setError(profileError.message); setLoading(false); return; }
    setCreator((profileData as CreatorProfile | null) ?? null);
    try { await loadAttendance(loadedEvent.id, userId); } catch (attendanceError) { setError(attendanceError instanceof Error ? attendanceError.message : 'Attendance could not be loaded.'); }
    setLoading(false);
  }, [eventId, loadAttendance]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);

  const toggleAttendance = useCallback(async () => {
    if (!event || !currentUserId || isHost || busy) return;
    setBusy(true); setError(null);
    const result = isAttending
      ? await supabase.from('event_attendees').delete().eq('event_id', event.id).eq('user_id', currentUserId)
      : await supabase.from('event_attendees').insert({ event_id: event.id, user_id: currentUserId });
    if (result.error) setError(result.error.message);
    else await loadAttendance(event.id, currentUserId);
    setBusy(false);
  }, [busy, currentUserId, event, isAttending, isHost, loadAttendance]);

  const confirmDelete = useCallback(() => {
    if (!event || !currentUserId || deleting) return;
    Alert.alert('Delete event?', 'This removes the event and its attendance list.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Event', style: 'destructive', onPress: async () => {
        setDeleting(true); setError(null);
        const { data, error: deleteError } = await supabase.from('events').delete().eq('id', event.id).eq('creator_id', currentUserId).select('id');
        if (deleteError) { setError(deleteError.message); setDeleting(false); return; }
        if (!data || data.length !== 1) { setError('Event was not deleted.'); setDeleting(false); return; }
        router.replace('/(tabs)/events');
      }},
    ]);
  }, [currentUserId, deleting, event]);

  const bottomLabel = isHost ? 'HOSTING' : isAttending ? 'Going' : 'Join Event';

  return (
    <NoxaScreen padded={false}>
      <View style={styles.header}><HeaderAction icon="chevron-back" label="Go back" onPress={() => router.back()} /><HeaderAction icon="refresh" label="Retry" onPress={() => void loadEvent()} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? <View style={styles.fullState}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Loading event…</Text></View> : notFound ? <View style={styles.fullState}><Text style={styles.stateTitle}>Event not found</Text><NoxaButton title="Back to Events" onPress={() => router.replace('/(tabs)/events')} /></View> : event ? <>
          <View style={styles.heroCard}><Image source={{ uri: event.cover_image_url ?? placeholderImage }} style={styles.heroImage} /><View style={styles.heroShade} /><View style={styles.heroBottomShade} /><View style={styles.heroContent}><NoxaBadge label={event.is_public ? 'PUBLIC' : 'PRIVATE'} variant={event.is_public ? 'primary' : 'default'} /><Text style={styles.heroTitle}>{event.title}</Text><View style={styles.heroMetaRow}><Ionicons name="location-outline" size={17} color={colors.text} /><Text style={styles.heroMeta}>{event.location_name}</Text></View><View style={styles.heroMetaRow}><Ionicons name="time-outline" size={17} color={colors.text} /><Text style={styles.heroMeta}>{formatDate(event.starts_at)}</Text></View>{event.ends_at ? <Text style={styles.heroMeta}>Ends {formatDate(event.ends_at)}</Text> : null}</View></View>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/driver-profile/[id]', params: { id: event.creator_id } })} style={({ pressed }) => [styles.cardCompact, pressed && styles.pressed]}>{creator?.avatar_url ? <Image source={{ uri: creator.avatar_url }} style={styles.hostAvatar} /> : <View style={styles.hostAvatarFallback}><Ionicons name="person" size={24} color={colors.text} /></View>}<View style={styles.hostCopy}><Text style={styles.eyebrow}>Host</Text><Text style={styles.hostName}>{displayName(creator)}</Text><Text style={styles.mutedText}>{creator?.city ?? 'NOXA community'}</Text></View><Ionicons name="shield-checkmark" size={22} color={colors.primary} /></Pressable>
          <View style={styles.sectionCard}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Attendance</Text><Text style={styles.sectionMeta}>{attendeeCount} going</Text></View><Text style={styles.description}>{isHost ? 'You are hosting this event.' : isAttending ? 'You are on the attendance list.' : 'Join when you plan to attend.'}</Text></View>
          {event.description ? <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Description</Text><Text style={styles.description}>{event.description}</Text></View> : null}
          {isHost ? <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Organizer controls</Text><NoxaButton title="Edit Event" variant="secondary" onPress={() => router.push({ pathname: '/event-editor', params: { id: event.id } })} /><NoxaButton title="Delete Event" variant="danger" loading={deleting} onPress={confirmDelete} /></View> : null}
        </> : null}
        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text><NoxaButton title="Retry" variant="secondary" onPress={() => void loadEvent()} /></View> : null}
      </ScrollView>
      {event && !loading && !notFound ? <View style={styles.bottomBar}><Pressable accessibilityRole="button" disabled={isHost || busy || !currentUserId} onPress={toggleAttendance} style={({ pressed }) => [styles.joinButton, (isHost || isAttending) && styles.joinedButton, pressed && !isHost && styles.pressed]}><Text style={styles.joinText}>{busy ? 'Saving…' : bottomLabel}</Text></Pressable></View> : null}
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
  headerAction: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(8,10,14,0.72)' },
  pressed: { opacity: 0.86, transform: [{ translateY: 1 }, { scale: 0.98 }] }, content: { paddingBottom: 132, gap: spacing.lg },
  heroCard: { height: 390, overflow: 'hidden', borderBottomLeftRadius: 36, borderBottomRightRadius: 36, backgroundColor: colors.surface, ...shadows.card }, heroImage: { width: '100%', height: '100%' }, heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' }, heroBottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 210, backgroundColor: 'rgba(0,0,0,0.64)' }, heroContent: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl, gap: spacing.xs }, heroTitle: { color: colors.text, fontSize: 43, fontWeight: '900', letterSpacing: -1.3 }, heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }, heroMeta: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  cardCompact: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card }, hostAvatar: { width: 58, height: 58, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.72)' }, hostAvatarFallback: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft }, hostCopy: { flex: 1 }, eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }, hostName: { marginTop: 2, color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' }, mutedText: { marginTop: 2, color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  sectionCard: { marginHorizontal: spacing.lg, gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, sectionTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900', letterSpacing: -0.3 }, sectionMeta: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  fullState: { minHeight: 420, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }, stateTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900' }, stateText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700' }, errorCard: { marginHorizontal: spacing.lg, gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderAccent, backgroundColor: colors.primaryMuted }, errorText: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: 'rgba(5,6,8,0.94)' }, joinButton: { height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primary, ...shadows.redGlow }, joinedButton: { backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.borderStrong, shadowOpacity: 0 }, joinText: { color: colors.text, fontSize: typography.body, fontWeight: '900', letterSpacing: 0.3 },
});

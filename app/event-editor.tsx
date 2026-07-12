import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaButton, NoxaHeader, NoxaInput, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type EventForm = { title: string; description: string; locationName: string; startDate: string; startTime: string; endDate: string; endTime: string; isPublic: boolean };
type EventRow = { id: string; creator_id: string; title: string; description: string | null; location_name: string; starts_at: string; ends_at: string | null; is_public: boolean };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const initialForm: EventForm = { title: '', description: '', locationName: '', startDate: '', startTime: '', endDate: '', endTime: '', isPublic: true };

function pad(value: number) { return String(value).padStart(2, '0'); }
function toDateInput(value: Date) { return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`; }
function toTimeInput(value: Date) { return `${pad(value.getHours())}:${pad(value.getMinutes())}`; }
function parseLocalDateTime(dateValue: string, timeValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim()) || !/^\d{2}:\d{2}$/.test(timeValue.trim())) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return null;
  return date;
}
function prefillFromEvent(event: EventRow): EventForm {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  return { title: event.title, description: event.description ?? '', locationName: event.location_name, startDate: toDateInput(start), startTime: toTimeInput(start), endDate: end ? toDateInput(end) : '', endTime: end ? toTimeInput(end) : '', isPublic: event.is_public };
}

export default function EventEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const eventId = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = Boolean(eventId);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (isEditing ? 'EDIT EVENT' : 'CREATE EVENT'), [isEditing]);
  const updateField = useCallback(<K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm((current) => ({ ...current, [key]: value })), []);

  const loadEvent = useCallback(async () => {
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setError('Sign in to manage events.'); setLoading(false); return; }
    setCurrentUserId(authData.user.id);
    if (!eventId) { setLoading(false); return; }
    if (!uuidPattern.test(eventId)) { setError('Invalid event id.'); setLoading(false); return; }
    const { data, error: eventError } = await supabase.from('events').select('id,creator_id,title,description,location_name,starts_at,ends_at,is_public').eq('id', eventId).maybeSingle();
    if (eventError) setError(eventError.message);
    else if (!data) setError('Event not found.');
    else if ((data as EventRow).creator_id !== authData.user.id) setError('Only the event host can edit this event.');
    else setForm(prefillFromEvent(data as EventRow));
    setLoading(false);
  }, [eventId]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);

  const validate = useCallback(() => {
    const titleValue = form.title.trim();
    const locationValue = form.locationName.trim();
    if (!titleValue) return 'Title is required.';
    if (titleValue.length > 100) return 'Title must be 100 characters or less.';
    if (form.description.length > 2000) return 'Description must be 2000 characters or less.';
    if (!locationValue) return 'Location is required.';
    if (locationValue.length > 160) return 'Location must be 160 characters or less.';
    const start = parseLocalDateTime(form.startDate, form.startTime);
    if (!start) return 'Enter a valid start date and time.';
    if (!isEditing && start.getTime() <= Date.now()) return 'Start time must be in the future.';
    let end: Date | null = null;
    if (form.endDate.trim() || form.endTime.trim()) {
      end = parseLocalDateTime(form.endDate, form.endTime);
      if (!end) return 'Enter a valid end date and time, or leave both end fields blank.';
      if (end.getTime() <= start.getTime()) return 'End time must be later than start time.';
    }
    return { title: titleValue, location: locationValue, start, end };
  }, [form, isEditing]);

  const saveEvent = useCallback(async () => {
    if (saving) return;
    setError(null);
    const valid = validate();
    if (typeof valid === 'string') { setError(valid); return; }
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? currentUserId;
    if (!userId) { setError('Sign in to save events.'); setSaving(false); return; }
    const payload = { title: valid.title, description: form.description.trim() || null, location_name: valid.location, starts_at: valid.start.toISOString(), ends_at: valid.end?.toISOString() ?? null, is_public: form.isPublic };
    const result = isEditing && eventId
      ? await supabase.from('events').update(payload).eq('id', eventId).eq('creator_id', userId).select('id').maybeSingle()
      : await supabase.from('events').insert({ ...payload, creator_id: userId }).select('id').single();
    if (result.error || !result.data) { setError(result.error?.message ?? 'Event could not be saved.'); setSaving(false); return; }
    router.replace({ pathname: '/event-details', params: { id: result.data.id } });
    setSaving(false);
  }, [currentUserId, eventId, form, isEditing, saving, validate]);

  return (
    <NoxaScreen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <NoxaHeader title={title} subtitle="Real NOXA community events" />
          {loading ? <View style={styles.stateCard}><ActivityIndicator color={colors.primary} /><Text style={styles.stateText}>Loading event…</Text></View> : null}
          {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}
          <View style={styles.formCard}>
            <NoxaInput label="Title" value={form.title} onChangeText={(value) => updateField('title', value)} maxLength={100} />
            <NoxaInput label="Description" value={form.description} onChangeText={(value) => updateField('description', value)} multiline maxLength={2000} style={styles.textArea} />
            <NoxaInput label="Location" value={form.locationName} onChangeText={(value) => updateField('locationName', value)} maxLength={160} />
            <View style={styles.row}><NoxaInput label="Start date (YYYY-MM-DD)" value={form.startDate} onChangeText={(value) => updateField('startDate', value)} style={styles.rowInput} /><NoxaInput label="Start time (HH:MM)" value={form.startTime} onChangeText={(value) => updateField('startTime', value)} style={styles.rowInput} /></View>
            <View style={styles.row}><NoxaInput label="End date (optional)" value={form.endDate} onChangeText={(value) => updateField('endDate', value)} style={styles.rowInput} /><NoxaInput label="End time (optional)" value={form.endTime} onChangeText={(value) => updateField('endTime', value)} style={styles.rowInput} /></View>
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: form.isPublic }} onPress={() => updateField('isPublic', !form.isPublic)} style={({ pressed }) => [styles.visibility, pressed && styles.pressed]}>
              <View><Text style={styles.visibilityTitle}>{form.isPublic ? 'Public event' : 'Private event'}</Text><Text style={styles.visibilityText}>{form.isPublic ? 'Visible to NOXA drivers.' : 'Only you can see it for now.'}</Text></View>
              <View style={[styles.toggle, form.isPublic && styles.toggleActive]}><View style={[styles.knob, form.isPublic && styles.knobActive]} /></View>
            </Pressable>
          </View>
          <NoxaButton title={isEditing ? 'Save Changes' : 'Create Event'} fullWidth loading={saving} disabled={loading || saving || Boolean(isEditing && error)} onPress={saveEvent} />
        </ScrollView>
      </KeyboardAvoidingView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  formCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card },
  row: { flexDirection: 'row', gap: spacing.sm }, rowInput: { flex: 1 }, textArea: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  visibility: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
  visibilityTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' }, visibilityText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  toggle: { width: 54, height: 32, justifyContent: 'center', padding: 3, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleActive: { backgroundColor: colors.primaryMuted, borderColor: colors.borderAccent }, knob: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: colors.textMuted }, knobActive: { marginLeft: 22, backgroundColor: colors.primary },
  stateCard: { gap: spacing.sm, alignItems: 'center', padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, stateText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700' },
  errorCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderAccent, backgroundColor: colors.primaryMuted }, errorText: { color: colors.text, fontSize: typography.caption, fontWeight: '800' }, pressed: { opacity: 0.86, transform: [{ translateY: 1 }, { scale: 0.98 }] },
});

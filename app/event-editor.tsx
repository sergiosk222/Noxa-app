import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaButton, NoxaHeader, NoxaInput, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type EventForm = { title: string; description: string; locationName: string; startAt: Date; endAt: Date | null; isPublic: boolean; latitude: number | null; longitude: number | null };
type EventRow = { id: string; creator_id: string; title: string; description: string | null; location_name: string; starts_at: string; ends_at: string | null; is_public: boolean; latitude: number | null; longitude: number | null };
type PickerTarget = 'startDate' | 'startTime' | 'endDate' | 'endTime';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function futureStart() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return date;
}

const initialForm: EventForm = { title: '', description: '', locationName: '', startAt: futureStart(), endAt: null, isPublic: true, latitude: null, longitude: null };
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

function isValidDate(value: Date | null) { return value instanceof Date && !Number.isNaN(value.getTime()); }
function mergeDatePart(base: Date | null, picked: Date) {
  const current = base ?? futureStart();
  return new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), current.getHours(), current.getMinutes(), 0, 0);
}
function mergeTimePart(base: Date | null, picked: Date) {
  const current = base ?? futureStart();
  return new Date(current.getFullYear(), current.getMonth(), current.getDate(), picked.getHours(), picked.getMinutes(), 0, 0);
}
function formatCoords(latitude: number, longitude: number) { return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`; }
function buildAddress(addresses: Location.LocationGeocodedAddress[], latitude: number, longitude: number) {
  const address = addresses[0];
  if (!address) return formatCoords(latitude, longitude);
  const street = [address.name, address.street].filter(Boolean).join(' ').trim();
  const parts = [street, address.city, address.region].filter(Boolean);
  return parts.length ? Array.from(new Set(parts)).join(', ') : formatCoords(latitude, longitude);
}
function prefillFromEvent(event: EventRow): EventForm {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  return { title: event.title, description: event.description ?? '', locationName: event.location_name, startAt: isValidDate(start) ? start : futureStart(), endAt: isValidDate(end) ? end : null, isPublic: event.is_public, latitude: event.latitude, longitude: event.longitude };
}

export default function EventEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const eventId = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = Boolean(eventId);
  const [form, setForm] = useState<EventForm>(initialForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(futureStart());

  const title = useMemo(() => (isEditing ? 'EDIT EVENT' : 'CREATE EVENT'), [isEditing]);
  const coordinatesAttached = form.latitude !== null && form.longitude !== null;
  const updateField = useCallback(<K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm((current) => ({ ...current, [key]: value })), []);
  const updateLocationText = useCallback((value: string) => setForm((current) => ({ ...current, locationName: value, latitude: null, longitude: null })), []);

  const loadEvent = useCallback(async () => {
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setError('Sign in to manage events.'); setLoading(false); return; }
    setCurrentUserId(authData.user.id);
    if (!eventId) { setLoading(false); return; }
    if (!uuidPattern.test(eventId)) { setError('Invalid event id.'); setLoading(false); return; }
    const { data, error: eventError } = await supabase.from('events').select('id,creator_id,title,description,location_name,starts_at,ends_at,is_public,latitude,longitude').eq('id', eventId).maybeSingle();
    if (eventError) setError(eventError.message);
    else if (!data) setError('Event not found.');
    else if ((data as EventRow).creator_id !== authData.user.id) setError('Only the event host can edit this event.');
    else setForm(prefillFromEvent(data as EventRow));
    setLoading(false);
  }, [eventId]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);

  const openPicker = useCallback((target: PickerTarget) => {
    const value = target.startsWith('end') ? form.endAt ?? form.startAt : form.startAt;
    setDraftDate(value);
    setPickerTarget(target);
  }, [form.endAt, form.startAt]);

  const commitPicker = useCallback(() => {
    if (!pickerTarget) return;
    setForm((current) => {
      if (pickerTarget === 'startDate') return { ...current, startAt: mergeDatePart(current.startAt, draftDate) };
      if (pickerTarget === 'startTime') return { ...current, startAt: mergeTimePart(current.startAt, draftDate) };
      if (pickerTarget === 'endDate') return { ...current, endAt: mergeDatePart(current.endAt ?? current.startAt, draftDate) };
      return { ...current, endAt: mergeTimePart(current.endAt ?? current.startAt, draftDate) };
    });
    setPickerTarget(null);
  }, [draftDate, pickerTarget]);

  const useCurrentLocation = useCallback(async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('Location permission needed', 'Allow foreground location access to attach your current address, or enter the location manually.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      setForm((current) => ({ ...current, locationName: buildAddress(addresses, latitude, longitude), latitude, longitude }));
    } catch {
      Alert.alert('Location unavailable', 'We could not get your current location. You can still enter the event location manually.');
    } finally {
      setIsLocating(false);
    }
  }, [isLocating]);

  const validate = useCallback(() => {
    const titleValue = form.title.trim();
    const locationValue = form.locationName.trim();
    if (!titleValue) return 'Title is required.';
    if (titleValue.length > 100) return 'Title must be 100 characters or less.';
    if (form.description.length > 2000) return 'Description must be 2000 characters or less.';
    if (!locationValue) return 'Location is required.';
    if (locationValue.length > 160) return 'Location must be 160 characters or less.';
    if (!isValidDate(form.startAt)) return 'Select a valid start date and time.';
    if (!isEditing && form.startAt.getTime() <= Date.now()) return 'Start time must be in the future.';
    if (form.endAt) {
      if (!isValidDate(form.endAt)) return 'Select a valid end date and time, or clear the end value.';
      if (form.endAt.getTime() <= form.startAt.getTime()) return 'End time must be later than start time.';
    }
    return { title: titleValue, location: locationValue, start: form.startAt, end: form.endAt };
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
    const payload = { title: valid.title, description: form.description.trim() || null, location_name: valid.location, starts_at: valid.start.toISOString(), ends_at: valid.end?.toISOString() ?? null, is_public: form.isPublic, latitude: form.latitude, longitude: form.longitude };
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
            <NoxaInput label="Location" value={form.locationName} onChangeText={updateLocationText} maxLength={160} />
            <Pressable onPress={useCurrentLocation} disabled={isLocating} style={({ pressed }) => [styles.locationAction, pressed && styles.pressed, isLocating && styles.disabled]}><Text style={styles.locationActionText}>{isLocating ? 'Locating…' : 'Use Current Location'}</Text></Pressable>
            {coordinatesAttached ? <Text style={styles.verified}>Location verified</Text> : null}
            <View style={styles.row}><PickerRow label="Start Date" value={dateFormatter.format(form.startAt)} onPress={() => openPicker('startDate')} /><PickerRow label="Start Time" value={timeFormatter.format(form.startAt)} onPress={() => openPicker('startTime')} /></View>
            <View style={styles.row}><PickerRow label="End Date" value={form.endAt ? dateFormatter.format(form.endAt) : 'Optional'} onPress={() => openPicker('endDate')} /><PickerRow label="End Time" value={form.endAt ? timeFormatter.format(form.endAt) : 'Optional'} onPress={() => openPicker('endTime')} /></View>
            {form.endAt ? <Pressable onPress={() => updateField('endAt', null)} style={({ pressed }) => [styles.clearEnd, pressed && styles.pressed]}><Text style={styles.clearEndText}>Clear end time</Text></Pressable> : null}
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: form.isPublic }} onPress={() => updateField('isPublic', !form.isPublic)} style={({ pressed }) => [styles.visibility, pressed && styles.pressed]}>
              <View><Text style={styles.visibilityTitle}>{form.isPublic ? 'Public event' : 'Private event'}</Text><Text style={styles.visibilityText}>{form.isPublic ? 'Visible to NOXA drivers.' : 'Only you can see it for now.'}</Text></View>
              <View style={[styles.toggle, form.isPublic && styles.toggleActive]}><View style={[styles.knob, form.isPublic && styles.knobActive]} /></View>
            </Pressable>
          </View>
          <NoxaButton title={isEditing ? 'Save Changes' : 'Create Event'} fullWidth loading={saving} disabled={loading || saving || Boolean(isEditing && error)} onPress={saveEvent} />
        </ScrollView>
        <Modal animationType="fade" transparent visible={pickerTarget !== null} onRequestClose={() => setPickerTarget(null)}>
          <View style={styles.modalBackdrop}><View style={styles.pickerSheet}><View style={styles.pickerHeader}><Pressable onPress={() => setPickerTarget(null)}><Text style={styles.pickerAction}>Cancel</Text></Pressable><Text style={styles.pickerTitle}>{pickerTarget?.includes('Date') ? 'Select date' : 'Select time'}</Text><Pressable onPress={commitPicker}><Text style={styles.pickerDone}>Done</Text></Pressable></View><DateTimePicker value={draftDate} mode={pickerTarget?.includes('Date') ? 'date' : 'time'} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_: unknown, selected?: Date) => { if (selected) setDraftDate(selected); }} themeVariant="dark" textColor={colors.text} /></View></View>
        </Modal>
      </KeyboardAvoidingView>
    </NoxaScreen>
  );
}

function PickerRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.pickerRow, pressed && styles.pressed]}><Text style={styles.pickerLabel}>{label}</Text><Text style={styles.pickerValue}>{value}</Text></Pressable>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  formCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card },
  row: { flexDirection: 'row', gap: spacing.sm }, textArea: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  pickerRow: { flex: 1, gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
  pickerLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }, pickerValue: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  locationAction: { alignSelf: 'flex-start', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderAccent, backgroundColor: colors.primaryMuted }, locationActionText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' }, verified: { color: colors.primary, fontSize: typography.caption, fontWeight: '900' }, disabled: { opacity: 0.55 },
  clearEnd: { alignSelf: 'flex-start', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }, clearEndText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  visibility: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft },
  visibilityTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' }, visibilityText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  toggle: { width: 54, height: 32, justifyContent: 'center', padding: 3, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleActive: { backgroundColor: colors.primaryMuted, borderColor: colors.borderAccent }, knob: { width: 24, height: 24, borderRadius: radius.pill, backgroundColor: colors.textMuted }, knobActive: { marginLeft: 22, backgroundColor: colors.primary },
  stateCard: { gap: spacing.sm, alignItems: 'center', padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, stateText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700' },
  errorCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderAccent, backgroundColor: colors.primaryMuted }, errorText: { color: colors.text, fontSize: typography.caption, fontWeight: '800' }, pressed: { opacity: 0.86, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' }, pickerSheet: { padding: spacing.lg, paddingBottom: spacing.xl, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, pickerAction: { color: colors.textMuted, fontSize: typography.body, fontWeight: '800' }, pickerDone: { color: colors.primary, fontSize: typography.body, fontWeight: '900' }, pickerTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
});

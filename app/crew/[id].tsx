import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageStyle } from 'react-native';

import { NoxaAvatar, NoxaBadge, NoxaButton, NoxaCard, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type CrewRole = 'owner' | 'admin' | 'member';
type Crew = { id: string; owner_id: string; name: string; description: string | null; city: string | null; logo_url: string | null; cover_image_url: string | null; is_public: boolean; created_at: string; updated_at: string | null };
type Profile = { id: string; display_name: string | null; username: string | null; avatar_url: string | null; city: string | null };
type Membership = { crew_id: string; user_id: string; role: CrewRole; joined_at: string | null };
type Vehicle = { id: string; owner_id: string; brand: string | null; model: string | null; year: number | null; horsepower: number | null; color: string | null; cover_image_url: string | null; is_public: boolean | null };
type Member = Membership & { profile: Profile | null };
type PendingInvitation = { id: string; crew_id: string; invited_user_id: string; invited_by: string; status: string; created_at: string; invitedProfile: Profile | null; invitedByProfile: Profile | null };
type ProfileSearchResult = Profile & { pendingInvitationId: string | null; isMember: boolean };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const crewSelect = 'id,owner_id,name,description,city,logo_url,cover_image_url,is_public,created_at,updated_at';
const profileSelect = 'id,display_name,username,avatar_url,city';
const memberSelect = 'crew_id,user_id,role,joined_at';
const vehicleSelect = 'id,owner_id,brand,model,year,horsepower,color,cover_image_url,is_public';

function normalizeId(id: string | string[] | undefined) { return (Array.isArray(id) ? id[0] : id)?.trim() ?? ''; }
function isPresent(value?: string | number | null) { return value !== undefined && value !== null && String(value).trim() !== ''; }
function displayName(profile: Profile | null) { return profile?.display_name || profile?.username || 'Driver'; }
function initials(value: string) { return value.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2) || 'NX'; }
function vehicleName(vehicle: Vehicle) { return [vehicle.year, vehicle.brand, vehicle.model].filter(isPresent).join(' ') || 'Vehicle'; }

function Header() {
  return <View style={styles.header}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}><Ionicons name="chevron-back" size={22} color={colors.text} /></Pressable><Text style={styles.headerTitle}>CREW</Text><View style={styles.headerButtonPlaceholder} /></View>;
}
function StateCard({ title, message, onRetry, loading }: { title: string; message?: string; onRetry?: () => void; loading?: boolean }) {
  return <NoxaCard><View style={styles.stateCard}>{loading ? <ActivityIndicator color={colors.primary} /> : null}<Text style={styles.stateTitle}>{title}</Text>{message ? <Text style={styles.stateText}>{message}</Text> : null}{onRetry ? <NoxaButton title="Retry" onPress={onRetry} /> : null}<NoxaButton title="Back" variant="secondary" onPress={() => router.back()} /></View></NoxaCard>;
}
function ProfileAvatar({ profile, size = 48 }: { profile: Profile | null; size?: number }) {
  const name = displayName(profile);
  return profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <NoxaAvatar initials={initials(name)} size={size} />;
}

export default function CrewDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const crewId = useMemo(() => normalizeId(id), [id]);
  const isValidCrewId = uuidPattern.test(crewId);
  const [crew, setCrew] = useState<Crew | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<ProfileSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);
  const loadingRef = useRef(false);

  const loadCrew = useCallback(async (showSpinner = true) => {
    if (!isValidCrewId) { setCrew(null); setOwner(null); setMembers([]); setPendingInvitations([]); setVehicles([]); setError('This crew link is invalid.'); setLoading(false); return; }
    if (loadingRef.current) return;
    loadingRef.current = true;
    const token = requestId.current + 1; requestId.current = token;
    if (showSpinner) setLoading(true); setError(null);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;
    const { data: crewData, error: crewError } = await supabase.from('crews').select(crewSelect).eq('id', crewId).maybeSingle();
    if (requestId.current !== token) { loadingRef.current = false; return; }
    if (crewError || !crewData) { setCurrentUserId(userId); setCrew(null); setOwner(null); setMembers([]); setPendingInvitations([]); setVehicles([]); setError('Crew not found or unavailable.'); setLoading(false); loadingRef.current = false; return; }
    const loadedCrew = crewData as Crew;
    const [ownerResult, memberResult] = await Promise.all([
      supabase.from('profiles').select(profileSelect).eq('id', loadedCrew.owner_id).maybeSingle(),
      supabase.from('crew_members').select(memberSelect).eq('crew_id', loadedCrew.id),
    ]);
    if (requestId.current !== token) { loadingRef.current = false; return; }
    if (ownerResult.error || memberResult.error) { setError('Crew details are unavailable right now.'); setLoading(false); loadingRef.current = false; return; }
    const membershipRows = ((memberResult.data ?? []) as Membership[]).sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : a.role === 'admin' && b.role !== 'admin' ? -1 : b.role === 'admin' && a.role !== 'admin' ? 1 : (a.joined_at ?? '').localeCompare(b.joined_at ?? '')));
    const ids = Array.from(new Set([...membershipRows.map((m) => m.user_id), loadedCrew.owner_id]));
    const { data: profileRows, error: profilesError } = ids.length > 0 ? await supabase.from('profiles').select(profileSelect).in('id', ids) : { data: [], error: null };
    if (requestId.current !== token) { loadingRef.current = false; return; }
    if (profilesError) { setError('Member profiles are unavailable right now.'); setLoading(false); loadingRef.current = false; return; }
    const profileMap = new Map(((profileRows ?? []) as Profile[]).map((profile) => [profile.id, profile]));
    const normalizedMemberships = membershipRows.some((m) => m.user_id === loadedCrew.owner_id) ? membershipRows : [{ crew_id: loadedCrew.id, user_id: loadedCrew.owner_id, role: 'owner' as CrewRole, joined_at: loadedCrew.created_at }, ...membershipRows];
    const nextMembers = normalizedMemberships.map((member) => ({ ...member, role: member.user_id === loadedCrew.owner_id ? 'owner' as CrewRole : member.role, profile: profileMap.get(member.user_id) ?? null })).sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : a.role === 'admin' && b.role !== 'admin' ? -1 : b.role === 'admin' && a.role !== 'admin' ? 1 : (a.joined_at ?? '').localeCompare(b.joined_at ?? '')));
    let vehicleRows: Vehicle[] = [];
    let nextPendingInvitations: PendingInvitation[] = [];
    if (userId && nextMembers.some((member) => member.user_id === userId && (member.role === 'owner' || member.role === 'admin'))) {
      const { data: invitationRows, error: invitationsError } = await supabase.from('crew_invitations').select('id,crew_id,invited_user_id,invited_by,status,created_at').eq('crew_id', loadedCrew.id).eq('status', 'pending').order('created_at', { ascending: false });
      if (requestId.current !== token) { loadingRef.current = false; return; }
      if (invitationsError) { setError('Crew invitations are unavailable right now.'); setLoading(false); loadingRef.current = false; return; }
      const invitations = (invitationRows ?? []) as Omit<PendingInvitation, 'invitedProfile' | 'invitedByProfile'>[];
      if (invitations.length > 0) {
        const profileIds = Array.from(new Set(invitations.flatMap((invite) => [invite.invited_user_id, invite.invited_by])));
        const { data: invitationProfileRows, error: invitationProfilesError } = await supabase.from('profiles').select(profileSelect).in('id', profileIds);
        if (requestId.current !== token) { loadingRef.current = false; return; }
        if (invitationProfilesError) { setError('Invitation profiles are unavailable right now.'); setLoading(false); loadingRef.current = false; return; }
        const invitationProfileMap = new Map(((invitationProfileRows ?? []) as Profile[]).map((profile) => [profile.id, profile]));
        nextPendingInvitations = invitations.map((invite) => ({ ...invite, invitedProfile: invitationProfileMap.get(invite.invited_user_id) ?? null, invitedByProfile: invitationProfileMap.get(invite.invited_by) ?? null }));
      }
    }
    const memberIds = Array.from(new Set(nextMembers.map((member) => member.user_id)));
    if (memberIds.length > 0) {
      const { data: loadedVehicles, error: vehiclesError } = await supabase.from('vehicles').select(vehicleSelect).eq('is_public', true).in('owner_id', memberIds).order('year', { ascending: false }).order('brand', { ascending: true });
      if (requestId.current !== token) { loadingRef.current = false; return; }
      if (vehiclesError) { setError('Crew garage is unavailable right now.'); setLoading(false); loadingRef.current = false; return; }
      vehicleRows = (loadedVehicles ?? []) as Vehicle[];
    }
    setCurrentUserId(userId); setCrew(loadedCrew); setOwner((ownerResult.data as Profile | null) ?? profileMap.get(loadedCrew.owner_id) ?? null); setMembers(nextMembers); setPendingInvitations(nextPendingInvitations); setVehicles(vehicleRows); setLoading(false); loadingRef.current = false;
  }, [crewId, isValidCrewId]);

  useFocusEffect(useCallback(() => { void loadCrew(); return () => { requestId.current += 1; loadingRef.current = false; }; }, [loadCrew]));

  const membership = currentUserId ? members.find((member) => member.user_id === currentUserId) : undefined;
  const isOwner = Boolean(crew && currentUserId === crew.owner_id);
  const isAdmin = membership?.role === 'admin';
  const canManageCrew = isOwner || isAdmin;
  const isMember = Boolean(membership) || isOwner;
  const ownerById = useMemo(() => new Map(members.map((member) => [member.user_id, displayName(member.profile)])), [members]);

  const joinCrew = useCallback(async () => {
    if (!crew || !currentUserId || joining || leaving || !crew.is_public) { if (!currentUserId) Alert.alert('Sign in required', 'Sign in to join this crew.'); return; }
    setJoining(true); const { error: joinError } = await supabase.from('crew_members').insert({ crew_id: crew.id, user_id: currentUserId, role: 'member' }); setJoining(false);
    if (joinError && joinError.code !== '23505') { Alert.alert('Could not join', 'This crew cannot be joined right now.'); return; }
    void loadCrew(false);
  }, [crew, currentUserId, joining, leaving, loadCrew]);
  const leaveCrew = useCallback(() => {
    if (!crew || !currentUserId || leaving || joining || isOwner) return;
    Alert.alert('Leave crew?', `Leave ${crew.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: () => void (async () => { setLeaving(true); const { error: leaveError } = await supabase.from('crew_members').delete().eq('crew_id', crew.id).eq('user_id', currentUserId).eq('role', 'member'); setLeaving(false); if (leaveError) { Alert.alert('Could not leave', 'Please try again.'); return; } void loadCrew(false); })() }]);
  }, [crew, currentUserId, isOwner, joining, leaving, loadCrew]);


  const escapeLike = useCallback((value: string) => value.replace(/[\\%_]/g, (match) => `\\${match}`), []);

  const searchProfiles = useCallback(async () => {
    const query = inviteQuery.trim();
    if (!crew || query.length < 2 || searching) { if (query.length < 2) Alert.alert('Search username', 'Enter at least 2 characters.'); return; }
    setSearching(true);
    const { data, error: searchError } = await supabase.from('profiles').select(profileSelect).ilike('username', `%${escapeLike(query)}%`).limit(10);
    setSearching(false);
    if (searchError) { Alert.alert('Search unavailable', 'Please try again.'); return; }
    const memberIdsSet = new Set(members.map((member) => member.user_id));
    const pendingByUser = new Map(pendingInvitations.map((invite) => [invite.invited_user_id, invite.id]));
    setInviteResults(((data ?? []) as Profile[]).filter((profile) => profile.id !== currentUserId).map((profile) => ({ ...profile, isMember: memberIdsSet.has(profile.id), pendingInvitationId: pendingByUser.get(profile.id) ?? null })));
  }, [crew, currentUserId, escapeLike, inviteQuery, members, pendingInvitations, searching]);

  const inviteUser = useCallback(async (profileId: string) => {
    if (!crew || inviteActionId) return;
    setInviteActionId(profileId);
    const { error: inviteError } = await supabase.rpc('noxa_invite_to_crew', { target_crew_id: crew.id, target_user_id: profileId });
    setInviteActionId(null);
    if (inviteError) { Alert.alert('Invite not sent', 'Please try again.'); return; }
    setInviteResults([]); setInviteQuery(''); void loadCrew(false);
  }, [crew, inviteActionId, loadCrew]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    if (inviteActionId) return;
    setInviteActionId(invitationId);
    const { data: ok, error: cancelError } = await supabase.rpc('noxa_cancel_crew_invitation', { target_invitation_id: invitationId });
    setInviteActionId(null);
    if (cancelError || ok !== true) { Alert.alert('Invitation not cancelled', 'Please try again.'); return; }
    void loadCrew(false);
  }, [inviteActionId, loadCrew]);

  const setMemberRole = useCallback((member: Member, role: 'admin' | 'member') => {
    if (!crew || memberActionId) return;
    const run = () => void (async () => {
      setMemberActionId(member.user_id);
      const { data: ok, error: roleError } = await supabase.rpc('noxa_set_crew_member_role', { target_crew_id: crew.id, target_user_id: member.user_id, target_role: role });
      setMemberActionId(null);
      if (roleError || ok !== true) { Alert.alert('Role not updated', 'Please try again.'); return; }
      void loadCrew(false);
    })();
    if (role === 'member') Alert.alert('Demote admin?', `Demote ${displayName(member.profile)} to Member?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Demote', style: 'destructive', onPress: run }]);
    else run();
  }, [crew, loadCrew, memberActionId]);

  const removeMember = useCallback((member: Member) => {
    if (!crew || memberActionId) return;
    Alert.alert('Remove member?', `Remove ${displayName(member.profile)} from ${crew.name}?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => void (async () => {
      setMemberActionId(member.user_id);
      const { data: ok, error: removeError } = await supabase.rpc('noxa_remove_crew_member', { target_crew_id: crew.id, target_user_id: member.user_id });
      setMemberActionId(null);
      if (removeError || ok !== true) { Alert.alert('Member not removed', 'Please try again.'); return; }
      void loadCrew(false);
    }) }]);
  }, [crew, loadCrew, memberActionId]);

  return <NoxaScreen padded={false}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><Header />{loading ? <StateCard loading title="Loading crew..." /> : null}{!loading && error ? <StateCard title={error} onRetry={isValidCrewId ? () => void loadCrew() : undefined} /> : null}{!loading && !error && crew ? <><View style={styles.heroCard}>{crew.cover_image_url ? <ImageBackground source={{ uri: crew.cover_image_url }} resizeMode="cover" style={styles.cover} imageStyle={styles.coverRadius as ImageStyle}>{null}</ImageBackground> : <View style={[styles.cover, styles.coverPlaceholder]}><Ionicons name="people" size={72} color="rgba(255,45,45,0.34)" /></View>}<View style={styles.heroContent}><View style={styles.logoWrap}>{crew.logo_url ? <Image source={{ uri: crew.logo_url }} style={styles.logo} /> : <Text style={styles.logoInitials}>{initials(crew.name)}</Text>}</View><Text style={styles.heroTitle}>{crew.name}</Text>{crew.city ? <Text style={styles.heroMeta}>{crew.city}</Text> : null}<NoxaBadge label={crew.is_public ? 'PUBLIC' : 'PRIVATE'} variant={crew.is_public ? 'primary' : 'default'} /></View></View><View style={styles.statsRow}><NoxaCard style={styles.statCard}><Text style={styles.statValue}>{members.length}</Text><Text style={styles.statLabel}>Drivers</Text></NoxaCard><NoxaCard style={styles.statCard}><Text style={styles.statValue}>{vehicles.length}</Text><Text style={styles.statLabel}>Cars</Text></NoxaCard></View>{isPresent(crew.description) ? <NoxaCard><Text style={styles.cardTitle}>Description</Text><Text style={styles.bodyText}>{crew.description}</Text></NoxaCard> : null}<NoxaCard><Text style={styles.cardTitle}>Membership</Text>{isOwner ? <NoxaButton title="Owner" disabled /> : isMember ? <NoxaButton title={leaving ? 'Leaving...' : 'Leave Crew'} variant="danger" disabled={leaving || joining} onPress={leaveCrew} /> : crew.is_public ? <NoxaButton title={joining ? 'Joining...' : 'Join Crew'} disabled={joining || leaving} onPress={joinCrew} /> : <NoxaButton title="Private Crew" disabled />}</NoxaCard>{owner ? <Pressable accessibilityRole="button" accessibilityLabel="Open owner driver profile" onPress={() => router.push({ pathname: '/driver-profile/[id]', params: { id: owner.id } })} style={({ pressed }) => [pressed && styles.pressed]}><NoxaCard><Text style={styles.cardTitle}>Owner</Text><View style={styles.personRow}><ProfileAvatar profile={owner} /><View style={styles.personCopy}><Text style={styles.personName}>{displayName(owner)}</Text><Text style={styles.personMeta}>{[owner.username ? `@${owner.username}` : null, owner.city].filter(isPresent).join(' • ')}</Text></View></View></NoxaCard></Pressable> : null}{canManageCrew ? <NoxaCard><Text style={styles.cardTitle}>Invite Member</Text><View style={styles.inlineRow}><TextInput placeholder="Search username" placeholderTextColor={colors.textMuted} autoCapitalize="none" value={inviteQuery} onChangeText={setInviteQuery} style={styles.input} /><Pressable disabled={searching} onPress={() => void searchProfiles()} style={({ pressed }) => [styles.compactButton, pressed && styles.pressed]}><Text style={styles.compactButtonText}>{searching ? '...' : 'Search'}</Text></Pressable></View>{inviteResults.length > 0 ? <View style={styles.list}>{inviteResults.map((profile) => <View key={profile.id} style={styles.personRow}><ProfileAvatar profile={profile} /><View style={styles.personCopy}><Text style={styles.personName}>{displayName(profile)}</Text><Text style={styles.personMeta}>{profile.username ? `@${profile.username}` : 'NOXA driver'}</Text></View><Pressable disabled={profile.isMember || Boolean(profile.pendingInvitationId) || inviteActionId === profile.id} onPress={() => void inviteUser(profile.id)} style={({ pressed }) => [styles.miniAction, (profile.isMember || Boolean(profile.pendingInvitationId)) && styles.miniActionDisabled, pressed && styles.pressed]}><Text style={styles.miniActionText}>{profile.isMember ? 'Member' : profile.pendingInvitationId ? 'Pending' : inviteActionId === profile.id ? 'Sending' : 'Invite'}</Text></Pressable></View>)}</View> : null}{pendingInvitations.length > 0 ? <View style={styles.list}><Text style={styles.subTitle}>Pending invitations</Text>{pendingInvitations.map((invite) => <View key={invite.id} style={styles.personRow}><ProfileAvatar profile={invite.invitedProfile} /><View style={styles.personCopy}><Text style={styles.personName}>{displayName(invite.invitedProfile)}</Text><Text style={styles.personMeta}>Pending{invite.invitedByProfile ? ` • by ${displayName(invite.invitedByProfile)}` : ''}</Text></View><Pressable disabled={inviteActionId === invite.id} onPress={() => void cancelInvitation(invite.id)} style={({ pressed }) => [styles.miniAction, styles.miniActionDisabled, pressed && styles.pressed]}><Text style={styles.miniActionText}>{inviteActionId === invite.id ? '...' : 'Cancel'}</Text></Pressable></View>)}</View> : null}</NoxaCard> : null}<NoxaCard><Text style={styles.cardTitle}>Members</Text>{members.length === 0 ? <Text style={styles.emptyText}>No visible members yet.</Text> : <View style={styles.list}>{members.map((member) => { const canPromote = isOwner && member.role === 'member'; const canDemote = isOwner && member.role === 'admin'; const canRemove = member.role !== 'owner' && currentUserId !== member.user_id && (isOwner || (isAdmin && member.role === 'member')); return <View key={member.user_id} style={styles.memberRow}><Pressable accessibilityRole="button" accessibilityLabel="Open member driver profile" onPress={() => router.push({ pathname: '/driver-profile/[id]', params: { id: member.user_id } })} style={({ pressed }) => [styles.personRow, styles.memberProfilePress, pressed && styles.pressed]}><ProfileAvatar profile={member.profile} /><View style={styles.personCopy}><Text style={styles.personName}>{displayName(member.profile)}</Text><Text style={styles.personMeta}>{member.profile?.username ? `@${member.profile.username}` : member.profile?.city ?? 'NOXA driver'}</Text></View><NoxaBadge label={member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Member'} variant={member.role === 'owner' ? 'primary' : 'default'} /></Pressable>{canPromote || canDemote || canRemove ? <View style={styles.memberControls}>{canPromote ? <Pressable disabled={memberActionId === member.user_id} onPress={() => setMemberRole(member, 'admin')} style={({ pressed }) => [styles.miniAction, pressed && styles.pressed]}><Text style={styles.miniActionText}>Promote</Text></Pressable> : null}{canDemote ? <Pressable disabled={memberActionId === member.user_id} onPress={() => setMemberRole(member, 'member')} style={({ pressed }) => [styles.miniAction, styles.miniActionDisabled, pressed && styles.pressed]}><Text style={styles.miniActionText}>Demote</Text></Pressable> : null}{canRemove ? <Pressable disabled={memberActionId === member.user_id} onPress={() => removeMember(member)} style={({ pressed }) => [styles.miniAction, styles.dangerMiniAction, pressed && styles.pressed]}><Text style={styles.miniActionText}>Remove</Text></Pressable> : null}</View> : null}</View>; })}</View>}</NoxaCard><NoxaCard><Text style={styles.cardTitle}>Crew Garage</Text>{vehicles.length === 0 ? <Text style={styles.emptyText}>No public member cars yet.</Text> : <View style={styles.list}>{vehicles.map((vehicle) => <Pressable key={vehicle.id} accessibilityRole="button" accessibilityLabel="Open vehicle details" onPress={() => router.push({ pathname: '/vehicle-details', params: { id: vehicle.id } })} style={({ pressed }) => [styles.vehicleRow, pressed && styles.pressed]}>{vehicle.cover_image_url ? <Image source={{ uri: vehicle.cover_image_url }} style={styles.vehicleImage} /> : <View style={[styles.vehicleImage, styles.vehiclePlaceholder]}><Ionicons name="car-sport" size={28} color={colors.primary} /></View>}<View style={styles.personCopy}><Text style={styles.personName}>{vehicleName(vehicle)}</Text><Text style={styles.personMeta}>{[ownerById.get(vehicle.owner_id), vehicle.horsepower ? `${vehicle.horsepower} HP` : null, vehicle.color].filter(isPresent).join(' • ')}</Text></View></Pressable>)}</View>}</NoxaCard></> : null}</ScrollView></NoxaScreen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 126, gap: spacing.lg },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  headerButtonPlaceholder: { width: 44, height: 44 },
  headerTitle: { color: colors.text, fontSize: typography.caption, fontWeight: '900', letterSpacing: 2.4 },
  pressed: { opacity: 0.86, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  stateCard: { gap: spacing.md, alignItems: 'center' },
  stateTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', textAlign: 'center' },
  stateText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700', lineHeight: 22, textAlign: 'center' },
  heroCard: { overflow: 'hidden', borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  cover: { height: 180, justifyContent: 'center', alignItems: 'center' },
  coverRadius: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  coverPlaceholder: { backgroundColor: colors.surfaceSoft },
  heroContent: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg, marginTop: -46 },
  logoWrap: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft, borderWidth: 3, borderColor: colors.surface, overflow: 'hidden' },
  logo: { width: '100%', height: '100%' },
  logoInitials: { color: colors.text, fontSize: 30, fontWeight: '900' },
  heroTitle: { color: colors.text, fontSize: typography.h1, fontWeight: '900', textAlign: 'center', letterSpacing: -0.8 },
  heroMeta: { color: colors.textMuted, fontSize: typography.body, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: typography.h1, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800', textTransform: 'uppercase' },
  cardTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900', marginBottom: spacing.md },
  bodyText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700', lineHeight: 23 },
  list: { gap: spacing.md },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.button },
  personCopy: { flex: 1, gap: 2 },
  personName: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  personMeta: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  input: { flex: 1, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.button, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, color: colors.text, fontSize: typography.body, fontWeight: '700' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  compactButton: { minHeight: 44, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button, backgroundColor: colors.primary },
  compactButtonText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' },
  subTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  memberRow: { gap: spacing.sm },
  memberProfilePress: { flex: 1 },
  memberControls: { flexDirection: 'row', gap: spacing.sm, paddingLeft: 60 },
  miniAction: { minHeight: 32, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primary },
  miniActionDisabled: { backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
  dangerMiniAction: { backgroundColor: colors.primary },
  miniActionText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' },
  emptyText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '700', lineHeight: 22 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.button },
  vehicleImage: { width: 72, height: 52, borderRadius: radius.button, backgroundColor: colors.surfaceSoft },
  vehiclePlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
});

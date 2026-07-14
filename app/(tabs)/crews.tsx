import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { NoxaBadge, NoxaHeader, NoxaScreen } from "@/src/components/ui";
import { supabase } from "@/src/lib/supabase";
import {
  animations,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from "@/src/theme";

const categories = ["Featured", "Nearby", "Invites", "My Crews"] as const;

const crewDots = [
  ["#FF2D2D", "#FFFFFF", "#8E919A"],
  ["#FFFFFF", "#8E919A", "#FF2D2D"],
  ["#8E919A", "#FF2D2D", "#FFFFFF"],
] as const;

type CrewRole = "owner" | "admin" | "member";
type JoinPolicy = "open" | "approval" | "invite_only";

type CrewRow = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  city: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  join_policy: JoinPolicy;
  created_at: string;
  profiles?:
    | { display_name: string | null; username: string | null }
    | { display_name: string | null; username: string | null }[]
    | null;
};

type CrewMemberRow = {
  crew_id: string;
  user_id: string;
  role: CrewRole;
};

type Invitation = {
  id: string;
  crew_id: string;
  invited_user_id: string;
  invited_by: string;
  status: string;
  created_at: string;
  crewName: string;
  crewCity: string | null;
  inviterName: string;
};

type JoinRequest = {
  id: string;
  crew_id: string;
  user_id: string;
  status: string;
  created_at: string;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  username: string | null;
};

type Crew = CrewRow & {
  ownerName: string;
  memberCount: number;
  currentUserRole: CrewRole | null;
  isCurrentUserMember: boolean;
  pendingJoinRequestId: string | null;
  dots: readonly string[];
};

function useSlideUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(animations.entranceDistance),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animations.entrance,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animations.entrance,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

function CreateIconButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Create crew"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={24} color={colors.text} />
    </Pressable>
  );
}

function FeaturedCrewCard({
  crew,
  loading,
}: {
  crew: Crew | null;
  loading: boolean;
}) {
  return (
    <Animated.View style={[styles.featuredCard, useSlideUp(80)]}>
      <View style={styles.featuredGlow} />
      <View style={styles.featuredTopRow}>
        <NoxaBadge label="FEATURED" variant="primary" />
        <View style={styles.memberPill}>
          <Ionicons name="people" size={15} color={colors.primary} />
          <Text style={styles.memberPillText}>
            {crew
              ? `${crew.memberCount} members`
              : loading
                ? "Loading"
                : "Real crews"}
          </Text>
        </View>
      </View>

      <View style={styles.featuredCopy}>
        <Text style={styles.featuredTitle}>
          {crew?.name ?? "Build your first crew."}
        </Text>
        <Text style={styles.featuredSubtitle}>
          {crew?.description ??
            "Real NOXA crews now sync through secure Supabase membership."}
        </Text>
        <View style={styles.featuredStats}>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={17}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>{crew?.city ?? "City optional"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="person-circle-outline"
              size={17}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>
              {crew ? `Owned by ${crew.ownerName}` : "Owner roles included"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.featuredCta}>
        <Text style={styles.featuredCtaText}>
          {crew
            ? crew.is_public
              ? "Public Crew"
              : "Private Crew"
            : "Create Crew"}
        </Text>
      </View>
    </Animated.View>
  );
}

function CategoryTabs() {
  return (
    <Animated.View style={[styles.categoryRow, useSlideUp(140)]}>
      {categories.map((category, index) => (
        <Pressable
          key={category}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.categoryTab,
            index === 0 && styles.categoryTabActive,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              index === 0 && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

function CrewDots({ dots }: { dots: readonly string[] }) {
  return (
    <View style={styles.dotRow}>
      {dots.map((dot, index) => (
        <View
          key={`${dot}-${index}`}
          style={[
            styles.memberDot,
            { backgroundColor: dot },
            index > 0 && styles.stackedDot,
          ]}
        />
      ))}
      <View style={[styles.memberDot, styles.moreDot, styles.stackedDot]}>
        <Text style={styles.moreDotText}>+</Text>
      </View>
    </View>
  );
}

function CrewCard({
  crew,
  index,
  busy,
  onJoin,
  onRequestJoin,
  onCancelRequest,
  onLeave,
}: {
  crew: Crew;
  index: number;
  busy: boolean;
  onJoin: (crew: Crew) => void;
  onRequestJoin: (crew: Crew) => void;
  onCancelRequest: (crew: Crew) => void;
  onLeave: (crew: Crew) => void;
}) {
  const canNavigate =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      crew.id,
    );
  const effectiveJoinPolicy = crew.is_public ? crew.join_policy : "invite_only";
  const actionLabel =
    crew.currentUserRole === "owner"
      ? "Owner"
      : crew.isCurrentUserMember
        ? "Leave Crew"
        : crew.pendingJoinRequestId
          ? "Cancel Request"
          : effectiveJoinPolicy === "open"
            ? "Join Crew"
            : effectiveJoinPolicy === "approval"
              ? "Request to Join"
              : "Invite Only";
  const canPress =
    !busy &&
    ["Join Crew", "Request to Join", "Cancel Request", "Leave Crew"].includes(
      actionLabel,
    );

  return (
    <Animated.View style={[styles.crewCard, useSlideUp(210 + index * 70)]}>
      <View style={styles.redAccent} />
      <Pressable
        accessibilityLabel={`Open ${crew.name} crew details`}
        accessibilityRole="button"
        disabled={!canNavigate}
        onPress={() => {
          if (canNavigate) {
            router.push({ pathname: "/crew/[id]", params: { id: crew.id } });
          }
        }}
        style={({ pressed }) => [
          styles.crewMainPress,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.crewHeader}>
          <View style={styles.crewTitleBlock}>
            <Text style={styles.crewName}>{crew.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{crew.city ?? "No city set"}</Text>
            </View>
            <Text style={styles.descriptionText}>
              {crew.description ?? `Owned by ${crew.ownerName}`}
            </Text>
          </View>
          <NoxaBadge
            label={crew.is_public ? "PUBLIC" : "PRIVATE"}
            variant={crew.is_public ? "primary" : "default"}
          />
        </View>
      </Pressable>

      <View style={styles.crewFooter}>
        <Pressable
          accessibilityLabel={`Open ${crew.name} crew details`}
          accessibilityRole="button"
          disabled={!canNavigate}
          onPress={() => {
            if (canNavigate) {
              router.push({ pathname: "/crew/[id]", params: { id: crew.id } });
            }
          }}
          style={({ pressed }) => [
            styles.crewFooterPress,
            pressed && styles.pressed,
          ]}
        >
          <CrewDots dots={crew.dots} />
          <View style={styles.memberCountRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>{crew.memberCount} members</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={!canPress}
          onPress={() => {
            if (actionLabel === "Join Crew") onJoin(crew);
            else if (actionLabel === "Request to Join") onRequestJoin(crew);
            else if (actionLabel === "Cancel Request") onCancelRequest(crew);
            else if (actionLabel === "Leave Crew") onLeave(crew);
          }}
          style={({ pressed }) => [
            styles.memberAction,
            !canPress && styles.memberActionDisabled,
            pressed && styles.pressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.memberActionText}>{actionLabel}</Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

function CreateCrewModal({
  visible,
  creating,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  creating: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    description: string;
    city: string;
    isPublic: boolean;
    joinPolicy: JoinPolicy;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>("approval");

  useEffect(() => {
    if (!visible) {
      setName("");
      setDescription("");
      setCity("");
      setIsPublic(true);
      setJoinPolicy("approval");
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={creating ? undefined : onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Create crew</Text>
          <TextInput
            placeholder="Crew name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={60}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            maxLength={500}
            multiline
            style={[styles.input, styles.textArea]}
          />
          <TextInput
            placeholder="City"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
            maxLength={80}
            style={styles.input}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Public crew</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{
                false: colors.surfaceSoft,
                true: colors.primaryMuted,
              }}
              thumbColor={isPublic ? colors.primary : colors.textMuted}
            />
          </View>
          {isPublic ? (
            <View style={styles.policyOptions}>
              {(["open", "approval", "invite_only"] as JoinPolicy[]).map(
                (policy) => (
                  <Pressable
                    key={policy}
                    accessibilityRole="button"
                    onPress={() => setJoinPolicy(policy)}
                    style={({ pressed }) => [
                      styles.policyOption,
                      joinPolicy === policy && styles.policyOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.policyOptionText}>
                      {policy === "open"
                        ? "Open"
                        : policy === "approval"
                          ? "Approval"
                          : "Invite Only"}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          ) : null}
          <View style={styles.modalActions}>
            <Pressable
              disabled={creating}
              onPress={onClose}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={creating}
              onPress={() =>
                onSubmit({
                  name,
                  description,
                  city,
                  isPublic,
                  joinPolicy: isPublic ? joinPolicy : "invite_only",
                })
              }
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              {creating ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.primaryButtonText}>Create</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CrewsScreen() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyCrewId, setBusyCrewId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const loadCrews = useCallback(async (showSpinner = true) => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    if (showSpinner) setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData.user?.id ?? null;

    if (!currentUserId) {
      if (mounted.current && requestId.current === currentRequest) {
        setUserId(null);
        setCrews([]);
        setInvitations([]);
        setError("Sign in to view and manage crews.");
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    const { data: inviteRows, error: invitationsError } = await supabase
      .from("crew_invitations")
      .select("id,crew_id,invited_user_id,invited_by,status,created_at")
      .eq("invited_user_id", currentUserId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (invitationsError) {
      if (mounted.current && requestId.current === currentRequest) {
        setUserId(currentUserId);
        setInvitations([]);
        setCrews([]);
        setError("Crew invitations are unavailable right now.");
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    const pendingInviteRows = (inviteRows ?? []) as Omit<
      Invitation,
      "crewName" | "crewCity" | "inviterName"
    >[];
    let nextInvitations: Invitation[] = [];
    if (pendingInviteRows.length > 0) {
      const invitedCrewIds = Array.from(
        new Set(pendingInviteRows.map((invite) => invite.crew_id)),
      );
      const inviterIds = Array.from(
        new Set(pendingInviteRows.map((invite) => invite.invited_by)),
      );
      const [inviteCrewsResult, invitersResult] = await Promise.all([
        supabase.from("crews").select("id,name,city").in("id", invitedCrewIds),
        supabase
          .from("profiles")
          .select("id,display_name,username")
          .in("id", inviterIds),
      ]);
      if (inviteCrewsResult.error || invitersResult.error) {
        if (mounted.current && requestId.current === currentRequest) {
          setUserId(currentUserId);
          setInvitations([]);
          setCrews([]);
          setError("Crew invitations are unavailable right now.");
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }
      const inviteCrewMap = new Map(
        (
          (inviteCrewsResult.data ?? []) as {
            id: string;
            name: string;
            city: string | null;
          }[]
        ).map((crew) => [crew.id, crew]),
      );
      const inviterMap = new Map(
        ((invitersResult.data ?? []) as ProfileLite[]).map((profile) => [
          profile.id,
          profile,
        ]),
      );
      nextInvitations = pendingInviteRows.map((invite) => {
        const invitedCrew = inviteCrewMap.get(invite.crew_id);
        const inviter = inviterMap.get(invite.invited_by);
        return {
          ...invite,
          crewName: invitedCrew?.name ?? "Crew",
          crewCity: invitedCrew?.city ?? null,
          inviterName: inviter?.display_name ?? inviter?.username ?? "Driver",
        };
      });
    }

    const { data, error: crewsError } = await supabase
      .from("crews")
      .select(
        "id,owner_id,name,description,city,logo_url,cover_image_url,is_public,join_policy,created_at,profiles:owner_id(display_name,username)",
      )
      .order("created_at", { ascending: false });

    if (crewsError) {
      if (mounted.current && requestId.current === currentRequest) {
        setUserId(currentUserId);
        setCrews([]);
        setError("Crews are unavailable right now.");
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    const rows = (data ?? []) as CrewRow[];
    const ids = rows.map((crew) => crew.id);
    const members = new Map<string, CrewMemberRow[]>();
    const pendingRequests = new Map<string, string>();

    if (ids.length > 0) {
      const { data: memberRows, error: membersError } = await supabase
        .from("crew_members")
        .select("crew_id,user_id,role")
        .in("crew_id", ids);

      if (membersError) {
        if (mounted.current && requestId.current === currentRequest) {
          setUserId(currentUserId);
          setCrews([]);
          setError("Crew memberships are unavailable right now.");
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }

      for (const member of (memberRows ?? []) as CrewMemberRow[]) {
        members.set(member.crew_id, [
          ...(members.get(member.crew_id) ?? []),
          member,
        ]);
      }
      const { data: requestRows, error: requestsError } = await supabase
        .from("crew_join_requests")
        .select("id,crew_id,user_id,status,created_at")
        .eq("user_id", currentUserId)
        .eq("status", "pending")
        .in("crew_id", ids);
      if (requestsError) {
        if (mounted.current && requestId.current === currentRequest) {
          setUserId(currentUserId);
          setCrews([]);
          setError("Crew join requests are unavailable right now.");
          setLoading(false);
          setRefreshing(false);
        }
        return;
      }
      for (const request of (requestRows ?? []) as JoinRequest[])
        pendingRequests.set(request.crew_id, request.id);
    }

    const nextCrews = rows.map((crew, index) => {
      const crewMembers = members.get(crew.id) ?? [];
      const currentMembership = crewMembers.find(
        (member) => member.user_id === currentUserId,
      );
      return {
        ...crew,
        ownerName:
          (Array.isArray(crew.profiles)
            ? (crew.profiles[0]?.display_name ?? crew.profiles[0]?.username)
            : (crew.profiles?.display_name ?? crew.profiles?.username)) ??
          "Driver",
        memberCount: crewMembers.length,
        currentUserRole:
          currentMembership?.role ??
          (crew.owner_id === currentUserId ? "owner" : null),
        isCurrentUserMember:
          Boolean(currentMembership) || crew.owner_id === currentUserId,
        pendingJoinRequestId: pendingRequests.get(crew.id) ?? null,
        dots: crewDots[index % crewDots.length],
      };
    });

    if (mounted.current && requestId.current === currentRequest) {
      setUserId(currentUserId);
      setInvitations(nextInvitations);
      setCrews(nextCrews);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCrews();
    }, [loadCrews]),
  );

  const openCreate = useCallback(() => setModalVisible(true), []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadCrews(false);
  }, [loadCrews]);

  const createCrew = useCallback(
    async ({
      name,
      description,
      city,
      isPublic,
      joinPolicy,
    }: {
      name: string;
      description: string;
      city: string;
      isPublic: boolean;
      joinPolicy: JoinPolicy;
    }) => {
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      const trimmedCity = city.trim();

      if (trimmedName.length < 2 || trimmedName.length > 60) {
        Alert.alert("Check crew name", "Crew names must be 2–60 characters.");
        return;
      }
      if (
        trimmedDescription.length > 500 ||
        trimmedCity.length > 80 ||
        creating
      )
        return;

      const ownerId = userId ?? (await supabase.auth.getUser()).data.user?.id;
      if (!ownerId) {
        Alert.alert("Sign in required", "Sign in to create a crew.");
        return;
      }

      setCreating(true);
      const { error: createError } = await supabase
        .from("crews")
        .insert({
          owner_id: ownerId,
          name: trimmedName,
          description: trimmedDescription || null,
          city: trimmedCity || null,
          is_public: isPublic,
          join_policy: isPublic ? joinPolicy : "invite_only",
        });
      setCreating(false);

      if (createError) {
        Alert.alert(
          "Crew not created",
          "Please check the details and try again.",
        );
        return;
      }

      setModalVisible(false);
      Alert.alert("Crew created", "Your crew is ready.");
      void loadCrews(false);
    },
    [creating, loadCrews, userId],
  );

  const joinCrew = useCallback(
    async (crew: Crew) => {
      if (!userId || busyCrewId) return;
      setBusyCrewId(crew.id);
      const { error: joinError } = await supabase
        .from("crew_members")
        .insert({ crew_id: crew.id, user_id: userId, role: "member" });
      setBusyCrewId(null);
      if (joinError && joinError.code !== "23505") {
        Alert.alert("Could not join", "This crew cannot be joined right now.");
        return;
      }
      void loadCrews(false);
    },
    [busyCrewId, loadCrews, userId],
  );

  const requestJoinCrew = useCallback(
    async (crew: Crew) => {
      if (!userId || busyCrewId) return;
      setBusyCrewId(crew.id);
      const { error: requestError } = await supabase.rpc(
        "noxa_request_crew_join",
        { target_crew_id: crew.id },
      );
      setBusyCrewId(null);
      if (requestError) {
        Alert.alert("Request not sent", "Please try again.");
        return;
      }
      void loadCrews(false);
    },
    [busyCrewId, loadCrews, userId],
  );

  const cancelJoinRequest = useCallback(
    async (crew: Crew) => {
      if (!crew.pendingJoinRequestId || busyCrewId) return;
      setBusyCrewId(crew.id);
      const { data: ok, error: cancelError } = await supabase.rpc(
        "noxa_cancel_crew_join_request",
        { target_request_id: crew.pendingJoinRequestId },
      );
      setBusyCrewId(null);
      if (cancelError || ok !== true) {
        Alert.alert("Request not cancelled", "Please try again.");
        return;
      }
      void loadCrews(false);
    },
    [busyCrewId, loadCrews],
  );

  const leaveCrew = useCallback(
    (crew: Crew) => {
      if (!userId || busyCrewId) return;
      Alert.alert("Leave crew?", `Leave ${crew.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusyCrewId(crew.id);
              const { error: leaveError } = await supabase
                .from("crew_members")
                .delete()
                .eq("crew_id", crew.id)
                .eq("user_id", userId)
                .eq("role", "member");
              setBusyCrewId(null);
              if (leaveError) {
                Alert.alert("Could not leave", "Please try again.");
                return;
              }
              void loadCrews(false);
            })();
          },
        },
      ]);
    },
    [busyCrewId, loadCrews, userId],
  );

  const respondToInvitation = useCallback(
    async (invitationId: string, accept: boolean) => {
      if (busyInvitationId) return;
      setBusyInvitationId(invitationId);
      const { data: ok, error: responseError } = await supabase.rpc(
        "noxa_respond_to_crew_invitation",
        { target_invitation_id: invitationId, accept },
      );
      setBusyInvitationId(null);
      if (responseError || ok !== true) {
        Alert.alert("Invitation not updated", "Please try again.");
        return;
      }
      setInvitations((current) =>
        current.filter((invite) => invite.id !== invitationId),
      );
      if (accept) void loadCrews(false);
    },
    [busyInvitationId, loadCrews],
  );

  const featuredCrew = crews[0] ?? null;

  return (
    <NoxaScreen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <NoxaHeader
          title="CREWS"
          subtitle="Find your people"
          right={<CreateIconButton onPress={openCreate} />}
        />
        <FeaturedCrewCard crew={featuredCrew} loading={loading} />
        <CategoryTabs />
        {invitations.length > 0 ? (
          <View style={styles.invitationCard}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Crew Invitations</Text>
              <Text style={styles.sectionMeta}>
                {invitations.length} pending
              </Text>
            </View>
            {invitations.map((invite) => (
              <View key={invite.id} style={styles.invitationRow}>
                <View style={styles.crewTitleBlock}>
                  <Text style={styles.crewName}>{invite.crewName}</Text>
                  <Text style={styles.metaText}>
                    {[invite.crewCity, `Invited by ${invite.inviterName}`]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                </View>
                <View style={styles.invitationActions}>
                  <Pressable
                    disabled={busyInvitationId === invite.id}
                    onPress={() => void respondToInvitation(invite.id, true)}
                    style={({ pressed }) => [
                      styles.smallPrimaryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    {busyInvitationId === invite.id ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={styles.smallButtonText}>Accept</Text>
                    )}
                  </Pressable>
                  <Pressable
                    disabled={busyInvitationId === invite.id}
                    onPress={() => void respondToInvitation(invite.id, false)}
                    style={({ pressed }) => [
                      styles.smallSecondaryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.smallButtonText}>Decline</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Community core</Text>
          <Text style={styles.sectionMeta}>{crews.length} crews</Text>
        </View>
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading crews…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Crews unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              onPress={() => void loadCrews()}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : crews.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No crews yet</Text>
            <Text style={styles.stateText}>
              Create the first real NOXA crew and start building your garage
              circle.
            </Text>
          </View>
        ) : (
          crews.map((crew, index) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              index={index}
              busy={busyCrewId === crew.id}
              onJoin={joinCrew}
              onRequestJoin={requestJoinCrew}
              onCancelRequest={cancelJoinRequest}
              onLeave={leaveCrew}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.bottomAction} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Create Crew"
          accessibilityRole="button"
          onPress={openCreate}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="add" size={22} color={colors.text} />
          <Text style={styles.createText}>Create Crew</Text>
        </Pressable>
      </View>
      <CreateCrewModal
        visible={modalVisible}
        creating={creating}
        onClose={() => setModalVisible(false)}
        onSubmit={createCrew}
      />
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 164,
    gap: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.84, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  featuredCard: {
    minHeight: 300,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  featuredGlow: {
    position: "absolute",
    right: -72,
    top: -64,
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: colors.primaryMuted,
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberPillText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  featuredCopy: { gap: spacing.sm },
  featuredTitle: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: "900",
    letterSpacing: -0.9,
  },
  featuredSubtitle: {
    color: colors.textMuted,
    fontSize: typography.cardTitle,
    fontWeight: "700",
  },
  featuredStats: { marginTop: spacing.xs, gap: spacing.xs },
  featuredCta: {
    width: "100%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  featuredCtaText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
    letterSpacing: typography.letterSpacing.caption,
    lineHeight: typography.lineHeight.body,
    textAlign: "center",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    lineHeight: 19,
  },
  descriptionText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
    lineHeight: 19,
  },
  categoryRow: { flexDirection: "row", gap: spacing.sm },
  categoryTab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.borderAccent,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  categoryTextActive: { color: colors.text },
  listHeader: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  invitationCard: {
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  invitationRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  invitationActions: { flexDirection: "row", gap: spacing.sm },
  smallPrimaryButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  smallSecondaryButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  policyOptions: { flexDirection: "row", gap: spacing.sm },
  policyOption: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  policyOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  policyOptionText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  smallButtonText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  crewCard: {
    overflow: "hidden",
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  redAccent: {
    position: "absolute",
    left: 0,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 3,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  crewMainPress: { borderRadius: radius.button },
  crewFooterPress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  crewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  crewTitleBlock: { flex: 1, gap: spacing.xs },
  crewName: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  crewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dotRow: { flexDirection: "row", alignItems: "center", paddingLeft: 2 },
  memberDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stackedDot: { marginLeft: -7 },
  moreDot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.surface,
  },
  moreDotText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  memberCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  memberAction: {
    minWidth: 76,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  memberActionDisabled: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberActionText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  stateCard: {
    gap: spacing.sm,
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "900",
  },
  stateText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
  },
  bottomAction: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 106,
    alignItems: "center",
  },
  createButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  createText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  modalCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "900",
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  textArea: { minHeight: 92, textAlignVertical: "top" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.button,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
});

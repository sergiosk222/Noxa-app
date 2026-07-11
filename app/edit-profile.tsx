import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  NoxaButton,
  NoxaCard,
  NoxaHeader,
  NoxaInput,
  NoxaScreen,
} from "@/src/components/ui";
import { supabase } from "@/src/lib/supabase";
import { colors, radius, spacing, typography } from "@/src/theme";

type ProfileForm = {
  displayName: string;
  username: string;
  city: string;
  bio: string;
};

type ProfileErrors = Partial<Record<keyof ProfileForm | "avatar" | "form", string>>;

type SelectedAvatar = {
  uri: string;
  mimeType: string;
  fileName?: string;
  fileSize?: number;
};

const avatarBucket = "avatars";
const maxAvatarBytes = 5 * 1024 * 1024;
const supportedAvatarMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const initialForm: ProfileForm = {
  displayName: "",
  username: "",
  city: "",
  bio: "",
};

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function validateForm(form: ProfileForm) {
  const errors: ProfileErrors = {};
  const displayName = form.displayName.trim();
  const username = normalizeUsername(form.username);
  const city = form.city.trim();
  const bio = form.bio.trim();

  if (!displayName) {
    errors.displayName = "Display name is required.";
  } else if (displayName.length < 2 || displayName.length > 40) {
    errors.displayName = "Display name must be 2–40 characters.";
  }

  if (username) {
    if (username.length < 3 || username.length > 20) {
      errors.username = "Username must be 3–20 characters.";
    } else if (!/^[a-z0-9_]+$/.test(username)) {
      errors.username = "Use only lowercase letters, numbers, and underscores.";
    }
  }

  if (city.length > 60) {
    errors.city = "City must be 60 characters or less.";
  }

  if (bio.length > 300) {
    errors.bio = "Bio must be 300 characters or less.";
  }

  return {
    errors,
    values: {
      displayName,
      username,
      city,
      bio,
    },
  };
}

function getInitials(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "NX"
  );
}

function normalizeMimeType(mimeType?: string | null) {
  if (!mimeType) {
    return null;
  }

  const normalized = mimeType.toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}

function getAvatarExtension(mimeType: string, fileName?: string) {
  const fileExtension = fileName?.split(".").pop()?.toLowerCase();

  if (fileExtension && ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fileExtension)) {
    return fileExtension === "jpg" ? "jpg" : fileExtension;
  }

  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

function getOwnedAvatarPath(avatarUrl: string | null, userId: string) {
  if (!avatarUrl || !avatarUrl.startsWith("https://")) {
    return null;
  }

  const marker = `/object/public/${avatarBucket}/`;
  const markerIndex = avatarUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const path = decodeURIComponent(avatarUrl.slice(markerIndex + marker.length).split("?")[0]);
  return path.startsWith(`${userId}/`) ? path : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "";
}

function mapSaveError(error: { code?: string; message?: string } | unknown) {
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  const errorMessage =
    typeof error === "object" && error && "message" in error
      ? String(error.message)
      : getErrorMessage(error);

  if (code === "23505") {
    return "This username is already taken.";
  }

  const message = errorMessage.toLowerCase();
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return "Unable to connect. Check your internet connection.";
  }

  return "Unable to save profile. Please try again.";
}

export default function EditProfileScreen() {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);

  const setField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setErrors({ form: "Sign in to edit your profile." });
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, username, city, bio, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      setErrors({ form: "Unable to load profile. Please try again." });
      setIsLoading(false);
      return;
    }

    setForm({
      displayName: data.display_name ?? "",
      username: data.username ?? "",
      city: data.city ?? "",
      bio: data.bio ?? "",
    });
    setAvatarUrl(data.avatar_url ?? null);
    setSelectedAvatar(null);
    setShouldRemoveAvatar(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);


  const chooseAvatar = async () => {
    if (isLoading || isSubmitting) {
      return;
    }

    setErrors((current) => ({ ...current, avatar: undefined, form: undefined }));

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrors((current) => ({
        ...current,
        avatar: "Allow photo access to choose an avatar.",
      }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: false,
      allowsMultipleSelection: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = normalizeMimeType(asset.mimeType);

    if (!mimeType || !supportedAvatarMimeTypes.includes(mimeType as (typeof supportedAvatarMimeTypes)[number])) {
      setErrors((current) => ({ ...current, avatar: "Choose a JPEG, PNG, WebP, HEIC, or HEIF image." }));
      return;
    }

    if (asset.fileSize && asset.fileSize > maxAvatarBytes) {
      setErrors((current) => ({ ...current, avatar: "Avatar must be 5 MB or less." }));
      return;
    }

    setSelectedAvatar({
      uri: asset.uri,
      mimeType,
      fileName: asset.fileName ?? undefined,
      fileSize: asset.fileSize ?? undefined,
    });
    setShouldRemoveAvatar(false);
  };

  const removeAvatar = () => {
    if (isLoading || isSubmitting) {
      return;
    }

    setSelectedAvatar(null);
    setShouldRemoveAvatar(true);
    setErrors((current) => ({ ...current, avatar: undefined, form: undefined }));
  };

  const uploadAvatar = async (userId: string, avatar: SelectedAvatar) => {
    const arrayBuffer = await fetch(avatar.uri).then((response) =>
      response.arrayBuffer()
    );

    if (arrayBuffer.byteLength > maxAvatarBytes) {
      throw new Error("Avatar must be 5 MB or less.");
    }

    const extension = getAvatarExtension(avatar.mimeType, avatar.fileName);
    const random = Math.random().toString(36).slice(2, 10);
    const path = `${userId}/${Date.now()}-${random}.${extension}`;
    const { error } = await supabase.storage
      .from(avatarBucket)
      .upload(path, arrayBuffer, { contentType: avatar.mimeType, upsert: false });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(avatarBucket).getPublicUrl(path);
    if (!data.publicUrl.startsWith("https://")) {
      await supabase.storage.from(avatarBucket).remove([path]);
      throw new Error("Unable to create a secure avatar URL.");
    }

    return { path, publicUrl: data.publicUrl };
  };

  const saveProfile = async () => {
    if (isSubmitting) {
      return;
    }

    const validation = validateForm(form);
    if (Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        setErrors({ form: "Sign in to save your profile." });
        setIsSubmitting(false);
        return;
      }

      let nextAvatarUrl = avatarUrl;
      let uploadedPath: string | null = null;

      if (selectedAvatar) {
        const uploadedAvatar = await uploadAvatar(user.id, selectedAvatar);
        uploadedPath = uploadedAvatar.path;
        nextAvatarUrl = uploadedAvatar.publicUrl;
      } else if (shouldRemoveAvatar) {
        nextAvatarUrl = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: validation.values.displayName,
          username: validation.values.username || null,
          city: validation.values.city || null,
          bio: validation.values.bio || null,
          avatar_url: nextAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id, display_name, username, avatar_url, bio, city")
        .single();

      if (error) {
        if (uploadedPath) {
          await supabase.storage.from(avatarBucket).remove([uploadedPath]);
        }
        setErrors({ form: error instanceof Error && error.message.includes("5 MB") ? error.message : mapSaveError(error) });
        setIsSubmitting(false);
        return;
      }

      const previousAvatarPath = getOwnedAvatarPath(avatarUrl, user.id);
      if ((selectedAvatar || shouldRemoveAvatar) && previousAvatarPath) {
        await supabase.storage.from(avatarBucket).remove([previousAvatarPath]);
      }

      setIsSubmitting(false);
      router.back();
    } catch (error) {
      setIsSubmitting(false);
      setErrors({
        form:
          error instanceof Error && error.message.includes("5 MB")
            ? error.message
            : mapSaveError(error),
      });
    }
  };

  return (
    <NoxaScreen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <NoxaHeader
            title="EDIT PROFILE"
            left={
              <Pressable
                accessibilityLabel="Back to profile"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
            }
          />

          <NoxaCard>
            <View style={styles.formStack}>
              {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}
              {isLoading ? (
                <Text style={styles.helperText}>Loading your profile…</Text>
              ) : null}

              <View style={styles.avatarSection}>
                <View style={styles.avatarPreview}>
                  {selectedAvatar ? (
                    <Image source={{ uri: selectedAvatar.uri }} style={styles.avatarImage} />
                  ) : avatarUrl && !shouldRemoveAvatar ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitials}>{getInitials(form.displayName)}</Text>
                  )}
                </View>
                <View style={styles.avatarActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isLoading || isSubmitting}
                    onPress={chooseAvatar}
                    style={({ pressed }) => [
                      styles.avatarActionButton,
                      pressed && !isSubmitting && styles.pressed,
                      (isLoading || isSubmitting) && styles.disabledAction,
                    ]}
                  >
                    <Text style={styles.avatarActionText}>
                      {selectedAvatar || (avatarUrl && !shouldRemoveAvatar) ? "Change Photo" : "Choose Photo"}
                    </Text>
                  </Pressable>
                  {(selectedAvatar || (avatarUrl && !shouldRemoveAvatar)) ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={isLoading || isSubmitting}
                      onPress={removeAvatar}
                      style={({ pressed }) => [
                        styles.avatarActionButton,
                        styles.avatarRemoveButton,
                        pressed && !isSubmitting && styles.pressed,
                        (isLoading || isSubmitting) && styles.disabledAction,
                      ]}
                    >
                      <Text style={styles.avatarActionText}>Remove Photo</Text>
                    </Pressable>
                  ) : null}
                </View>
                {errors.avatar ? <Text style={styles.errorText}>{errors.avatar}</Text> : null}
              </View>

              <FieldError message={errors.displayName}>
                <NoxaInput
                  autoCapitalize="words"
                  editable={!isLoading && !isSubmitting}
                  label="Display name"
                  maxLength={40}
                  onChangeText={(value) => setField("displayName", value)}
                  placeholder="Your display name"
                  value={form.displayName}
                />
              </FieldError>

              <FieldError message={errors.username}>
                <NoxaInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !isSubmitting}
                  label="Username"
                  maxLength={21}
                  onBlur={() => setField("username", normalizeUsername(form.username))}
                  onChangeText={(value) => setField("username", value)}
                  placeholder="noxa_driver"
                  value={form.username}
                />
              </FieldError>

              <FieldError message={errors.city}>
                <NoxaInput
                  autoCapitalize="words"
                  editable={!isLoading && !isSubmitting}
                  label="City"
                  maxLength={60}
                  onChangeText={(value) => setField("city", value)}
                  placeholder="Los Angeles"
                  value={form.city}
                />
              </FieldError>

              <FieldError message={errors.bio}>
                <NoxaInput
                  editable={!isLoading && !isSubmitting}
                  label="Bio"
                  maxLength={300}
                  multiline
                  onChangeText={(value) => setField("bio", value)}
                  placeholder="Tell the community about your garage."
                  style={styles.bioInput}
                  textAlignVertical="top"
                  value={form.bio}
                />
                <Text style={styles.counter}>{form.bio.length}/300</Text>
              </FieldError>

              <NoxaButton
                disabled={isLoading || isSubmitting}
                fullWidth
                loading={isSubmitting}
                onPress={saveProfile}
                title="Save Profile"
              />
            </View>
          </NoxaCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </NoxaScreen>
  );
}

function FieldError({
  children,
  message,
}: {
  children: ReactNode;
  message?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      {children}
      {message ? <Text style={styles.errorText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 144,
    gap: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  formStack: {
    gap: spacing.md,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarPreview: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 56,
    borderWidth: 2,
    borderColor: colors.borderAccent,
    backgroundColor: colors.surfaceSoft,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  avatarActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  avatarActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  avatarRemoveButton: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.primarySubtle,
  },
  avatarActionText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  disabledAction: {
    opacity: 0.5,
  },
  bioInput: {
    minHeight: 118,
    paddingTop: spacing.md,
  },
  counter: {
    alignSelf: "flex-end",
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  errorText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  formError: {
    padding: spacing.md,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800",
  },
});

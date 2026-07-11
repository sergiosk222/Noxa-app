import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
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

type ProfileErrors = Partial<Record<keyof ProfileForm | "form", string>>;

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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

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

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: validation.values.displayName,
          username: validation.values.username || null,
          city: validation.values.city || null,
          bio: validation.values.bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("id, display_name, username, avatar_url, bio, city")
        .single();

      setIsSubmitting(false);

      if (error) {
        setErrors({ form: mapSaveError(error) });
        return;
      }

      router.back();
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ form: mapSaveError(error) });
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

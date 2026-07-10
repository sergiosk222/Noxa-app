import { router } from "expo-router";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  NoxaButton,
  NoxaCard,
  NoxaIconButton,
  NoxaScreen,
} from "@/src/components/ui";
import { colors, radius, spacing, typography } from "@/src/theme";

type SignUpErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const emailPattern = /^\S+@\S+\.\S+$/;

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});

  const validate = () => {
    const nextErrors: SignUpErrors = {};

    if (!displayName.trim())
      nextErrors.displayName = "Display name is required.";
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateAccount = () => {
    if (validate()) {
      router.replace("/(tabs)");
    }
  };

  return (
    <NoxaScreen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <NoxaIconButton
              accessibilityLabel="Go back"
              icon="chevron-back"
              onPress={() => router.back()}
            />
            <Text style={styles.brand}>NOXA</Text>
            <View style={styles.headerSpacer} />
          </View>

          <NoxaCard style={styles.card}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Join NOXA</Text>
              <Text style={styles.subtitle}>
                Your automotive community starts here
              </Text>
            </View>

            <View style={styles.form}>
              <Field
                error={errors.displayName}
                label="Display name"
                onChangeText={setDisplayName}
                placeholder="Your driver name"
                textContentType="name"
                value={displayName}
              />
              <Field
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                inputMode="email"
                keyboardType="email-address"
                label="Email"
                onChangeText={setEmail}
                placeholder="you@noxa.app"
                textContentType="emailAddress"
                value={email}
              />
              <Field
                autoCapitalize="none"
                autoComplete="new-password"
                error={errors.password}
                label="Password"
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                value={password}
                rightAction={
                  <PasswordToggle
                    showPassword={showPassword}
                    onPress={() => setShowPassword((current) => !current)}
                  />
                }
              />
              <Field
                autoCapitalize="none"
                autoComplete="new-password"
                error={errors.confirmPassword}
                label="Confirm password"
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                value={confirmPassword}
                rightAction={
                  <PasswordToggle
                    showPassword={showPassword}
                    onPress={() => setShowPassword((current) => !current)}
                  />
                }
              />

              <Text style={styles.agreement}>
                By creating an account, you agree to NOXA Terms and Privacy.
              </Text>
              <NoxaButton
                fullWidth
                title="Create Account"
                onPress={handleCreateAccount}
              />
            </View>
          </NoxaCard>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-in")}
            style={styles.bottomLinkWrap}
          >
            <Text style={styles.bottomText}>
              Already have an account?{" "}
              <Text style={styles.bottomLink}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </NoxaScreen>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  error?: string;
  label: string;
  rightAction?: ReactNode;
};

function Field({ error, label, rightAction, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.primary}
          style={[
            styles.input,
            rightAction ? styles.inputWithAction : null,
            style,
          ]}
          {...props}
        />
        {rightAction ? (
          <View style={styles.inputAction}>{rightAction}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function PasswordToggle({
  showPassword,
  onPress,
}: {
  showPassword: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    letterSpacing: 5,
    marginLeft: 5,
  },
  headerSpacer: { width: 44 },
  card: { gap: spacing.xl },
  titleBlock: { gap: spacing.xs },
  title: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: "900",
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "600",
    lineHeight: typography.lineHeight.body,
  },
  form: { gap: spacing.md },
  fieldWrap: { gap: spacing.xs },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: typography.letterSpacing.caption,
  },
  inputShell: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.borderAccent },
  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
  },
  inputWithAction: { paddingRight: spacing.xs },
  inputAction: { paddingRight: spacing.md },
  showText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  error: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  agreement: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
    lineHeight: typography.lineHeight.caption,
  },
  bottomLinkWrap: { alignItems: "center", paddingVertical: spacing.sm },
  bottomText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomLink: { color: colors.text, fontWeight: "900" },
});

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

type SignInErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^\S+@\S+\.\S+$/;

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});

  const validate = () => {
    const nextErrors: SignInErrors = {};

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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignIn = () => {
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
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.form}>
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
                autoComplete="password"
                error={errors.password}
                label="Password"
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                textContentType="password"
                value={password}
                rightAction={
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowPassword((current) => !current)}
                    hitSlop={8}
                  >
                    <Text style={styles.showText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                }
              />

              <Pressable accessibilityRole="button" style={styles.forgotButton}>
                <Text style={styles.textLink}>Forgot password?</Text>
              </Pressable>

              <NoxaButton fullWidth title="Sign In" onPress={handleSignIn} />
            </View>
          </NoxaCard>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-up")}
            style={styles.bottomLinkWrap}
          >
            <Text style={styles.bottomText}>
              New to NOXA? <Text style={styles.bottomLink}>Create account</Text>
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
  card: { gap: spacing.xxl },
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
  forgotButton: { alignSelf: "flex-end", paddingVertical: spacing.xs },
  textLink: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800",
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

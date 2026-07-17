import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { NoxaAuthField } from "@/src/components/auth/NoxaAuthField";
import { supabase } from "@/src/lib/supabase";
import {
  NoxaButton,
  NoxaCard,
  NoxaIconButton,
  NoxaScreen,
} from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";

type SignInErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const emailPattern = /^\S+@\S+\.\S+$/;

function getSignInErrorMessage(message?: string) {
  if (message === "Invalid login credentials") {
    return "Incorrect email or password.";
  }

  if (message === "Email not confirmed") {
    return "Confirm your email before signing in.";
  }

  if (message === "Network request failed") {
    return "Unable to connect. Check your internet connection.";
  }

  return "Unable to sign in. Please try again.";
}

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSignIn = async () => {
    if (isLoading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrors({ form: getSignInErrorMessage(error.message) });
        return;
      }

      if (data.session) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? getSignInErrorMessage(error.message)
            : "Unable to sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NoxaScreen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              <NoxaAuthField
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

              <NoxaAuthField
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

              {errors.form ? (
                <Text style={styles.error}>{errors.form}</Text>
              ) : null}

              <NoxaButton
                disabled={isLoading}
                fullWidth
                loading={isLoading}
                title="Sign In"
                onPress={handleSignIn}
              />
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

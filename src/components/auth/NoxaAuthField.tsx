import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type NoxaAuthFieldProps = ComponentProps<typeof TextInput> & {
  error?: string;
  label: string;
  rightAction?: ReactNode;
};

export function NoxaAuthField({
  error,
  label,
  rightAction,
  style,
  ...props
}: NoxaAuthFieldProps) {
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
  error: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700",
  },
});

import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NoxaButton, NoxaCard, NoxaHeader, NoxaInput, NoxaScreen } from '@/src/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

const colorsAvailable = [
  { name: 'Graphite', value: '#2E3038' },
  { name: 'Pearl', value: '#E6E3DC' },
  { name: 'Racing Red', value: colors.primary },
  { name: 'Midnight', value: '#050608' },
];

const optionalFields: { label: string; placeholder: string; keyboardType?: 'number-pad' | 'decimal-pad' }[] = [
  { label: 'Year', placeholder: '2024', keyboardType: 'number-pad' },
  { label: 'Stage', placeholder: 'Stage 2 / Track build / OEM+' },
  { label: 'Torque', placeholder: '620 Nm', keyboardType: 'number-pad' },
  { label: '0-100', placeholder: '3.8 s', keyboardType: 'decimal-pad' },
  { label: 'Transmission', placeholder: 'Manual / DCT / Automatic' },
  { label: 'Drivetrain', placeholder: 'RWD / AWD / FWD' },
];

function BackButton() {
  return (
    <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

function FormSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <NoxaCard>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </NoxaCard>
  );
}

function ColorSelector() {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        {colorsAvailable.map((option, index) => (
          <Pressable key={option.name} accessibilityRole="button" accessibilityLabel={`Select ${option.name}`} style={({ pressed }) => [styles.colorChip, index === 0 && styles.colorChipSelected, pressed && styles.pressed]}>
            <View style={[styles.swatch, { backgroundColor: option.value }]} />
            <Text style={styles.colorName}>{option.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function GalleryPlaceholder() {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.galleryHeader}>
        <Text style={styles.label}>Gallery</Text>
        <Text style={styles.futureNote}>Upload mockup</Text>
      </View>
      <View style={styles.galleryGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Pressable key={index} accessibilityRole="button" accessibilityLabel={index === 0 ? 'Add cover photo placeholder' : 'Add gallery photo placeholder'} style={({ pressed }) => [styles.uploadTile, index === 0 && styles.coverTile, pressed && styles.pressed]}>
            {index === 0 ? <Text style={styles.coverLabel}>Cover Photo</Text> : null}
            <Ionicons name="add" size={24} color={colors.textMuted} />
            <Text style={styles.uploadText}>Add photo</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function VehicleEditorScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NoxaHeader left={<BackButton />} title="EDIT VEHICLE" subtitle="Build your automotive identity" />

        <View style={styles.heroPanel}>
          <Text style={styles.heroTitle}>Shape the profile your crew sees.</Text>
          <Text style={styles.heroCopy}>Mock editor ready for future image upload, validation, backend save, AI vehicle recognition, and public/private visibility.</Text>
        </View>

        <FormSection eyebrow="Required" title="Core Identity">
          <NoxaInput label="Brand / Model" placeholder="Porsche 911 GT3 RS" autoCapitalize="words" />
          <NoxaInput label="Horsepower" placeholder="518 hp" keyboardType="number-pad" />
          <ColorSelector />
          <GalleryPlaceholder />
        </FormSection>

        <FormSection eyebrow="Optional" title="Build Details">
          {optionalFields.map((field) => (
            <NoxaInput key={field.label} label={field.label} placeholder={field.placeholder} keyboardType={field.keyboardType} />
          ))}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput multiline placeholder="Tell the story behind the build..." placeholderTextColor={colors.textMuted} selectionColor={colors.primary} style={[styles.textArea]} textAlignVertical="top" />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Installed parts</Text>
            <TextInput multiline placeholder="Exhaust, coilovers, wheels, tune..." placeholderTextColor={colors.textMuted} selectionColor={colors.primary} style={[styles.textArea]} textAlignVertical="top" />
          </View>
        </FormSection>

        <View style={styles.actions}>
          <NoxaButton title="Save Vehicle" fullWidth />
          <NoxaButton title="Cancel" variant="secondary" fullWidth onPress={() => router.back()} />
        </View>
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 144,
    gap: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  heroPanel: {
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: '#0B0C10',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  heroCopy: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
  },
  sectionContent: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorChip: {
    minWidth: 132,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorChipSelected: {
    borderColor: 'rgba(255,45,45,0.62)',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorName: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  futureNote: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  uploadTile: {
    width: '47%',
    minHeight: 126,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  coverTile: {
    borderColor: 'rgba(255,45,45,0.52)',
  },
  coverLabel: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  uploadText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 118,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: typography.body,
  },
  actions: {
    gap: spacing.sm,
  },
});

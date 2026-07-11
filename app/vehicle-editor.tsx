import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NoxaButton, NoxaCard, NoxaHeader, NoxaInput, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

const colorsAvailable = [
  { name: 'Graphite', value: '#2E3038' },
  { name: 'Pearl', value: '#E6E3DC' },
  { name: 'Racing Red', value: colors.primary },
  { name: 'Midnight', value: '#050608' },
];

type VehicleForm = {
  brand: string;
  model: string;
  year: string;
  horsepower: string;
  color: string;
  transmission: string;
  drivetrain: string;
  tuningStage: string;
  zeroToHundred: string;
  description: string;
};

type VehicleErrors = Partial<Record<keyof VehicleForm | 'form', string>>;

type NormalizedVehicle = {
  brand: string;
  model: string | null;
  year: number | null;
  horsepower: number;
  color: string;
  transmission: string | null;
  drivetrain: string | null;
  tuning_stage: string | null;
  zero_to_hundred: number | null;
  description: string | null;
  is_public: boolean;
};

const initialForm: VehicleForm = {
  brand: '',
  model: '',
  year: '',
  horsepower: '',
  color: colorsAvailable[0].name,
  transmission: '',
  drivetrain: '',
  tuningStage: '',
  zeroToHundred: '',
  description: '',
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    return Number.NaN;
  }

  return Number.parseInt(trimmed, 10);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function validateForm(form: VehicleForm): { errors: VehicleErrors; values?: NormalizedVehicle } {
  const errors: VehicleErrors = {};
  const brand = form.brand.trim();
  const model = optionalText(form.model);
  const year = parseOptionalInteger(form.year);
  const horsepower = parseOptionalInteger(form.horsepower);
  const color = form.color.trim();
  const transmission = optionalText(form.transmission);
  const drivetrain = optionalText(form.drivetrain);
  const tuningStage = optionalText(form.tuningStage);
  const zeroToHundred = parseOptionalNumber(form.zeroToHundred);
  const description = optionalText(form.description);

  if (!brand) {
    errors.brand = 'Brand is required.';
  } else if (brand.length > 60) {
    errors.brand = 'Brand must be 60 characters or less.';
  }

  if (model && model.length > 60) {
    errors.model = 'Model must be 60 characters or less.';
  }

  if (Number.isNaN(year) || (year !== null && (year < 1886 || year > 2100))) {
    errors.year = 'Year must be an integer from 1886 to 2100.';
  }

  if (Number.isNaN(horsepower)) {
    errors.horsepower = 'Horsepower must be an integer.';
  } else if (horsepower === null) {
    errors.horsepower = 'Horsepower is required.';
  } else if (horsepower < 1 || horsepower > 5000) {
    errors.horsepower = 'Horsepower must be between 1 and 5000.';
  }

  if (!color) {
    errors.color = 'Color is required.';
  } else if (color.length > 40) {
    errors.color = 'Color must be 40 characters or less.';
  }

  if (transmission && transmission.length > 40) {
    errors.transmission = 'Transmission must be 40 characters or less.';
  }

  if (drivetrain && drivetrain.length > 40) {
    errors.drivetrain = 'Drivetrain must be 40 characters or less.';
  }

  if (tuningStage && tuningStage.length > 40) {
    errors.tuningStage = 'Tuning stage must be 40 characters or less.';
  }

  if (Number.isNaN(zeroToHundred) || (zeroToHundred !== null && (zeroToHundred <= 0 || zeroToHundred > 60))) {
    errors.zeroToHundred = '0–100 must be greater than 0 and no more than 60 seconds.';
  }

  if (description && description.length > 1000) {
    errors.description = 'Description must be 1000 characters or less.';
  }

  if (Object.keys(errors).length > 0 || horsepower === null || Number.isNaN(horsepower)) {
    return { errors };
  }

  return {
    errors,
    values: {
      brand,
      model,
      year: Number.isNaN(year) ? null : year,
      horsepower,
      color,
      transmission,
      drivetrain,
      tuning_stage: tuningStage,
      zero_to_hundred: Number.isNaN(zeroToHundred) ? null : zeroToHundred,
      description,
      is_public: true,
    },
  };
}

function getSaveErrorMessage(error: { message?: string } | unknown) {
  const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';

  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return 'Unable to connect. Check your internet connection.';
  }

  return message || 'Unable to save vehicle. Please try again.';
}

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

function ColorSelector({ disabled, error, onSelect, selectedColor }: { disabled: boolean; error?: string; onSelect: (color: string) => void; selectedColor: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        {colorsAvailable.map((option) => {
          const isSelected = selectedColor === option.name;

          return (
            <Pressable
              key={option.name}
              accessibilityRole="button"
              accessibilityLabel={`Select ${option.name}`}
              disabled={disabled}
              onPress={() => onSelect(option.name)}
              style={({ pressed }) => [styles.colorChip, isSelected && styles.colorChipSelected, pressed && styles.pressed, disabled && styles.disabled]}
            >
              <View style={[styles.swatch, { backgroundColor: option.value }]} />
              <Text style={styles.colorName}>{option.name}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

function FieldError({ children, message }: { children: ReactNode; message?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {children}
      {message ? <Text style={styles.errorText}>{message}</Text> : null}
    </View>
  );
}

export default function VehicleEditorScreen() {
  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [errors, setErrors] = useState<VehicleErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof VehicleForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const saveVehicle = async () => {
    if (isSubmitting) {
      return;
    }

    setErrors({});
    const validation = validateForm(form);

    if (!validation.values || Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setErrors({ form: getSaveErrorMessage(error) });
        setIsSubmitting(false);
        return;
      }

      const user = data.user;

      if (!user) {
        setErrors({ form: 'Sign in to save your vehicle.' });
        setIsSubmitting(false);
        return;
      }

      const { data: vehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          owner_id: user.id,
          brand: validation.values.brand,
          model: validation.values.model,
          year: validation.values.year,
          horsepower: validation.values.horsepower,
          color: validation.values.color,
          transmission: validation.values.transmission,
          drivetrain: validation.values.drivetrain,
          tuning_stage: validation.values.tuning_stage,
          zero_to_hundred: validation.values.zero_to_hundred,
          description: validation.values.description,
          is_public: validation.values.is_public,
        })
        .select(`
          id,
          owner_id,
          brand,
          model,
          year,
          horsepower,
          color,
          transmission,
          drivetrain,
          tuning_stage,
          zero_to_hundred,
          description,
          cover_image_url,
          is_public,
          created_at,
          updated_at
        `)
        .single();

      setIsSubmitting(false);

      if (insertError) {
        setErrors({ form: getSaveErrorMessage(insertError) });
        return;
      }

      if (vehicle?.id) {
        router.back();
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrors({ form: getSaveErrorMessage(error) });
    }
  };

  return (
    <NoxaScreen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <NoxaHeader left={<BackButton />} title="EDIT VEHICLE" subtitle="Build your automotive identity" />

          <View style={styles.heroPanel}>
            <Text style={styles.heroTitle}>Shape the profile your crew sees.</Text>
            <Text style={styles.heroCopy}>Mock editor ready for future image upload, validation, backend save, AI vehicle recognition, and public/private visibility.</Text>
          </View>

          {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

          <FormSection eyebrow="Required" title="Core Identity">
            <FieldError message={errors.brand}>
              <NoxaInput editable={!isSubmitting} label="Brand" maxLength={61} onChangeText={(value) => setField('brand', value)} placeholder="Porsche" value={form.brand} autoCapitalize="words" />
            </FieldError>
            <FieldError message={errors.model}>
              <NoxaInput editable={!isSubmitting} label="Model" maxLength={61} onChangeText={(value) => setField('model', value)} placeholder="911 GT3 RS" value={form.model} autoCapitalize="words" />
            </FieldError>
            <FieldError message={errors.horsepower}>
              <NoxaInput editable={!isSubmitting} label="Horsepower" onChangeText={(value) => setField('horsepower', value)} placeholder="518 hp" value={form.horsepower} keyboardType="number-pad" />
            </FieldError>
            <ColorSelector disabled={isSubmitting} error={errors.color} onSelect={(value) => setField('color', value)} selectedColor={form.color} />
            <GalleryPlaceholder />
          </FormSection>

          <FormSection eyebrow="Optional" title="Build Details">
            <FieldError message={errors.year}>
              <NoxaInput editable={!isSubmitting} label="Year" onChangeText={(value) => setField('year', value)} placeholder="2024" value={form.year} keyboardType="number-pad" />
            </FieldError>
            <FieldError message={errors.tuningStage}>
              <NoxaInput editable={!isSubmitting} label="Stage" maxLength={41} onChangeText={(value) => setField('tuningStage', value)} placeholder="Stage 2 / Track build / OEM+" value={form.tuningStage} />
            </FieldError>
            <FieldError message={errors.zeroToHundred}>
              <NoxaInput editable={!isSubmitting} label="0-100" onChangeText={(value) => setField('zeroToHundred', value)} placeholder="3.8 s" value={form.zeroToHundred} keyboardType="decimal-pad" />
            </FieldError>
            <FieldError message={errors.transmission}>
              <NoxaInput editable={!isSubmitting} label="Transmission" maxLength={41} onChangeText={(value) => setField('transmission', value)} placeholder="Manual / DCT / Automatic" value={form.transmission} />
            </FieldError>
            <FieldError message={errors.drivetrain}>
              <NoxaInput editable={!isSubmitting} label="Drivetrain" maxLength={41} onChangeText={(value) => setField('drivetrain', value)} placeholder="RWD / AWD / FWD" value={form.drivetrain} />
            </FieldError>
            <FieldError message={errors.description}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput editable={!isSubmitting} maxLength={1001} multiline onChangeText={(value) => setField('description', value)} placeholder="Tell the story behind the build..." placeholderTextColor={colors.textMuted} selectionColor={colors.primary} style={[styles.textArea]} textAlignVertical="top" value={form.description} />
              </View>
            </FieldError>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Installed parts</Text>
              <TextInput editable={!isSubmitting} multiline placeholder="Exhaust, coilovers, wheels, tune..." placeholderTextColor={colors.textMuted} selectionColor={colors.primary} style={[styles.textArea]} textAlignVertical="top" />
            </View>
          </FormSection>

          <View style={styles.actions}>
            <NoxaButton disabled={isSubmitting} loading={isSubmitting} onPress={saveVehicle} title="Save Vehicle" fullWidth />
            <NoxaButton disabled={isSubmitting} title="Cancel" variant="secondary" fullWidth onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NoxaScreen>
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
  disabled: {
    opacity: 0.45,
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
  fieldWrap: {
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
  errorText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  formError: {
    padding: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  actions: {
    gap: spacing.sm,
  },
});

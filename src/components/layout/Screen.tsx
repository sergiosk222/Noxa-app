import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';

import { useResponsive } from '../../hooks/useResponsive';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<
    ScrollViewProps,
    'contentContainerStyle'
  >;
}>;

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
  scrollProps,
}: ScreenProps) {
  const responsive = useResponsive();

  const adaptiveStyle: ViewStyle = {
    width: '100%',
    maxWidth: responsive.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: padded
      ? responsive.gutter
      : 0,
  };

  if (scroll) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={edges}
      >
        <ScrollView
          {...scrollProps}
          style={[styles.scroll, scrollProps?.style]}
          contentContainerStyle={[
            styles.scrollContent,
            adaptiveStyle,
            contentStyle,
          ]}
          keyboardShouldPersistTaps={
            scrollProps?.keyboardShouldPersistTaps ??
            'handled'
          }
          showsVerticalScrollIndicator={
            scrollProps?.showsVerticalScrollIndicator ??
            false
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={edges}
    >
      <View
        style={[
          styles.content,
          adaptiveStyle,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  content: {
    flex: 1,
  },
});

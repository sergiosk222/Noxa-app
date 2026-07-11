import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { supabase } from '@/src/lib/supabase';

type Destination = '/welcome' | '/(tabs)' | null;

export default function IndexRoute() {
  const [destination, setDestination] = useState<Destination>(null);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data.session) {
        setDestination('/welcome');
        return;
      }

      setDestination('/(tabs)');
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!destination) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#E11D2E" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050608',
  },
});

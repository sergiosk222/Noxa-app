import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { NoxaAnimatedSplash } from '@/src/components/NoxaAnimatedSplash';
import { supabase } from '@/src/lib/supabase';

type Destination = '/welcome' | '/(tabs)' | null;

export default function IndexRoute() {
  const [destination, setDestination] = useState<Destination>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

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

  const finishSplash = useCallback(() => {
    setIsSplashComplete(true);
  }, []);

  if (!destination || !isSplashComplete) {
    return <NoxaAnimatedSplash onAnimationComplete={finishSplash} />;
  }

  return <Redirect href={destination} />;
}

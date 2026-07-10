import { router } from 'expo-router';
import { useEffect } from 'react';

export default function IndexRoute() {
  useEffect(() => {
    router.replace('/welcome');
  }, []);

  return null;
}

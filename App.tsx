import { useState } from 'react';
import { ExpoRoot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { NoxaSplashScreen } from './src/screens/NoxaSplashScreen';

declare const require: NodeRequire & {
  context: (directory: string) => any;
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const ctx = require.context('./app');

export default function App() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#080A0F' }}>
      {isSplashComplete ? <ExpoRoot context={ctx} /> : <NoxaSplashScreen onFinish={() => setIsSplashComplete(true)} />}
    </View>
  );
}

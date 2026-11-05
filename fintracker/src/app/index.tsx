import { Redirect } from 'expo-router';

import { useStore } from '@/store';

/** Entry point: send people to the right place for their sign-in state. */
export default function Index() {
  const signedIn = useStore((s) => s.signedIn);
  return <Redirect href={signedIn ? '/home' : '/welcome'} />;
}

import { Redirect } from 'expo-router';

/** Unknown links (or a web host that serves the app under another path) land on the start screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}

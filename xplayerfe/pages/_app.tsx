import type { AppProps } from "next/app";

// Minimal Pages Router wrapper.
// We primarily use the App Router (/app), but Next.js still loads the Pages
// route module for internal _app/_error handling in some setups.
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

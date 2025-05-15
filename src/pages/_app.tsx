import "@/styles/globals.css";
import type { AppProps } from "next/app";
import DefaultLayout from "@/components/layouts/DefaultLayout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DefaultLayout>
      <Component {...pageProps} />
    </DefaultLayout>
  );
}

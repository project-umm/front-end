import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Font Awesome이 Next.js에서 중복 스타일을 추가하는 것을 방지
config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DefaultLayout>
      <Component {...pageProps} />
    </DefaultLayout>
  );
}

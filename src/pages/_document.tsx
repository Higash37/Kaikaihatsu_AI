import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta name="application-name" content="SciscitorAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SciscitorAI" />
        <meta name="description" content="AIクイズ・診断アプリケーション" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Firefox非対応のため、代替方法を検討する必要がある */}
        {/* <meta name="theme-color" content="#000000" /> */}

        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

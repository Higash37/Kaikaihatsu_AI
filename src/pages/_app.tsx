// app.tsx とは → Next.js のアプリケーション全体における初期設定や共通のレイアウトなどを設定する(ラップする)場所
import "@/styles/globals.css"; // globals.css (今回は TailWind を使用) から css をインポート

import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app"; // component と pageProps を型定義するため使用 型安全のために用意。
// ↑ いわゆるフォーマットを用意しているようなもの。
import { SessionProvider } from "next-auth/react";

import { AuthProvider } from "../contexts/AuthContext"; // 認証コンテキストをインポート
import theme from "../theme"; // 作成したテーマをインポート

//全ページに共通するレイアウト
// 1. ① export default function App() {} とは → Next.js が すべてのページの上に適用する特別なコンポーネント
//    ② 通常の React では、 index.tsx とあったらそれを描画するが、 Next.js では必ず app.tsx を通って描画される。
//    ③ つまり、グローバルなスタイル、レイアウト、状態管理、ページ遷移処理をここに記述できる!!
// 2. ① Component とは? → 現在表示すべきページの React コンポーネント(例：index.tsx)
//    ② pageProps とは? → コンポーネントの(データ)中身(例：message: "Hello from Tokyo!")
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {" "}
          {/* AuthProvider を追加 */}
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;

// つまり、 return <index.tsx { message: "Hello from server!" } という形になる!

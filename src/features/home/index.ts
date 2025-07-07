import BackgroundAnimation from "@/components/home/BackgroundAnimation";
import HeartMarkBackground from "@/components/home/HeartMarkBackground";
import StartButton from "@/components/home/StartButton";
import WelcomeTitle from "@/components/home/WelcomeTitle";

// ホーム画面で使用するコンポーネントをエクスポート
export { BackgroundAnimation, HeartMarkBackground, StartButton, WelcomeTitle };

// ホーム関連の型定義
export interface HomeNavigationProps {
  onNavigate: () => void;
}

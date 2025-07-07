import {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxMiddleRight,
  CircleBoxBigright,
  CircleBoxSmall,
} from "@/components/QuizHeart";
import { Question, Scores } from "@/types";

// 診断機能で使用するコンポーネントをエクスポート
export {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxMiddleRight,
  CircleBoxBigright,
  CircleBoxSmall,
};

// 質問ボックスの選択状態の型定義
export interface SelectedBoxState {
  [id: number]: number | undefined;
}

// 診断ページのプロパティ型定義
export interface QuizPageProps {
  onComplete: (scores: Scores) => void;
}

// 質問表示コンポーネントのプロパティ型定義
export interface QuestionDisplayProps {
  question: Question;
  selected: number | undefined;
  onSelect: (value: number) => void;
}

// 進行状況バーのプロパティ型定義
export interface ProgressBarProps {
  percentage: number;
  isScrolling: boolean;
}

// 共通の型定義
// グループ情報（動物のタイプ）の型定義
export interface GroupInfo {
  animalName: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  yamaUrl: string;
  features: string[];
  galShortDescription?: string;
  galLongDescription?: string;
  galFeatures: string[];
}

// 性別の型定義
export type Gender = "male" | "female" | "others" | null;

// 年齢区分の型定義
export type AgeGroup =
  | "10代前半"
  | "10代後半"
  | "20代前半"
  | "20代後半"
  | "30代"
  | "40代"
  | "50代以上"
  | null;

// ユーザー情報の型定義
export interface UserInfo {
  gender?: Gender;
  age?: number | null;
  emotion: number;
  rational: number;
  active: number;
  passive: number;
  x: number;
  y: number;
}

// 診断結果項目の型定義
export interface DiagnosisItem {
  id: string;
  gender: string;
  age: number;
  emotion_score: number;
  rational_score: number;
  active_score: number;
  passive_score: number;
  created_at?: string;
}

// API共通レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// エラー型定義
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// エラーオブジェクト型
export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// 質問の型定義
export interface Question {
  id: number;
  text: string;
  type: "emotion" | "rational" | "active" | "passive";
}

// ゲージデータの型定義
export interface GaugeData {
  initialValue: number;
  label: string;
}

// ゲージコンポーネントのProps定義
export interface GaugeProps {
  initialValue?: number; // ゲージの初期パーセンテージ (0～100)
  imageSrc?: string; // アイコン画像のパス
  label?: string; // アイコン上に表示するテキスト（animalName）
  progressColor?: string; // ゲージ進捗バーの色をカスタマイズするためのプロパティ
}

// スコアタイプの型定義
export type ScoreType = "emotion" | "rational" | "active" | "passive";

// スコアの型定義
export interface Scores {
  emotion: number;
  rational: number;
  active: number;
  passive: number;
  x?: number;
  y?: number;
}

// 結果ページの状態管理の型定義
export interface ResultState {
  selectedGenderFilter: string | null;
  selectedAgeFilter: string | null;
  myX: number;
  myY: number;
  groupInfo: GroupInfo | null;
  gaugeData: GaugeData[];
  filteredDiagnoses: DiagnosisItem[];
  descriptionShort: string;
  descriptionLong: string;
}

// フィルターセクションのプロパティ型定義
export interface FilterSectionProps {
  selectedGenderFilter: string | null;
  selectedAgeFilter: string | null;
  onGenderFilterChange: (gender: string) => void;
  onAgeFilterChange: (age: string) => void;
}

// 散布図のプロパティ型定義
export interface ScatterChartProps {
  groupMap: Record<string, string>;
  groupData: Record<string, GroupInfo>;
  groupInfo: GroupInfo | null;
  filteredDiagnoses: DiagnosisItem[];
  myX: number;
  myY: number;
}

// グループ情報カードのプロパティ型定義
export interface ResultCardProps {
  imageUrl: string;
  animalName: string;
}

// 結果説明のプロパティ型定義
export interface ResultDescriptionProps {
  shortDescription: string;
  longDescription: string;
}

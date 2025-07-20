// ユーザーロール定義
export type UserRole = "creator" | "respondent" | "admin";

// クイズ・アンケートの基本データ型
export interface Quiz {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;

  // 基本設定
  questionCount: number;
  isPublic: boolean;
  tags: string[];

  // 統計情報
  totalResponses: number;
  popularity: number; // 人気度スコア
  averageRating?: number; // 平均評価

  // 質問データ
  questions: Question[];

  // 4軸分析用データ
  axes?: Axis[];

  // 分析設定
  enableDemographics: boolean; // 人口統計分析を有効にするか
  enableLocationTracking: boolean; // 位置情報追跡を有効にするか
  enableRating: boolean; // 評価機能を有効にするか

  // 作成者向け分析データ
  analyticsData?: QuizAnalytics;
}

// 分析データ
export interface QuizAnalytics {
  totalResponses: number;

  // 人口統計分析
  demographicBreakdown: {
    gender: Record<string, number>;
    ageRange: Record<string, number>;
    location: Record<string, number>;
    occupation: Record<string, number>;
  };

  // 回答分析
  questionAnalytics: QuestionAnalytics[];

  // 位置情報分析
  locationAnalytics?: {
    popularAreas: {
      prefecture: string;
      city: string;
      responseCount: number;
      percentage: number;
    }[];
    heatmapData: any[];
  };

  // 評価分析
  ratingAnalytics?: {
    averageRating: number;
    ratingDistribution: Record<string, number>;
    totalRatings: number;
  };
}

// 質問別分析
export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  responseCount: number;
  averageTime?: number; // 平均回答時間（秒）
  skipRate?: number; // スキップ率

  // 選択肢別の回答数
  optionCounts?: Record<string, number>;
  answerDistribution?: { [answer: string]: number };

  // スケール統計（数値回答の場合）
  scaleStats?: {
    average: number;
    median: number;
    mode: number;
  };

  // テキスト回答の場合
  textResponses?: string[];
}

// 4軸分析用の軸定義
export interface Axis {
  id: number;
  name: string;
  description: string;
}

// 質問の定義
export interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "text" | "scale" | "yes_no";
  options?: string[]; // 選択肢（multiple_choice用）
  required: boolean;
  order: number;
  axisId?: number; // 4軸分析用の軸ID
}

// 回答データ
export interface QuizResponse {
  id: string;
  quizId: string;
  userId?: string; // ログインユーザーの場合
  createdAt: string;

  // 回答内容
  answers: Answer[];

  // 人口統計情報
  demographics?: Demographics;

  // 位置情報
  location?: LocationData;

  // 評価
  rating?: number; // 1-5スケール
  feedback?: string; // フィードバックコメント

  // 結果
  result?: QuizResult;
}

// 個別の回答
export interface Answer {
  questionId: string;
  value: string | number | boolean;
  text?: string; // テキスト回答の場合
}

// 人口統計情報
export interface Demographics {
  age?: number;
  ageRange?: "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70s+";
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string; // 都道府県
  occupation?: string;
  education?: "high_school" | "college" | "university" | "graduate" | "other";
}

// 位置情報データ
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  address?: string; // 逆ジオコーディング結果
  prefecture?: string; // 都道府県
  city?: string; // 市区町村
}

// クイズの結果
export interface QuizResult {
  id: string;
  type: string; // 診断タイプ
  title: string;
  description: string;
  score?: number;
  percentile?: number; // 上位何%か
  recommendations?: string[];
  imageUrl?: string;
}

// 位置情報ポイント
export interface LocationPoint {
  lat: number;
  lng: number;
  weight: number; // ヒートマップの重み
  responseId: string;
}

// 人気エリア
export interface PopularArea {
  prefecture: string;
  city: string;
  responseCount: number;
  percentage: number;
}

// 時系列データポイント
export interface TimeSeriesPoint {
  timestamp: string;
  responseCount: number;
  cumulativeCount: number;
}

// ユーザープロフィール（自動入力用）
export interface UserProfile {
  userId: string;
  name: string;
  email: string;

  // 人口統計情報
  demographics: Demographics;

  // 設定
  allowDataCollection: boolean;
  allowLocationTracking: boolean;
  shareProfileData: boolean;

  // 統計
  quizzesCreated: number;
  quizzesCompleted: number;
  lastActivityAt: string;
}

// API レスポンス型
export interface QuizListResponse {
  quizzes: Quiz[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface QuizAnalyticsResponse {
  analytics: QuizAnalytics;
  generatedAt: string;
}

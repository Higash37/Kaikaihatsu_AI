/**
 * API入力バリデーション
 */

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: any): string {
  if (typeof email !== 'string') {
    throw new Error('メールアドレスは文字列である必要があります');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('有効なメールアドレスを入力してください');
  }
  
  return email;
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: any): string {
  if (typeof password !== 'string') {
    throw new Error('パスワードは文字列である必要があります');
  }
  
  if (password.length < 8) {
    throw new Error('パスワードは8文字以上である必要があります');
  }
  
  return password;
}

/**
 * ユーザー名のバリデーション
 */
export function validateUsername(username: any): string {
  if (typeof username !== 'string') {
    throw new Error('ユーザー名は文字列である必要があります');
  }
  
  if (username.length < 2) {
    throw new Error('ユーザー名は2文字以上である必要があります');
  }
  
  if (username.length > 50) {
    throw new Error('ユーザー名は50文字以下である必要があります');
  }
  
  return username;
}

/**
 * サインアップデータのバリデーション
 */
export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export function validateSignUpData(body: any): SignUpData {
  return {
    email: validateEmail(body.email),
    password: validatePassword(body.password),
    username: validateUsername(body.username),
  };
}

/**
 * サインインデータのバリデーション
 */
export interface SignInData {
  email: string;
  password: string;
}

export function validateSignInData(body: any): SignInData {
  return {
    email: validateEmail(body.email),
    password: validatePassword(body.password),
  };
}

/**
 * PowerPoint生成データのバリデーション
 */
export interface PowerPointData {
  title: string;
  responses: any[];
  questions: any[];
  insights?: string;
  charts?: Record<string, any>;
}

export function validatePowerPointData(body: any): PowerPointData {
  const title = validateStringLength(body.title, 'タイトル', 1, 200);
  const responses = validateArrayLength(body.responses, '回答データ', 1, 10000);
  const questions = validateArrayLength(body.questions, '質問データ', 1, 100);
  
  // insightsは任意の文字列
  let insights: string | undefined;
  if (body.insights !== undefined) {
    insights = validateStringLength(body.insights, 'AI考察', 0, 5000);
  }
  
  return {
    title,
    responses,
    questions,
    insights,
    charts: body.charts,
  };
}

/**
 * AI考察生成データのバリデーション
 */
export interface InsightsData {
  prompt: string;
}

export function validateInsightsData(body: any): InsightsData {
  const prompt = validateStringLength(body.prompt, 'プロンプト', 1, 5000);
  
  return {
    prompt,
  };
}

/**
 * クイズ生成データのバリデーション
 */
export interface QuizGenerationData {
  theme: string;
  questionCount: number;
  tags: string[];
  isPublic: boolean;
  enableDemographics: boolean;
  enableLocationTracking: boolean;
  enableRating: boolean;
  creatorId: string;
  creatorName: string;
  isWizardCreated?: boolean;
  questions?: any[];
  results?: any[];
  axes?: any[];
  resultType?: string;
}

export function validateQuizGenerationData(body: any): QuizGenerationData {
  const theme = validateStringLength(body.theme, 'テーマ', 1, 100);
  const questionCount = validateNumber(body.questionCount, '質問数', 5, 30);
  const tags = validateArrayLength(body.tags || [], 'タグ', 0, 10);
  const creatorId = validateStringLength(body.creatorId, '作成者ID', 1, 100);
  const creatorName = validateStringLength(body.creatorName, '作成者名', 1, 100);
  
  // Boolean値のバリデーション
  const isPublic = validateBoolean(body.isPublic, '公開設定');
  const enableDemographics = validateBoolean(body.enableDemographics, '人口統計有効化');
  const enableLocationTracking = validateBoolean(body.enableLocationTracking, '位置情報追跡有効化');
  const enableRating = validateBoolean(body.enableRating, '評価機能有効化');
  
  // オプショナルフィールド
  const isWizardCreated = body.isWizardCreated ? validateBoolean(body.isWizardCreated, 'ウィザード作成フラグ') : false;
  const questions = body.questions ? validateArrayLength(body.questions, 'ウィザード質問', 0, 100) : undefined;
  const results = body.results ? validateArrayLength(body.results, 'ウィザード結果', 0, 100) : undefined;
  const axes = body.axes ? validateArrayLength(body.axes, 'ウィザード軸', 0, 10) : undefined;
  const resultType = body.resultType ? validateStringLength(body.resultType, '結果タイプ', 0, 100) : undefined;
  
  return {
    theme,
    questionCount,
    tags,
    isPublic,
    enableDemographics,
    enableLocationTracking,
    enableRating,
    creatorId,
    creatorName,
    isWizardCreated,
    questions,
    results,
    axes,
    resultType,
  };
}

/**
 * 文字列の長さをチェック
 */
export function validateStringLength(value: any, fieldName: string, minLength = 0, maxLength = 1000): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName}は文字列である必要があります`);
  }
  
  if (value.length < minLength) {
    throw new Error(`${fieldName}は${minLength}文字以上である必要があります`);
  }
  
  if (value.length > maxLength) {
    throw new Error(`${fieldName}は${maxLength}文字以下である必要があります`);
  }
  
  return value;
}

/**
 * 配列の要素数をチェック
 */
export function validateArrayLength(value: any, fieldName: string, minLength = 0, maxLength = 100): any[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName}は配列である必要があります`);
  }
  
  if (value.length < minLength) {
    throw new Error(`${fieldName}は最低${minLength}個の要素が必要です`);
  }
  
  if (value.length > maxLength) {
    throw new Error(`${fieldName}は最大${maxLength}個の要素まで許可されています`);
  }
  
  return value;
}

/**
 * 数値のバリデーション
 */
export function validateNumber(value: any, fieldName: string, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${fieldName}は数値である必要があります`);
  }
  
  if (value < min) {
    throw new Error(`${fieldName}は${min}以上である必要があります`);
  }
  
  if (value > max) {
    throw new Error(`${fieldName}は${max}以下である必要があります`);
  }
  
  return value;
}

/**
 * Boolean値のバリデーション
 */
export function validateBoolean(value: any, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName}はboolean値である必要があります`);
  }
  
  return value;
}
/**
 * 配列をシャッフルする関数
 * @param array シャッフルする配列
 * @returns シャッフルされた配列
 */
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 座標からグループを決定する関数
 * @param x X座標
 * @param y Y座標
 * @param groupMap グループマッピング
 * @returns グループ名
 */
export function determineGroup(
  x: number,
  y: number,
  groupMap: Record<string, string>
): string {
  if (x === 0 && y === 0) {
    return "Unknown";
  }

  const xRange =
    x > 0
      ? x > 10
        ? "RightOuter"
        : "RightInner"
      : x < -10
        ? "LeftOuter"
        : "LeftInner";
  const yRange =
    y > 0
      ? y > 10
        ? "TopOuter"
        : "TopInner"
      : y < -10
        ? "BottomOuter"
        : "BottomInner";

  return groupMap[`${yRange}${xRange}`] || "Unknown";
}

import { AppError, ErrorType } from "@/types";

/**
 * エラーを作成するファクトリ関数
 * @param type エラータイプ
 * @param message エラーメッセージ
 * @param statusCode HTTPステータスコード（該当する場合）
 * @param details 追加の詳細情報
 * @returns AppError オブジェクト
 */
export function createError(
  type: ErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, any>
): AppError {
  return {
    type,
    message,
    statusCode,
    details,
  };
}

/**
 * APIエラーを処理する関数
 * @param error エラーオブジェクト
 * @returns ユーザーフレンドリーなエラーオブジェクト
 */
export function handleApiError(error: unknown): AppError {
  if ((error as any)?.message?.includes("NetworkError")) {
    return createError(
      ErrorType.NETWORK_ERROR,
      "ネットワーク接続に問題があります。インターネット接続を確認してください。",
      undefined,
      { originalError: error }
    );
  }

  if (
    (error as any)?.message?.includes("401") ||
    (error as any)?.message?.includes("Unauthorized")
  ) {
    return createError(
      ErrorType.AUTH_ERROR,
      "認証に失敗しました。再度ログインしてください。",
      401,
      { originalError: error }
    );
  }

  // APIからのエラーメッセージがある場合はそれを使用
  const errorMessage =
    (error as any)?.message || "予期せぬエラーが発生しました。";
  return createError(
    ErrorType.API_ERROR,
    errorMessage,
    (error as any)?.statusCode,
    { originalError: error }
  );
}

/**
 * LocalStorage からデータを安全に取得する関数
 * @param key 取得するデータのキー
 * @param defaultValue デフォルト値
 * @returns 取得したデータまたはデフォルト値
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`LocalStorage からの取得エラー (${key}):`, error);
    return defaultValue;
  }
}

/**
 * LocalStorage にデータを安全に保存する関数
 * @param key 保存するデータのキー
 * @param value 保存する値
 * @returns 保存が成功したかどうか
 */
export function saveToLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`LocalStorage への保存エラー (${key}):`, error);
    return false;
  }
}

/**
 * 数値範囲を制限する関数
 * @param value 対象の値
 * @param min 最小値
 * @param max 最大値
 * @returns 制限された値
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

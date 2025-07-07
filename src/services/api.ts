import {
  ApiResponse,
  DiagnosisItem,
  Question,
  UserInfo,
  ErrorType,
} from "@/types";
import { createError, handleApiError } from "@/utils";

/**
 * 診断質問を取得するAPI
 * @returns 質問のリスト
 */
export async function fetchQuestions(): Promise<Question[]> {
  try {
    const response = await fetch("/api/questions");
    if (!response.ok) {
      throw createError(
        ErrorType.API_ERROR,
        `APIエラー: ${response.status}`,
        response.status
      );
    }
    const data = (await response.json()) as ApiResponse<Question[]>;
    return data.data ?? [];
  } catch (error) {
    console.error("質問データの取得に失敗しました:", error);
    const appError = handleApiError(error);
    console.error(`${appError.type}: ${appError.message}`);
    return [];
  }
}

/**
 * 診断結果をサーバーに送信するAPI
 * @param userInfo ユーザー情報
 * @returns 送信結果
 */
export async function sendDiagnosisData(userInfo: UserInfo): Promise<boolean> {
  try {
    const response = await fetch("/api/save-diagnosis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    if (!response.ok) {
      throw createError(
        ErrorType.API_ERROR,
        `APIエラー: ${response.status}`,
        response.status
      );
    }

    const result = (await response.json()) as ApiResponse<{ saved: boolean }>;
    return result.success && (result.data?.saved ?? false);
  } catch (error) {
    console.error("診断データの送信に失敗しました:", error);
    const appError = handleApiError(error);
    console.error(`${appError.type}: ${appError.message}`);
    return false;
  }
}

/**
 * 診断結果データを取得するAPI
 * @returns 診断結果データのリスト
 */
export async function fetchDiagnosisData(): Promise<DiagnosisItem[]> {
  try {
    const response = await fetch("/api/get-diagnosis");
    if (!response.ok) {
      throw createError(
        ErrorType.API_ERROR,
        `APIエラー: ${response.status}`,
        response.status
      );
    }

    const result = (await response.json()) as ApiResponse<DiagnosisItem[]>;
    return result.data ?? [];
  } catch (error) {
    console.error("診断結果データの取得に失敗しました:", error);
    const appError = handleApiError(error);
    console.error(`${appError.type}: ${appError.message}`);
    return [];
  }
}

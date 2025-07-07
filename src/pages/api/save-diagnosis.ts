import { NextApiRequest, NextApiResponse } from "next";

import { ApiResponse, UserInfo } from "@/types";

// 診断データを一時的に保存するための配列（本番環境では実際のデータベースを使用するべき）
let diagnosisData: any[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ saved: boolean }>>
) {
  if (req.method === "POST") {
    try {
      const userData = req.body as UserInfo;

      // 簡易的なバリデーション
      if (!userData || typeof userData !== "object") {
        return res.status(400).json({
          success: false,
          error: "無効なデータ形式です",
        });
      }

      // 簡易的なID生成（本番環境では適切なID生成方法を使用すべき）
      const id = Date.now().toString();

      // データ変換（ユーザー情報をDBレコード形式に変換）
      const diagnosisItem = {
        id,
        gender: userData.gender || "unknown",
        age: userData.age || 0,
        emotion_score: userData.emotion || 0,
        rational_score: userData.rational || 0,
        active_score: userData.active || 0,
        passive_score: userData.passive || 0,
        created_at: new Date().toISOString(),
      };

      // データを保存（実際のアプリではデータベースに保存）
      diagnosisData.push(diagnosisItem);

      // 成功レスポンス
      res.status(200).json({
        success: true,
        data: { saved: true },
        message: "診断データが正常に保存されました",
      });
    } catch (error) {
      console.error("診断データ保存エラー:", error);
      res.status(500).json({
        success: false,
        error: "診断データの保存中にエラーが発生しました",
      });
    }
  } else {
    // POST以外のメソッドは許可しない
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }
}

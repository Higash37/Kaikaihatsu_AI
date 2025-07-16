import { NextApiRequest, NextApiResponse } from "next";

import { ApiResponse, UserInfo } from "@/types";

export default async function handler(
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
      // Firestoreが自動的にIDを生成するため、ここでは不要
      // const id = Date.now().toString();

      // データ変換（ユーザー情報をDBレコード形式に変換）
      const diagnosisItem = {
        // id,
        gender: userData.gender || "unknown",
        age: userData.age || 0,
        emotion_score: userData.emotion || 0,
        rational_score: userData.rational || 0,
        active_score: userData.active || 0,
        passive_score: userData.passive || 0,
        created_at: new Date().toISOString(),
      };

      // データをログに出力（実際の保存は行わない）
      console.log("診断データ（保存スキップ）:", diagnosisItem);

      // 成功レスポンス
      res.status(200).json({
        success: true,
        data: { saved: true },
        message: "診断データが正常に保存されました（ローカルモード）",
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

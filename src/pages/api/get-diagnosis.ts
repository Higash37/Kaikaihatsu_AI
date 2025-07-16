import { NextApiRequest, NextApiResponse } from "next";

import { ApiResponse, DiagnosisItem } from "@/types";

// サンプルデータ
const sampleData: DiagnosisItem[] = [
  {
    id: "1",
    gender: "男性",
    age: 25,
    emotion_score: 75,
    rational_score: 60,
    active_score: 80,
    passive_score: 40,
  },
  {
    id: "2",
    gender: "女性",
    age: 30,
    emotion_score: 85,
    rational_score: 70,
    active_score: 65,
    passive_score: 55,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DiagnosisItem[]>>
) {
  if (req.method === "GET") {
    try {
      // ローカルのサンプルデータを返す
      res.status(200).json({
        success: true,
        data: sampleData,
        message: "診断データを取得しました",
      });
    } catch (error) {
      console.error("診断データ取得エラー:", error);
      res.status(500).json({
        success: false,
        error: "診断データの取得中にエラーが発生しました",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }
}

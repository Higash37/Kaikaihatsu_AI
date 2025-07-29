import { NextApiRequest, NextApiResponse } from "next";

import { getAllQuizResults } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const results = await getAllQuizResults();

    // 診断データのみをフィルタリング
    const diagnosisData = results.filter(
      (result: any) => result.result_data?.type === "diagnosis"
    );

    res.status(200).json({
      success: true,
      data: diagnosisData,
      message: "診断データを取得しました",
    });
  } catch (error) {
    console.error("診断データ取得エラー:", error);
    res.status(500).json({
      success: false,
      error: "診断データの取得中にエラーが発生しました",
    });
  }
}

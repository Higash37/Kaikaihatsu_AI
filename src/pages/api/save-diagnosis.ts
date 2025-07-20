import { NextApiRequest, NextApiResponse } from "next";
import { saveQuizResult } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      emotion_score,
      rational_score,
      active_score,
      passive_score,
      x,
      y,
      gender,
      age,
    } = req.body;

    console.log("📌 受信したデータ:", req.body);

    // Firebaseに保存するデータを整形
    const saveData = {
      emotion_score,
      rational_score,
      active_score,
      passive_score,
      x,
      y,
      gender,
      age,
      type: "diagnosis", // 診断データであることを示す
    };

    const docId = await saveQuizResult(saveData);

    res.status(201).json({
      success: true,
      data: { saved: true, docId },
      message: "診断データが正常に保存されました",
    });
  } catch (error) {
    console.error("❌ データ保存エラー:", error);
    res.status(500).json({
      success: false,
      error: "診断データの保存中にエラーが発生しました",
    });
  }
}

import { collection, addDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { QuizResponse } from "@/types/quiz";
import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const responseData: Omit<QuizResponse, "id"> = req.body;

    // 必須フィールドの検証
    if (
      !responseData.quizId ||
      !responseData.answers ||
      !Array.isArray(responseData.answers)
    ) {
      return res.status(400).json({ error: "Invalid response data" });
    }

    // Firestoreに回答データを保存
    const docRef = await addDoc(collection(db, "responses"), {
      ...responseData,
      submittedAt: new Date().toISOString(),
    });

    res.status(200).json({
      id: docRef.id,
      message: "Response saved successfully",
    });
  } catch (error) {
    console.error("回答データの保存エラー:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

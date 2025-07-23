import {
  collection,
  query,
  where,
  limit as firestoreLimit,
  getDocs,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sort = "popularity", limit = "10" } = req.query;
  const sortBy = sort as "popularity" | "recent";
  const limitNum = parseInt(limit as string, 10);

  try {
    // Firestoreから公開クイズを取得
    const q = query(
      collection(db, "quizzes"),
      where("isPublic", "==", true),
      firestoreLimit(limitNum)
    );

    const querySnapshot = await getDocs(q);
    const firestoreQuizzes: Quiz[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      firestoreQuizzes.push({
        id: doc.id,
        ...data,
      } as Quiz);
    });

    let allQuizzes = [...firestoreQuizzes];

    // ソート処理
    if (sortBy === "recent") {
      allQuizzes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      // popularity（デフォルト）
      allQuizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    res.status(200).json({
      success: true,
      quizzes: allQuizzes,
      total: allQuizzes.length,
    });
  } catch (error) {
    console.error("公開クイズの取得エラー:", error);
    res.status(500).json({
      success: false,
      quizzes: [],
      total: 0,
      error: "クイズの取得に失敗しました",
    });
  }
}
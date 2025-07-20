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

  try {
    const { sort = "popularity", limit = 20 } = req.query;

    console.log("公開クイズ取得開始...");

    // Firestoreから公開クイズを取得（まずはシンプルなクエリから）
    const quizzesQuery = query(
      collection(db, "quizzes"),
      where("isPublic", "==", true),
      firestoreLimit(Number(limit))
    );

    const quizzesSnapshot = await getDocs(quizzesQuery);
    console.log("Firestoreから取得した文書数:", quizzesSnapshot.docs.length);

    const quizzes = quizzesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Quiz[];

    // ソートはJavaScript側で実行
    if (sort === "popularity") {
      quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      quizzes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    console.log(
      `公開クイズ取得: ${quizzes.length}件`,
      quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        creatorName: q.creatorName,
        isPublic: q.isPublic,
        createdAt: q.createdAt,
      }))
    );

    res.status(200).json({
      quizzes,
      totalCount: quizzes.length,
      hasMore: quizzes.length === Number(limit),
    });
  } catch (error) {
    console.error("公開クイズの取得エラー:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

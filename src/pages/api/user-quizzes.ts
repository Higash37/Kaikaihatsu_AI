import { collection, query, where, getDocs } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[user-quizzes] API endpoint called with method:", req.method);

  if (req.method !== "GET") {
    console.log("[user-quizzes] Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      console.log("[user-quizzes] Missing or invalid userId:", userId);
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("[user-quizzes] Fetching quizzes for userId:", userId);

    // ユーザーが作成したクイズを取得
    console.log("[user-quizzes] Executing Firestore query");
    const quizzesQuery = query(
      collection(db, "quizzes"),
      where("creatorId", "==", userId)
    );

    const quizzesSnapshot = await getDocs(quizzesQuery);
    console.log(
      "[user-quizzes] Query completed, document count:",
      quizzesSnapshot.size
    );

    const quizzes = quizzesSnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(
        "[user-quizzes] Processing quiz:",
        doc.id,
        "title:",
        data.title
      );
      return {
        id: doc.id,
        ...data,
      };
    }) as Quiz[];

    // Sort by createdAt in descending order on the client side
    quizzes.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    console.log("[user-quizzes] Returning", quizzes.length, "quizzes");
    res.status(200).json({
      quizzes,
      totalCount: quizzes.length,
    });
  } catch (error) {
    console.error("[user-quizzes] Error fetching user quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

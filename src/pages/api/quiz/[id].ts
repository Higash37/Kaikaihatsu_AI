import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Quiz ID is required" });
  }

  if (req.method === "GET") {
    try {
      const quizDoc = await getDoc(doc(db, "quizzes", id));
      if (!quizDoc.exists()) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      const quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;

      res.status(200).json(quiz);
    } catch (error) {
      console.error("クイズの取得エラー:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      // クイズを削除
      await deleteDoc(doc(db, "quizzes", id));

      // 関連する回答も削除
      const responsesQuery = query(
        collection(db, "responses"),
        where("quizId", "==", id)
      );
      const responsesSnapshot = await getDocs(responsesQuery);

      if (!responsesSnapshot.empty) {
        const batch = writeBatch(db);
        responsesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }

      res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("クイズの削除エラー:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

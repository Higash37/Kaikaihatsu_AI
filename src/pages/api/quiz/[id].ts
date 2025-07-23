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
    return res.status(400).json({ error: "クイズIDが必要です" });
  }

  if (req.method === "GET") {
    try {
      console.log(`クイズ取得開始: ${id}`);

      // Firestoreから指定されたクイズを取得
      const quizDoc = await getDoc(doc(db, "quizzes", id));
      
      if (!quizDoc.exists()) {
        return res.status(404).json({ error: "クイズが見つかりませんでした" });
      }

      const quiz: Quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      console.log("Firestoreからクイズを取得:", quiz.id);

      res.status(200).json({
        success: true,
        quiz: quiz,
      });
    } catch (error) {
      console.error("クイズの取得エラー:", error);
      res.status(500).json({ 
        success: false,
        error: "クイズの取得に失敗しました" 
      });
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

      res.status(200).json({ 
        success: true,
        message: "クイズが正常に削除されました" 
      });
    } catch (error) {
      console.error("クイズの削除エラー:", error);
      res.status(500).json({ 
        success: false,
        error: "クイズの削除に失敗しました" 
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
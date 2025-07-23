import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // 回答を保存
    try {
      const { quizId, answers, demographics, location, userId } = req.body;

      if (!quizId || !answers) {
        return res.status(400).json({ error: "必要なデータが不足しています" });
      }

      const responseData = {
        quizId,
        answers,
        demographics: demographics || {},
        location: location || "",
        userId: userId || null,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "responses"), responseData);

      res.status(201).json({
        success: true,
        responseId: docRef.id,
        message: "回答が保存されました",
      });
    } catch (error) {
      console.error("回答保存エラー:", error);
      res.status(500).json({
        success: false,
        error: "回答の保存に失敗しました",
      });
    }
  } else if (req.method === "GET") {
    // 回答を取得
    try {
      const { quizId, limit = "100" } = req.query;
      const limitNum = parseInt(limit as string, 10);

      if (!quizId) {
        return res.status(400).json({ error: "quizIdが必要です" });
      }

      const q = query(
        collection(db, "responses"),
        where("quizId", "==", quizId),
        orderBy("createdAt", "desc"),
        firestoreLimit(limitNum)
      );

      const querySnapshot = await getDocs(q);
      const responses: any[] = [];

      querySnapshot.forEach((doc) => {
        responses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      res.status(200).json({
        success: true,
        responses,
        total: responses.length,
      });
    } catch (error) {
      console.error("回答取得エラー:", error);
      res.status(500).json({
        success: false,
        responses: [],
        total: 0,
        error: "回答の取得に失敗しました",
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
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

// サンプルクイズデータ
const sampleQuizzes: Quiz[] = [
  {
    id: "sample-quiz-1",
    title: "恋愛スタイル診断",
    description: "あなたの恋愛における感情重視度と理性重視度を診断します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 30,
    isPublic: true,
    tags: ["恋愛", "診断", "性格"],
    totalResponses: 150,
    popularity: 85,
    averageRating: 4.2,
    axes: [
      { id: 1, name: "感情重視度", description: "感情的な判断を重視する傾向" },
      { id: 2, name: "未来志向", description: "将来のことを考える傾向" },
      { id: 3, name: "直感性", description: "直感を信じる傾向" },
      { id: 4, name: "現実性", description: "現実的な判断をする傾向" },
    ],
    questions: [
      {
        id: "q1",
        text: "自分の直感を信じて行動することが多い。",
        type: "scale",
        required: true,
        order: 1,
        axisId: 3,
      },
      {
        id: "q2",
        text: "相手との関係において、未来のことよりも今のことを考える方だ。",
        type: "scale",
        required: true,
        order: 2,
        axisId: 4,
      },
      {
        id: "q3",
        text: "目の前の気持ちに素直に従うことが大切だと思う。",
        type: "scale",
        required: true,
        order: 3,
        axisId: 1,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
  {
    id: "sample-quiz-2",
    title: "コミュニケーションスタイル診断",
    description: "あなたのコミュニケーションの特徴を分析します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 25,
    isPublic: true,
    tags: ["コミュニケーション", "診断", "人間関係"],
    totalResponses: 89,
    popularity: 72,
    averageRating: 4.0,
    questions: [
      {
        id: "q1",
        text: "人前で話すことが得意だ。",
        type: "scale",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        text: "相手の話をよく聞く方だ。",
        type: "scale",
        required: true,
        order: 2,
      },
      {
        id: "q3",
        text: "自分の意見をはっきり言う方だ。",
        type: "scale",
        required: true,
        order: 3,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
  {
    id: "sample-quiz-3",
    title: "大学適性診断",
    description: "あなたに最適な大学のタイプを診断します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 20,
    isPublic: true,
    tags: ["大学", "進路", "適性"],
    totalResponses: 234,
    popularity: 95,
    averageRating: 4.5,
    questions: [
      {
        id: "q1",
        text: "研究活動に興味がある。",
        type: "scale",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        text: "実践的なスキルを身につけたい。",
        type: "scale",
        required: true,
        order: 2,
      },
      {
        id: "q3",
        text: "国際的な視野を広げたい。",
        type: "scale",
        required: true,
        order: 3,
      },
      {
        id: "q4",
        text: "少人数での学習を好む。",
        type: "scale",
        required: true,
        order: 4,
      },
      {
        id: "q5",
        text: "就職に有利な大学を選びたい。",
        type: "scale",
        required: true,
        order: 5,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
];

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
      console.log(`クイズ取得開始: ${id}`);
      console.log("Firebase利用可能:", !!db);

      let quiz: Quiz | null = null;

      // Firestoreからクイズを取得（利用可能な場合）
      if (db) {
        try {
          const quizDoc = await getDoc(doc(db, "quizzes", id));
          if (quizDoc.exists()) {
            quiz = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
            console.log("Firestoreからクイズを取得:", quiz.id);
          } else {
            console.log("Firestoreにクイズが見つかりません:", id);
          }
        } catch (firestoreError) {
          console.log("Firestoreからの取得に失敗:", firestoreError);
        }
      } else {
        console.log("Firebase not available");
      }

      // Firestoreから取得できない場合はサンプルデータから検索
      if (!quiz) {
        console.log("サンプルデータから検索中...");
        quiz = sampleQuizzes.find((q) => q.id === id) || null;
        if (quiz) {
          console.log("サンプルデータからクイズを取得:", quiz.id);
        } else {
          console.log("サンプルデータにもクイズが見つかりません:", id);
        }
      }

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

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

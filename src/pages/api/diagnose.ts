import type { NextApiRequest, NextApiResponse } from "next";

import { DiagnosisItem } from "@/types";

// サンプルユーザーデータ（ローカル）
const sampleUsers: DiagnosisItem[] = [
  {
    id: "1",
    gender: "男性",
    age: 25,
    emotion_score: 75,
    rational_score: 60,
    active_score: 80,
    passive_score: 40,
  },
  {
    id: "2",
    gender: "女性",
    age: 30,
    emotion_score: 85,
    rational_score: 70,
    active_score: 65,
    passive_score: 55,
  },
  {
    id: "3",
    gender: "男性",
    age: 28,
    emotion_score: 60,
    rational_score: 90,
    active_score: 70,
    passive_score: 30,
  },
];

// ユーザーの回答とDBのユーザーデータを比較してスコアを計算する関数
const calculateDistance = (answers: number[], user: DiagnosisItem): number => {
  // この例では単純なユークリッド距離を計算
  // 実際のスコア項目に合わせて調整が必要
  const userScores = [
    user.emotion_score,
    user.rational_score,
    user.active_score,
    user.passive_score,
  ];
  return Math.sqrt(
    userScores.reduce(
      (sum, score, index) => sum + Math.pow(score - (answers[index] || 0), 2),
      0
    )
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { answers } = req.body; // answersはスコアの配列を想定

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers format" });
  }

  try {
    // ローカルのサンプルデータを使用
    const allUsers: DiagnosisItem[] = sampleUsers;

    if (allUsers.length === 0) {
      return res.status(404).json({ error: "No user data found" });
    }

    let closestUser: DiagnosisItem | null = null;
    let minDistance = Infinity;

    for (const user of allUsers) {
      const distance = calculateDistance(answers, user);
      if (distance < minDistance) {
        minDistance = distance;
        closestUser = user;
      }
    }

    res.status(200).json({ result: closestUser });
  } catch (error) {
    console.error("Diagnosis error:", error);
    res.status(500).json({ error: "Failed to process diagnosis" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

import { getQuizById } from "@/utils/supabase";

// 4軸診断システムの結果型
interface DiagnosisResult {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number; // -1 to 1 (left to right)
    y: number; // -1 to 1 (bottom to top)
  };
  axisScores: {
    axisId: number;
    axisName: string;
    score: number; // 1-5のスケール
    percentage: number; // 0-100%
  }[];
}

// 質問の型
interface Question {
  id: string;
  text: string;
  axisWeights: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
}

// 結果の型
interface Result {
  id: string;
  name: string;
  description: string;
  x: number; // -1 to 1
  y: number; // -1 to 1
}

// 4軸診断の計算機能
const calculateDiagnosis = (
  answers: { [questionId: string]: number },
  questions: Question[],
  results: Result[],
  axes: any[]
): DiagnosisResult => {
  // 軸ごとのスコアを計算
  let totalXWeight = 0;
  let totalYWeight = 0;
  let questionCount = 0;

  Object.entries(answers).forEach(([questionId, score]) => {
    const question = questions.find(q => q.id === questionId);
    if (question && score !== undefined) {
      // 5段階評価を-1〜1の範囲に変換（3が中立）
      const normalizedScore = (score - 3) / 2; // 1→-1, 2→-0.5, 3→0, 4→0.5, 5→1
      
      totalXWeight += normalizedScore * question.axisWeights.x;
      totalYWeight += normalizedScore * question.axisWeights.y;
      questionCount++;
    }
  });

  // 平均座標を計算
  const avgX = questionCount > 0 ? totalXWeight / questionCount : 0;
  const avgY = questionCount > 0 ? totalYWeight / questionCount : 0;

  // 最も近い結果を見つける
  let closestResult = results[0];
  let minDistance = Infinity;

  results.forEach(result => {
    const distance = Math.sqrt(
      Math.pow(result.x - avgX, 2) + Math.pow(result.y - avgY, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestResult = result;
    }
  });

  // 軸ごとのスコア詳細を計算
  const axisScores = axes.map(axis => {
    let axisTotal = 0;
    let axisCount = 0;

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === questionId);
      if (question && score !== undefined) {
        // 各軸への影響度を計算
        let axisInfluence = 0;
        if (axis.id === 1) { // X軸
          axisInfluence = Math.abs(question.axisWeights.x);
        } else if (axis.id === 2) { // Y軸
          axisInfluence = Math.abs(question.axisWeights.y);
        }

        if (axisInfluence > 0) {
          axisTotal += score;
          axisCount++;
        }
      }
    });

    const avgScore = axisCount > 0 ? axisTotal / axisCount : 3;
    return {
      axisId: axis.id,
      axisName: axis.name,
      score: avgScore,
      percentage: Math.round(((avgScore - 1) / 4) * 100) // 1-5を0-100%に変換
    };
  });

  return {
    id: closestResult.id,
    name: closestResult.name,
    description: closestResult.description,
    coordinates: {
      x: avgX,
      y: avgY
    },
    axisScores
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { quizId, answers } = req.body;

  if (!quizId || !answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Quiz ID and answers are required" });
  }

  try {
    // Supabaseからクイズデータを取得
    const quizData = await getQuizById(quizId);
    
    if (!quizData) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // クイズデータの構造を確認してパース
    const questions = quizData.questions?.questions || [];
    const results = quizData.questions?.results || [];
    const axes = quizData.questions?.axes || [
      { id: 1, name: "X軸", description: "左右の軸" },
      { id: 2, name: "Y軸", description: "上下の軸" }
    ];

    if (questions.length === 0 || results.length === 0) {
      return res.status(400).json({ error: "Quiz data is incomplete" });
    }

    // 診断計算を実行
    const diagnosis = calculateDiagnosis(answers, questions, results, axes);

    console.log("診断結果:", diagnosis);

    res.status(200).json({ 
      success: true,
      diagnosis,
      quizTitle: quizData.title,
      quizDescription: quizData.description
    });

  } catch (error) {
    console.error("Diagnosis error:", error);
    res.status(500).json({ error: "Failed to process diagnosis" });
  }
}

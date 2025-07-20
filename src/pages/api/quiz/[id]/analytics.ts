import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { QuizAnalytics, QuizResponse } from "@/types/quiz";
import { db } from "@/utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Quiz ID is required" });
  }

  try {
    // クイズの存在確認
    const quizDoc = await getDoc(doc(db, "quizzes", id));
    if (!quizDoc.exists()) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // クイズの回答データを取得
    const responsesQuery = query(
      collection(db, "responses"),
      where("quizId", "==", id)
    );
    const responsesSnapshot = await getDocs(responsesQuery);
    const responses = responsesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResponse[];

    // 分析データを計算
    const analytics = calculateAnalytics(responses, quizDoc.data(), id);

    res.status(200).json({
      analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("分析データの取得エラー:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

function calculateAnalytics(
  responses: QuizResponse[],
  quizData: any,
  _quizId: string
): QuizAnalytics {
  const totalResponses = responses.length;

  // 人口統計の集計
  const demographicBreakdown = {
    gender: countByField(responses, "demographics.gender"),
    ageRange: countByField(responses, "demographics.ageRange"),
    location: countByField(responses, "demographics.location"),
    occupation: countByField(responses, "demographics.occupation"),
  };

  // 質問別分析
  const questionAnalytics =
    quizData.questions?.map((question: any) => {
      const questionResponses = responses
        .map((r) => r.answers.find((a) => a.questionId === question.id))
        .filter(Boolean);

      const responseCount = questionResponses.length;

      // スケール統計の計算
      const scaleValues = questionResponses
        .map((r) => r?.value)
        .filter((v) => typeof v === "number") as number[];

      const scaleStats =
        scaleValues.length > 0
          ? {
              average:
                scaleValues.reduce((sum, val) => sum + val, 0) /
                scaleValues.length,
              median: calculateMedian(scaleValues),
              mode: calculateMode(scaleValues),
            }
          : undefined;

      // 選択肢別カウント
      const optionCounts = questionResponses.reduce(
        (acc, r) => {
          if (r?.text) {
            acc[r.text] = (acc[r.text] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        questionId: question.id,
        questionText: question.text,
        responseCount,
        scaleStats,
        optionCounts:
          Object.keys(optionCounts).length > 0 ? optionCounts : undefined,
      };
    }) || [];

  // 位置情報分析
  const locationAnalytics =
    responses.filter((r) => r.location).length > 0
      ? {
          popularAreas: calculatePopularAreas(responses),
          heatmapData: [], // 実装時に追加
        }
      : undefined;

  // 評価分析
  const ratings = responses
    .map((r) => r.rating)
    .filter((r) => typeof r === "number") as number[];

  const ratingAnalytics =
    ratings.length > 0
      ? {
          averageRating:
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
          ratingDistribution: countByValue(ratings),
          totalRatings: ratings.length,
        }
      : undefined;

  return {
    totalResponses,
    demographicBreakdown,
    questionAnalytics,
    locationAnalytics,
    ratingAnalytics,
  };
}

function countByField(
  responses: QuizResponse[],
  fieldPath: string
): Record<string, number> {
  return responses.reduce(
    (acc, response) => {
      const value = getNestedValue(response, fieldPath);
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
}

function countByValue(values: (string | number)[]): Record<string, number> {
  return values.reduce(
    (acc, value) => {
      const key = String(value);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateMode(values: number[]): number {
  const counts = countByValue(values);
  const maxCount = Math.max(...Object.values(counts));
  const modes = Object.entries(counts)
    .filter(([, count]) => count === maxCount)
    .map(([value]) => Number(value));
  return modes[0];
}

function calculatePopularAreas(responses: QuizResponse[]): Array<{
  prefecture: string;
  city: string;
  responseCount: number;
  percentage: number;
}> {
  const locationCounts = responses
    .filter((r) => r.location?.prefecture && r.location?.city)
    .reduce(
      (acc, r) => {
        const key = `${r.location!.prefecture}-${r.location!.city}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  const totalWithLocation = Object.values(locationCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return Object.entries(locationCounts)
    .map(([key, count]) => {
      const [prefecture, city] = key.split("-");
      return {
        prefecture,
        city,
        responseCount: count,
        percentage: (count / totalWithLocation) * 100,
      };
    })
    .sort((a, b) => b.responseCount - a.responseCount)
    .slice(0, 10); // トップ10
}

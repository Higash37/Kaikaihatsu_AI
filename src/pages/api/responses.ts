import { NextApiRequest, NextApiResponse } from "next";

import { saveQuizResponse, getQuizResponses } from "@/utils/supabase";

// サンプル回答データ
const sampleResponses = [
  {
    id: "response-1",
    quizId: "sample-quiz-1",
    answers: [
      { questionId: "q1", value: 4 },
      { questionId: "q2", value: 3 },
      { questionId: "q3", value: 5 },
    ],
    demographics: { age: 25, gender: "female" },
    location: "tokyo",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-2",
    quizId: "sample-quiz-1",
    answers: [
      { questionId: "q1", value: 2 },
      { questionId: "q2", value: 4 },
      { questionId: "q3", value: 3 },
    ],
    demographics: { age: 32, gender: "male" },
    location: "osaka",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-3",
    quizId: "sample-quiz-1",
    answers: [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: 2 },
      { questionId: "q3", value: 4 },
    ],
    demographics: { age: 28, gender: "female" },
    location: "kyoto",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-4",
    quizId: "sample-quiz-2",
    answers: [
      { questionId: "q1", value: 3 },
      { questionId: "q2", value: 5 },
      { questionId: "q3", value: 2 },
    ],
    demographics: { age: 35, gender: "male" },
    location: "tokyo",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-5",
    quizId: "sample-quiz-2",
    answers: [
      { questionId: "q1", value: 4 },
      { questionId: "q2", value: 3 },
      { questionId: "q3", value: 4 },
    ],
    demographics: { age: 22, gender: "female" },
    location: "osaka",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-6",
    quizId: "sample-quiz-3",
    answers: [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: 4 },
      { questionId: "q3", value: 3 },
      { questionId: "q4", value: 2 },
      { questionId: "q5", value: 5 },
    ],
    demographics: { age: 19, gender: "male" },
    location: "tokyo",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-7",
    quizId: "sample-quiz-3",
    answers: [
      { questionId: "q1", value: 2 },
      { questionId: "q2", value: 5 },
      { questionId: "q3", value: 4 },
      { questionId: "q4", value: 3 },
      { questionId: "q5", value: 4 },
    ],
    demographics: { age: 45, gender: "female" },
    location: "kyoto",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-8",
    quizId: "sample-quiz-3",
    answers: [
      { questionId: "q1", value: 4 },
      { questionId: "q2", value: 3 },
      { questionId: "q3", value: 5 },
      { questionId: "q4", value: 4 },
      { questionId: "q5", value: 3 },
    ],
    demographics: { age: 31, gender: "male" },
    location: "osaka",
    createdAt: new Date().toISOString(),
  },
  // より多様な回答を追加
  {
    id: "response-9",
    quizId: "sample-quiz-1",
    answers: [
      { questionId: "q1", value: 1 },
      { questionId: "q2", value: 1 },
      { questionId: "q3", value: 2 },
    ],
    demographics: { age: 18, gender: "male" },
    location: "tokyo",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-10",
    quizId: "sample-quiz-1",
    answers: [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: 5 },
      { questionId: "q3", value: 5 },
    ],
    demographics: { age: 40, gender: "female" },
    location: "kyoto",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-11",
    quizId: "sample-quiz-2",
    answers: [
      { questionId: "q1", value: 1 },
      { questionId: "q2", value: 5 },
      { questionId: "q3", value: 1 },
    ],
    demographics: { age: 29, gender: "male" },
    location: "osaka",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "response-12",
    quizId: "sample-quiz-2",
    answers: [
      { questionId: "q1", value: 5 },
      { questionId: "q2", value: 1 },
      { questionId: "q3", value: 5 },
    ],
    demographics: { age: 36, gender: "female" },
    location: "tokyo",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { quizId, answers, demographics, location } = req.body;

      if (!quizId || !answers) {
        return res
          .status(400)
          .json({ error: "Quiz ID and answers are required" });
      }

      const responseData = {
        quizId,
        answers,
        demographics,
        location,
        createdAt: new Date().toISOString(),
      };

      // Supabaseに保存
      try {
        const savedId = await saveQuizResponse({
          userId: null, // 匿名回答の場合
          quizId,
          responses: answers,
          result: null, // 結果は別途計算・保存
        });
        console.log("回答が保存されました:", savedId);
        res.status(200).json({ id: savedId, ...responseData });
      } catch (supabaseError) {
        console.error("Supabase保存エラー:", supabaseError);
        res.status(500).json({ error: "回答の保存に失敗しました" });
      }
    } catch (error) {
      console.error("回答保存エラー:", error);
      res.status(500).json({ error: "回答の保存に失敗しました" });
    }
  } else if (req.method === "GET") {
    try {
      const { quizId, limit = 50 } = req.query;

      if (!quizId || typeof quizId !== "string") {
        return res.status(400).json({ error: "Quiz ID is required" });
      }

      console.log(`回答取得開始: ${quizId}`);

      let responses: any[] = [];

      // Supabaseから回答を取得
      try {
        const supabaseResponses = await getQuizResponses(quizId);
        console.log("Supabaseから取得した回答数:", supabaseResponses.length);

        if (supabaseResponses.length > 0) {
          // Supabaseの診断データを既存の回答形式に変換
          responses = supabaseResponses.slice(0, Number(limit)).map((diagnosis) => ({
            id: diagnosis.id,
            quizId: diagnosis.quiz_id,
            answers: diagnosis.responses || [],
            demographics: {},
            location: "",
            createdAt: diagnosis.created_at,
          }));
        } else {
          console.log("Supabaseに回答がないため、サンプルデータを使用");
        }
      } catch (supabaseError) {
        console.log(
          "Supabaseからの取得に失敗、サンプルデータを使用:",
          supabaseError
        );
      }

      // Supabaseから取得できない場合はサンプルデータから検索
      if (responses.length === 0) {
        console.log("サンプルデータから検索中...");
        responses = sampleResponses.filter((r) => r.quizId === quizId);
        console.log("サンプルデータから取得した回答数:", responses.length);
      }

      res.status(200).json({
        responses,
        totalCount: responses.length,
        hasMore: responses.length === Number(limit),
      });
    } catch (error) {
      console.error("回答取得エラー:", error);
      // エラー時はサンプルデータを返す
      const { quizId } = req.query;
      const fallbackResponses = sampleResponses.filter(
        (r) => r.quizId === quizId
      );
      res.status(200).json({
        responses: fallbackResponses,
        totalCount: fallbackResponses.length,
        hasMore: false,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

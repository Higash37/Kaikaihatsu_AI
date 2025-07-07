// 質問をランダムに取得するAPI
import { NextApiRequest, NextApiResponse } from "next";

import {
  emotionalQuestions,
  rationalQuestions,
  passiveQuestions,
  activeQuestions,
} from "../../data/QuestionList";

import { ApiResponse, Question } from "@/types";
import { shuffle } from "@/utils";

// ランダムな質問リストを生成する関数（各カテゴリから15問ずつ取得）
function generateRandomQuestions(): Question[] {
  const selectedEmotionalQuestions = shuffle([...emotionalQuestions]).slice(
    0,
    5
  );
  const selectedRationalQuestions = shuffle([...rationalQuestions]).slice(0, 5);
  const selectedActiveQuestions = shuffle([...activeQuestions]).slice(0, 5);
  const selectedPassiveQuestions = shuffle([...passiveQuestions]).slice(0, 5);

  // シャッフルして統合
  const allQuestions = shuffle([
    ...selectedEmotionalQuestions,
    ...selectedRationalQuestions,
    ...selectedActiveQuestions,
    ...selectedPassiveQuestions,
  ]);

  // 各質問に新しいidを付与（0から順番に）
  return allQuestions.map((question, index) => ({
    ...question,
    id: index, // 新しいIDを順番に設定
  }));
}

// API ハンドラー
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Question[]>>
) {
  try {
    const questions = generateRandomQuestions();
    res.status(200).json({
      success: true,
      data: questions,
      message: "ランダムな質問リストを生成しました",
    });
  } catch (error) {
    console.error("質問生成エラー:", error);
    res.status(500).json({
      success: false,
      error: "質問の生成中にエラーが発生しました",
    });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 期待するAIの応答の型定義
type QuizData = {
  title: string;
  questions: { id: number; text: string }[];
  indicators: { id: number; name: string; description: string }[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuizData | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { theme, questionCount = 10 } = req.body;

  if (!theme || typeof theme !== "string") {
    return res.status(400).json({ error: "テーマを正しく指定してください。" });
  }

  if (
    !questionCount ||
    typeof questionCount !== "number" ||
    questionCount < 5 ||
    questionCount > 30
  ) {
    return res
      .status(400)
      .json({ error: "問題数は5〜30の範囲で指定してください。" });
  }

  try {
    // OpenAI APIを使ってクイズを生成
    const prompt = `
      以下のテーマに関する診断クイズを作成してください。

      # テーマ
      ${theme}

      # 要件
      - 診断のタイトルを"title"としてください。
      - 質問は${questionCount}個作成し、"questions"というキーの配列に格納してください。各質問は{ "id": (数値), "text": "(質問文)" }の形式にしてください。
      - 診断結果の指標を4個作成し、"indicators"というキーの配列に格納してください。各指標は{ "id": (数値), "name": "(指標名)", "description": "(指標の詳細な説明)" }の形式にしてください。
      - 出力は必ず指定されたキーを持つJSONオブジェクト形式に従ってください。
      - 質問は1-5のスケールで回答できるようにしてください（1=そう思わない、5=そう思う）。
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AIからの応答が空です。");
    }

    const parsedContent: QuizData = JSON.parse(content);

    if (
      !parsedContent.title ||
      !parsedContent.questions ||
      !parsedContent.indicators
    ) {
      throw new Error("AIが生成したデータの形式が正しくありません。");
    }

    // 生成したクイズをそのまま返す（DBに保存しない）
    res.status(200).json(parsedContent);
  } catch (error) {
    console.error("AIクイズ生成エラー:", error);
    res.status(500).json({ error: "クイズの生成に失敗しました。" });
  }
}

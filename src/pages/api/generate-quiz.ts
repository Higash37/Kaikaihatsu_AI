import { doc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { db } from "@/utils/firebase";

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// クイズIDを生成する関数
function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

  const {
    theme,
    questionCount = 10,
    tags = [],
    isPublic = true,
    enableDemographics = false,
    enableLocationTracking = false,
    enableRating = false,
    creatorId,
    creatorName,
  } = req.body;

  if (!theme || typeof theme !== "string") {
    return res.status(400).json({ error: "テーマを正しく指定してください。" });
  }

  if (!creatorId || !creatorName) {
    return res.status(400).json({ error: "作成者情報が必要です。" });
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
      以下のテーマに関する診断クイズを作成してください。テーマから外れないよう注意深く作成してください。

      # テーマ
      ${theme}

      # 重要な要件
      - 必ず上記のテーマに沿った内容のみを作成してください
      - テーマが「テニス」なら全ての質問と指標をテニスに関連付けてください
      - テーマが「サッカー」以外の場合、サッカーに関する内容は一切含めないでください
      - 診断のタイトルを"title"としてください（テーマを反映したタイトル）
      - 質問は${questionCount}個作成し、"questions"というキーの配列に格納してください。各質問は{ "id": (数値), "text": "(質問文)" }の形式にしてください
      - 質問は1-5のスケールで回答できるようにしてください（1=そう思わない、5=そう思う）
      - 診断結果の指標を4個作成し、"indicators"というキーの配列に格納してください。各指標は{ "id": (数値), "name": "(指標名)", "description": "(指標の詳細な説明)" }の形式にしてください
      - 指標名と説明は必ずテーマに関連した内容にしてください
      - 出力は必ず指定されたキーを持つJSONオブジェクト形式に従ってください
      
      例：テーマが「テニス選手の適性診断」の場合
      - タイトル：「テニス選手適性診断」
      - 質問：「テニスの練習を毎日続けることができる」など
      - 指標：「フォアハンド適性」「バックハンド適性」「サーブ力」「メンタル強度」など
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant designed to output JSON. You must strictly follow the given theme and never mix different themes. If the theme is about tennis, ALL content must be tennis-related. If the theme is about cooking, ALL content must be cooking-related. Never use generic sports content when a specific sport is mentioned.",
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

    // クイズデータに作成者情報と設定を追加
    const quizData = {
      ...parsedContent,
      id: generateQuizId(),
      creatorId,
      creatorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questionCount,
      isPublic,
      tags,
      totalResponses: 0,
      popularity: 0,
      enableDemographics,
      enableLocationTracking,
      enableRating,
      questions: parsedContent.questions.map((q) => ({
        ...q,
        type: "scale" as const,
        required: true,
        order: q.id,
      })),
    };

    // Firestoreにクイズを保存
    console.log("保存するクイズデータ:", {
      id: quizData.id,
      creatorId: quizData.creatorId,
      creatorName: quizData.creatorName,
      isPublic: quizData.isPublic,
      title: quizData.title,
    });

    await setDoc(doc(db, "quizzes", quizData.id), quizData);

    console.log("クイズがFirestoreに保存されました:", quizData.id);

    res.status(200).json(quizData);
  } catch (error) {
    console.error("AIクイズ生成エラー:", error);
    res.status(500).json({ error: "クイズの生成に失敗しました。" });
  }
}

import { doc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { db } from "@/utils/firebase";

// OpenAIクライアントの初期化（APIキーがある場合のみ）
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("OpenAI API key not found. Quiz generation will be disabled.");
}

// クイズIDを生成する関数
function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 期待するAIの応答の型定義
type QuizData = {
  title: string;
  questions: { id: number; text: string; axisId: number }[];
  indicators: { id: number; name: string; description: string }[];
  axes: { id: number; name: string; description: string }[];
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

  // OpenAI APIキーが設定されていない場合
  if (!openai) {
    return res.status(400).json({
      error:
        "OpenAI APIキーが設定されていません。クイズ生成機能は利用できません。",
    });
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
      
      # 4軸要素の生成
      - 4つの軸要素を"axes"というキーの配列に格納してください
      - 各軸は{ "id": (1-4), "name": "(軸名)", "description": "(軸の説明)" }の形式にしてください
      - 軸名はテーマに関連した能力や特性を表すものにしてください
      
      # 質問の生成
      - 質問は${questionCount}個作成し、"questions"というキーの配列に格納してください
      - 各質問は{ "id": (数値), "text": "(質問文)", "axisId": (1-4) }の形式にしてください
      - axisIdは質問がどの軸に対応するかを示します（1-4の値）
      - 質問は1-5のスケールで回答できるようにしてください（1=そう思わない、5=そう思う）
      - 各軸に均等に質問を分配してください（${Math.ceil(questionCount / 4)}問程度ずつ）
      
      # 診断結果の指標
      - 診断結果の指標を4個作成し、"indicators"というキーの配列に格納してください
      - 各指標は{ "id": (数値), "name": "(指標名)", "description": "(指標の詳細な説明)" }の形式にしてください
      - 指標名と説明は必ずテーマに関連した内容にしてください
      
      # 出力形式
      - 出力は必ず指定されたキーを持つJSONオブジェクト形式に従ってください
      
      例：テーマが「プログラマー適性診断」の場合
      - 軸：「論理的思考力」「創造性」「問題解決力」「チームワーク」
      - 質問：「複雑な問題を段階的に解決できる」（axisId: 1）
      - 指標：「システム設計力」「アルゴリズム理解度」「デバッグ能力」「コミュニケーション力」
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
      !parsedContent.indicators ||
      !parsedContent.axes
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

    // Firestoreにクイズを保存（Firebaseが利用可能な場合のみ）
    if (db) {
      try {
        console.log("保存するクイズデータ:", {
          id: quizData.id,
          creatorId: quizData.creatorId,
          creatorName: quizData.creatorName,
          isPublic: quizData.isPublic,
          title: quizData.title,
        });

        await setDoc(doc(db, "quizzes", quizData.id), quizData);
        console.log("クイズがFirestoreに保存されました:", quizData.id);
      } catch (firebaseError) {
        console.error("Firestore保存エラー:", firebaseError);
        // Firebaseエラーでもクイズデータは返す
      }
    } else {
      console.log("Firebase not available, skipping save");
    }

    res.status(200).json(quizData);
  } catch (error) {
    console.error("AIクイズ生成エラー:", error);
    res.status(500).json({ error: "クイズの生成に失敗しました。" });
  }
}

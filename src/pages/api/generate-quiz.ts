import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { createQuiz } from "@/utils/supabase";

// OpenAI APIクライアントの初期化（APIキーがある場合のみ）
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
  axes: { 
    id: number; 
    name: string; 
    description: string;
    positiveName?: string;
    negativeName?: string;
  }[];
  results?: any[];
  resultType?: string;
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
    // ウィザードから来たデータ
    isWizardCreated = false,
    questions: wizardQuestions,
    results: wizardResults,
    axes: wizardAxes,
    resultType,
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
    let parsedContent: QuizData;

    // ウィザードから来た場合は既存データを使用、そうでなければAI生成
    if (isWizardCreated && wizardQuestions && wizardResults && wizardAxes) {
      // ウィザードで作成されたデータを使用
      parsedContent = {
        title: `${theme}診断`,
        questions: wizardQuestions.map((q: any, index: number) => ({
          id: index + 1,
          text: q.text,
          axisId: Math.abs(q.axisWeights.x) > Math.abs(q.axisWeights.y) ? 1 : 2, // より強い重みを持つ軸を選択
        })),
        axes: [
          {
            id: 1,
            name: wizardAxes[0]?.name || "X軸",
            description: wizardAxes[0]?.description || "",
            positiveName: wizardAxes[0]?.positiveName || "",
            negativeName: wizardAxes[0]?.negativeName || "",
          },
          {
            id: 2,
            name: wizardAxes[1]?.name || "Y軸", 
            description: wizardAxes[1]?.description || "",
            positiveName: wizardAxes[1]?.positiveName || "",
            negativeName: wizardAxes[1]?.negativeName || "",
          }
        ],
        results: wizardResults,
        resultType: resultType || "診断結果",
      };
    } else {
      // OpenAI APIを使ってクイズを生成
      const prompt = `あなたは心理診断・適性診断の専門家です。以下のテーマに関する診断クイズを作成してください。
テーマの本質を理解し、そのテーマに最も適した診断アプローチを採用してください。

# テーマ
${theme}

# 診断作成のガイドライン

## テーマの分析と適切なアプローチの選択
テーマを分析し、以下のうち最も適切なアプローチを採用してください：

1. **技能・能力診断**: スポーツのプレイスタイル、職業適性、学習スタイルなど
   → 能力、技術、パフォーマンスに関する質問を中心に

2. **嗜好・マッチング診断**: 好きなもの、相性、適合度など
   → 価値観、性格特性、ライフスタイルに関する質問を中心に

3. **性格・心理診断**: 性格タイプ、心理傾向など
   → 行動パターン、思考スタイル、感情反応に関する質問を中心に

## 質問作成の原則
- テーマに完全に沿った内容のみを作成
- 回答者の内面（性格、価値観、行動パターン、能力など）を探る質問
- 抽象的すぎず、具体的で分かりやすい表現
- 特定の固有名詞（人名、ブランド名など）は避ける
- 質問は「あなたは〜」「〜することが多い」「〜だと思う」の形式

# 必須の出力形式

## 診断タイトル
- "title": テーマを反映した魅力的なタイトル

## 4つの指標（東西南北）
- "axes": [
    { 
      "id": 1, 
      "name": "X軸の名称", 
      "description": "X軸が測定する特性の説明",
      "positiveName": "右側（東）の指標名（例：攻撃的スタイル）",
      "negativeName": "左側（西）の指標名（例：戦略的スタイル）"
    },
    { 
      "id": 2, 
      "name": "Y軸の名称", 
      "description": "Y軸が測定する特性の説明",
      "positiveName": "上側（北）の指標名（例：革新的傾向）",
      "negativeName": "下側（南）の指標名（例：伝統的傾向）"
    }
  ]
- 4つの指標で座標グラフの東西南北を表現
- 各指標は具体的で分かりやすい名称にする
- テーマに最も適した4つの対極的な特性を設定

## 質問
- "questions": [{ "id": 数値, "text": "質問文", "axisId": 1-2 }]
- 質問数: ${questionCount}個
- 各軸に均等分配（約${Math.ceil(questionCount / 2)}問ずつ）
- 1-5のリッカート尺度で回答（1=そう思わない、5=そう思う）

# 出力
必ず有効なJSONオブジェクトとして出力してください。例外やエラーメッセージを含めず、純粋なJSONのみを出力してください。`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "あなたは心理診断・適性診断の専門家です。各テーマを慎重に分析し、最適な診断アプローチを選択してください。回答者の本質的な洞察を明らかにする、テーマに特化した意味のある質問を作成してください。必ず日本語で回答し、特定の名前、ブランド、専門用語は避けてください。テーマに関連する普遍的な人間の特性に焦点を当ててください。有効なJSONのみを出力してください。",
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
        throw new Error("OpenAIからの応答が空です。");
      }

      parsedContent = JSON.parse(content);
    }

    if (
      !parsedContent.title ||
      !parsedContent.questions ||
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
      questionCount: parsedContent.questions.length,
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
      indicators: [], // indicatorsを空配列に
      // ウィザード用の追加データ
      isWizardCreated,
      results: parsedContent.results || [],
      resultType: parsedContent.resultType || "",
    };

    // Supabaseにクイズを保存
    try {
      console.log("保存するクイズデータ:", {
        id: quizData.id,
        creatorId: quizData.creatorId,
        creatorName: quizData.creatorName,
        isPublic: quizData.isPublic,
        title: quizData.title,
      });

      const savedId = await createQuiz({
        userId: quizData.creatorId,
        title: quizData.title,
        description: `${theme}に関する診断クイズ`,
        category: theme,
        difficulty: 'medium',
        isPublic: quizData.isPublic,
        questions: quizData,
      });
      
      console.log("クイズがSupabaseに保存されました:", savedId);
    } catch (supabaseError) {
      console.error("Supabase保存エラー:", supabaseError);
      // Supabaseエラーでもクイズデータは返す
    }

    res.status(200).json(quizData);
  } catch (error) {
    console.error("AIクイズ生成エラー:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    res.status(500).json({ 
      error: "クイズの生成に失敗しました。", 
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

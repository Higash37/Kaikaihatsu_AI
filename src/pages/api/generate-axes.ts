import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// OpenAI APIクライアントの初期化（APIキーがある場合のみ）
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("OpenAI API key not found. Axes generation will be disabled.");
}

type AxesData = {
  axes: { 
    id: number; 
    name: string; 
    description: string;
    positiveName: string;
    negativeName: string;
  }[];
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AxesData | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { theme, resultType, questionCount = 10 } = req.body;

  if (!theme || typeof theme !== "string") {
    return res.status(400).json({ error: "テーマを正しく指定してください。" });
  }

  if (!resultType || typeof resultType !== "string") {
    return res.status(400).json({ error: "結果タイプを正しく指定してください。" });
  }

  // OpenAI APIキーが設定されていない場合
  if (!openai) {
    return res.status(400).json({
      error: "OpenAI APIキーが設定されていません。指標生成機能は利用できません。",
    });
  }

  try {
    // OpenAI APIを使って4つの指標を生成
    const prompt = `あなたは心理診断・適性診断の専門家です。以下のテーマと結果タイプに基づいて、診断のための4つの指標（2軸）を作成してください。

# テーマ
${theme}

# 結果タイプ
診断結果として表示するもの: ${resultType}
この結果タイプに適した指標を設計してください。

# 指標作成のガイドライン

## テーマの分析と適切なアプローチの選択
テーマを分析し、以下のうち最も適切なアプローチを採用してください：

1. **技能・能力診断**: スポーツのプレイスタイル、職業適性、学習スタイルなど
   → 能力、技術、パフォーマンスに関する指標を中心に

2. **嗜好・マッチング診断**: 好きなもの、相性、適合度など
   → 価値観、性格特性、ライフスタイルに関する指標を中心に

3. **性格・心理診断**: 性格タイプ、心理傾向など
   → 行動パターン、思考スタイル、感情反応に関する指標を中心に

## 指標作成の原則
- テーマに完全に沿った内容のみを作成
- 2つの軸（X軸とY軸）で4つの方向性を表現
- 各指標は具体的で分かりやすい名称にする
- 特定の固有名詞（人名、ブランド名など）は避ける
- 対極的な特性を設定して、座標グラフで表現可能にする

# 必須の出力形式

"axes": [
  { 
    "id": 1, 
    "name": "X軸の名称（例：アプローチスタイル）", 
    "description": "X軸が測定する特性の詳細説明",
    "positiveName": "右側（東）の指標名（例：攻撃的スタイル）",
    "negativeName": "左側（西）の指標名（例：戦略的スタイル）"
  },
  { 
    "id": 2, 
    "name": "Y軸の名称（例：革新性）", 
    "description": "Y軸が測定する特性の詳細説明",
    "positiveName": "上側（北）の指標名（例：革新的傾向）",
    "negativeName": "下側（南）の指標名（例：伝統的傾向）"
  }
]

# 出力
必ず有効なJSONオブジェクトとして出力してください。例外やエラーメッセージを含めず、純粋なJSONのみを出力してください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは心理診断・適性診断の専門家です。テーマを慎重に分析し、最適な2軸4指標を設計してください。座標グラフで表現可能な対極的な特性を持つ指標を作成してください。必ず日本語で回答し、特定の名前、ブランド、専門用語は避けてください。有効なJSONのみを出力してください。",
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

    const parsedContent: AxesData = JSON.parse(content);

    if (!parsedContent.axes || !Array.isArray(parsedContent.axes) || parsedContent.axes.length !== 2) {
      throw new Error("AIが生成したデータの形式が正しくありません。");
    }

    // 各軸に必要なプロパティがあるかチェック
    for (const axis of parsedContent.axes) {
      if (!axis.name || !axis.description || !axis.positiveName || !axis.negativeName) {
        throw new Error("指標データに不足している項目があります。");
      }
    }

    res.status(200).json(parsedContent);
  } catch (error) {
    console.error("AI指標生成エラー:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    res.status(500).json({ 
      error: "指標の生成に失敗しました。", 
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
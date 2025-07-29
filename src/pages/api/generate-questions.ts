import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// 結果の分布を分析する関数
function analyzeResultDistribution(results: Result[]): string {
  if (results.length === 0) return "結果が配置されていません";

  const quadrants = {
    "右上": results.filter(r => r.x > 0 && r.y > 0).length,
    "左上": results.filter(r => r.x < 0 && r.y > 0).length,
    "右下": results.filter(r => r.x > 0 && r.y < 0).length,
    "左下": results.filter(r => r.x < 0 && r.y < 0).length,
  };

  const analysis = [];
  for (const [quad, count] of Object.entries(quadrants)) {
    analysis.push(`${quad}象限: ${count}個`);
  }

  return analysis.join(", ");
}

// OpenAI APIクライアントの初期化（APIキーがある場合のみ）
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("OpenAI API key not found. Question generation will be disabled.");
}

interface Question {
  id: string;
  text: string;
  axisWeights: {
    x: number; // -1 to 1
    y: number; // -1 to 1
  };
}

interface Axis {
  id: number;
  name: string;
  description: string;
  positiveName: string;
  negativeName: string;
}

interface Result {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

type QuestionsData = {
  questions: Question[];
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuestionsData | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { theme, resultType, axes, questionCount = 10, results = [] } = req.body;

  if (!theme || typeof theme !== "string") {
    return res.status(400).json({ error: "テーマを正しく指定してください。" });
  }

  if (!resultType || typeof resultType !== "string") {
    return res.status(400).json({ error: "結果タイプを正しく指定してください。" });
  }

  if (!axes || !Array.isArray(axes) || axes.length !== 2) {
    return res.status(400).json({ error: "2つの軸を正しく指定してください。" });
  }

  // OpenAI APIキーが設定されていない場合
  if (!openai) {
    return res.status(400).json({
      error: "OpenAI APIキーが設定されていません。質問生成機能は利用できません。",
    });
  }

  try {
    const xAxis = axes.find((a: Axis) => a.id === 1);
    const yAxis = axes.find((a: Axis) => a.id === 2);

    if (!xAxis || !yAxis) {
      throw new Error("軸の設定が正しくありません。");
    }

    // 結果の分布を分析
    const resultDistribution = analyzeResultDistribution(results);

    // OpenAI APIを使って質問を生成
    const prompt = `あなたは心理診断・適性診断の専門家です。以下の設定に基づいて、診断のための質問を${questionCount}問作成してください。

# 診断設定

## テーマ
${theme}

## 結果タイプ
診断結果として表示するもの: ${resultType}

## 軸設定
### X軸 (横軸): ${xAxis.name}
- 説明: ${xAxis.description}
- 左側 (負の方向): ${xAxis.negativeName}
- 右側 (正の方向): ${xAxis.positiveName}

### Y軸 (縦軸): ${yAxis.name}
- 説明: ${yAxis.description}
- 下側 (負の方向): ${yAxis.negativeName}
- 上側 (正の方向): ${yAxis.positiveName}

## 配置された診断結果（${results.length}個）
${results.map((r: Result) => 
  `- ${r.name} (${r.x.toFixed(1)}, ${r.y.toFixed(1)}): ${r.description}`
).join('\n')}

## 結果分布の分析
${resultDistribution}

# 質問作成のガイドライン

## 結果配置を考慮した質問設計
配置された結果の位置を考慮して、回答者を適切な結果に導く質問を作成してください。
- 結果が密集している領域には、より細かい差別化ができる質問を作成
- 各象限の特徴を明確に区別できる質問を設計

## 質問の種類と軸への影響設計

各質問は以下の影響度パターンのいずれかを持つように設計してください：

1. **X軸重視質問** (axisWeights: x=±0.7~1.0, y=0~±0.3)
   - X軸の特性を強く測定する質問
   
2. **Y軸重視質問** (axisWeights: x=0~±0.3, y=±0.7~1.0)
   - Y軸の特性を強く測定する質問

3. **両軸バランス質問** (axisWeights: x=±0.4~0.6, y=±0.4~0.6)
   - 両方の軸に中程度の影響を与える質問

4. **中立質問** (axisWeights: x=0, y=0)
   - 診断の信頼性を高めるためのベースライン質問

## 質問文の作成原則

- テーマに完全に沿った内容のみを作成
- 具体的で日常的なシチュエーションを含める
- 回答者が自分の行動や考えを振り返れる内容にする
- 価値判断を含まない中立的な表現を使用
- 特定の固有名詞（人名、ブランド名など）は避ける

## 回答システム

- 各質問は5段階のハート評価（1〜5ハート）で回答
- ハート1: 全く当てはまらない（軸の重みが負の方向に強く働く）
- ハート2: あまり当てはまらない（軸の重みが負の方向に働く）
- ハート3: どちらでもない（中立）
- ハート4: やや当てはまる（軸の重みが正の方向に働く）
- ハート5: とても当てはまる（軸の重みが正の方向に強く働く）

# 必須の出力形式

"questions": [
  {
    "id": "q1",
    "text": "具体的で分かりやすい質問文",
    "axisWeights": {
      "x": -0.8,
      "y": 0.2
    }
  },
  ...
]

# 出力
必ず有効なJSONオブジェクトとして出力してください。例外やエラーメッセージを含めず、純粋なJSONのみを出力してください。`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは心理診断・適性診断の専門家です。指定されたテーマと軸設定に基づいて、バランスの取れた質問セットを作成してください。質問は具体的で分かりやすく、回答者が自分の特性を正確に診断できるものにしてください。必ず日本語で回答し、有効なJSONのみを出力してください。",
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

    const parsedContent: QuestionsData = JSON.parse(content);

    if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
      throw new Error("AIが生成したデータの形式が正しくありません。");
    }

    // 各質問に必要なプロパティがあるかチェック
    for (const question of parsedContent.questions) {
      if (!question.text) {
        throw new Error("質問文が不足しています。");
      }
      if (typeof question.axisWeights?.x !== "number" || typeof question.axisWeights?.y !== "number") {
        throw new Error("軸の重み設定が正しくありません。");
      }
    }

    // IDがない場合は生成
    const questionsWithIds = parsedContent.questions.map((q, index) => ({
      ...q,
      id: q.id || `q${index + 1}`,
    }));

    res.status(200).json({ questions: questionsWithIds });
  } catch (error) {
    console.error("AI質問生成エラー:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    res.status(500).json({ 
      error: "質問の生成に失敗しました。", 
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
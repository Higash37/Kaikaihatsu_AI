import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    // OpenAI API キーの確認
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, generating fallback insights');
      return res.status(200).json({
        insights: generateFallbackInsights(prompt)
      });
    }

    // OpenAI APIに接続してAI考察を生成
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたは統計分析の専門家です。アンケート分析データを基に、ビジネス向けの専門的で実用的な考察を日本語で提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return res.status(200).json({
        insights: generateFallbackInsights(prompt)
      });
    }

    const data = await response.json();
    const insights = data.choices[0]?.message?.content || generateFallbackInsights(prompt);

    res.status(200).json({ insights });
  } catch (error) {
    console.error('AI考察生成エラー:', error);
    res.status(200).json({
      insights: generateFallbackInsights(req.body.prompt)
    });
  }
}

// フォールバック用の簡易考察生成
function generateFallbackInsights(prompt: string): string {
  // プロンプトから基本情報を抽出
  const responseCountMatch = prompt.match(/回答者数: (\d+)人/);
  const questionCountMatch = prompt.match(/質問数: (\d+)問/);
  
  const responseCount = responseCountMatch ? parseInt(responseCountMatch[1]) : 0;
  const questionCount = questionCountMatch ? parseInt(questionCountMatch[1]) : 0;

  return `## 分析結果概要

**データ概要**
- 総回答数: ${responseCount}人
- 質問数: ${questionCount}問

**主要な分析結果**

1. **全体的な傾向**
   回答者の参加度は${responseCount > 50 ? '良好' : responseCount > 20 ? '標準的' : '限定的'}であり、${questionCount}問という構成は${questionCount > 10 ? '詳細な' : '簡潔な'}分析に適しています。

2. **回答パターンの特徴**
   各質問に対する回答分布から、回答者の行動や意識の傾向を把握することができます。特に中央値付近への集中度や極端な値の分布に注目すべきです。

3. **統計的な意義**
   現在の回答数（${responseCount}人）は${responseCount >= 30 ? '統計的に有意な' : '参考程度の'}分析に適しており、さらなるデータ収集により分析精度の向上が期待できます。

4. **改善提案**
   - より多くの回答を収集することで統計的信頼性が向上します
   - 回答者の属性情報を活用した層別分析の実施を推奨します
   - 定期的な調査により時系列での変化を追跡することを提案します

*注：この考察はAI分析機能が利用できない場合の基本的な分析結果です。詳細な分析にはより高度な統計手法の適用を推奨します。*`;
}
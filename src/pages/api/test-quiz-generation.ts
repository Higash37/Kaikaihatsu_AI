import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // テスト用のクイズデータを生成
    const testQuiz = {
      id: `test-quiz-${Date.now()}`,
      title: "テストクイズ - プログラミング適性診断",
      description: "プログラミングの適性を診断するテストクイズです",
      creatorId: "test-creator",
      creatorName: "テスト作成者",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questionCount: 5,
      isPublic: true,
      tags: ["プログラミング", "テスト", "適性"],
      totalResponses: 0,
      popularity: 50,
      averageRating: 4.0,
      questions: [
        {
          id: "q1",
          text: "論理的な思考が得意だ。",
          type: "scale",
          required: true,
          order: 1,
        },
        {
          id: "q2",
          text: "新しい技術を学ぶのが好きだ。",
          type: "scale",
          required: true,
          order: 2,
        },
        {
          id: "q3",
          text: "問題解決に時間をかけることができる。",
          type: "scale",
          required: true,
          order: 3,
        },
        {
          id: "q4",
          text: "細かい作業が苦にならない。",
          type: "scale",
          required: true,
          order: 4,
        },
        {
          id: "q5",
          text: "チームで協力して作業するのが好きだ。",
          type: "scale",
          required: true,
          order: 5,
        },
      ],
      enableDemographics: false,
      enableLocationTracking: false,
      enableRating: true,
    };

    console.log("テストクイズ生成:", testQuiz.id);

    res.status(200).json({
      message: "テストクイズが生成されました",
      quiz: testQuiz,
    });
  } catch (error) {
    console.error("テストクイズ生成エラー:", error);
    res.status(500).json({ error: "テストクイズの生成に失敗しました。" });
  }
}

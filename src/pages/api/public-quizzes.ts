import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { getPublicQuizzes } from "@/utils/supabase";

// テスト用のサンプルクイズデータ
const sampleQuizzes: Quiz[] = [
  {
    id: "sample-quiz-1",
    title: "恋愛スタイル診断",
    description: "あなたの恋愛における感情重視度と理性重視度を診断します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 30,
    isPublic: true,
    tags: ["恋愛", "診断", "性格"],
    totalResponses: 150,
    popularity: 85,
    averageRating: 4.2,
    questions: [
      {
        id: "q1",
        text: "自分の直感を信じて行動することが多い。",
        type: "scale",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        text: "相手との関係において、未来のことよりも今のことを考える方だ。",
        type: "scale",
        required: true,
        order: 2,
      },
      {
        id: "q3",
        text: "目の前の気持ちに素直に従うことが大切だと思う。",
        type: "scale",
        required: true,
        order: 3,
      },
      {
        id: "q4",
        text: "相手に対して感情的な共感を求めることが多い。",
        type: "scale",
        required: true,
        order: 4,
      },
      {
        id: "q5",
        text: "感情を抑え込むよりも、素直に表現したいと思う。",
        type: "scale",
        required: true,
        order: 5,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
  {
    id: "sample-quiz-2",
    title: "コミュニケーションスタイル診断",
    description: "あなたのコミュニケーションの特徴を分析します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 25,
    isPublic: true,
    tags: ["コミュニケーション", "診断", "人間関係"],
    totalResponses: 89,
    popularity: 72,
    averageRating: 4.0,
    questions: [
      {
        id: "q1",
        text: "人前で話すことが得意だ。",
        type: "scale",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        text: "相手の話をよく聞く方だ。",
        type: "scale",
        required: true,
        order: 2,
      },
      {
        id: "q3",
        text: "自分の意見をはっきり言う方だ。",
        type: "scale",
        required: true,
        order: 3,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
  {
    id: "sample-quiz-3",
    title: "大学適性診断",
    description: "あなたに最適な大学のタイプを診断します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 20,
    isPublic: true,
    tags: ["大学", "進路", "適性"],
    totalResponses: 234,
    popularity: 95,
    averageRating: 4.5,
    questions: [
      {
        id: "q1",
        text: "研究活動に興味がある。",
        type: "scale",
        required: true,
        order: 1,
      },
      {
        id: "q2",
        text: "実践的なスキルを身につけたい。",
        type: "scale",
        required: true,
        order: 2,
      },
      {
        id: "q3",
        text: "国際的な視野を広げたい。",
        type: "scale",
        required: true,
        order: 3,
      },
      {
        id: "q4",
        text: "少人数での学習を好む。",
        type: "scale",
        required: true,
        order: 4,
      },
      {
        id: "q5",
        text: "就職に有利な大学を選びたい。",
        type: "scale",
        required: true,
        order: 5,
      },
    ],
    enableDemographics: false,
    enableLocationTracking: false,
    enableRating: true,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sort = "popularity", limit = 20 } = req.query;

    console.log("公開クイズ取得開始...");

    // デフォルトでサンプルデータを使用
    let quizzes = [...sampleQuizzes];
    console.log("初期サンプルデータ数:", quizzes.length);

    // Supabaseから公開クイズを取得
    try {
      console.log("Supabaseからデータを取得中...");
      const supabaseQuizzes = await getPublicQuizzes();
      console.log("Supabaseから取得したクイズ数:", supabaseQuizzes.length);

      if (supabaseQuizzes.length > 0) {
        // Supabaseのデータ構造をフロントエンド用に変換
        const convertedQuizzes = supabaseQuizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          creatorId: quiz.user_id,
          creatorName: quiz.profiles?.username || 'Unknown',
          createdAt: quiz.created_at,
          updatedAt: quiz.updated_at,
          questionCount: quiz.questions?.questions?.length || 0,
          isPublic: quiz.is_public,
          tags: quiz.questions?.tags || [],
          totalResponses: 0, // TODO: 統計から取得
          popularity: Math.floor(Math.random() * 100), // TODO: 統計から計算
          averageRating: 4.0, // TODO: 統計から計算
          questions: quiz.questions?.questions || [],
          enableDemographics: quiz.questions?.enableDemographics || false,
          enableLocationTracking: quiz.questions?.enableLocationTracking || false,
          enableRating: quiz.questions?.enableRating || true,
        })) as Quiz[];

        console.log("変換後のクイズデータ:", convertedQuizzes.map(q => ({
          id: q.id,
          title: q.title,
          creatorName: q.creatorName,
          isPublic: q.isPublic,
        })));

        // Supabaseのデータがある場合はそちらを優先
        quizzes = convertedQuizzes;
      } else {
        console.log("Supabaseにデータがないため、サンプルデータを使用");
      }
    } catch (supabaseError) {
      console.log("Supabaseからの取得に失敗、サンプルデータを使用:", supabaseError);
    }

    // ソートはJavaScript側で実行
    if (sort === "popularity") {
      quizzes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      quizzes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // リミット適用
    const limitedQuizzes = quizzes.slice(0, Number(limit));

    console.log(
      `最終的なクイズ数: ${limitedQuizzes.length}件`,
      limitedQuizzes.map((q) => ({
        id: q.id,
        title: q.title,
        creatorName: q.creatorName,
        isPublic: q.isPublic,
        createdAt: q.createdAt,
        totalResponses: q.totalResponses,
      }))
    );

    res.status(200).json({
      quizzes: limitedQuizzes,
      totalCount: limitedQuizzes.length,
      hasMore: limitedQuizzes.length === Number(limit),
    });
  } catch (error) {
    console.error("公開クイズの取得エラー:", error);
    // エラーが発生した場合でもサンプルデータを返す
    res.status(200).json({
      quizzes: sampleQuizzes,
      totalCount: sampleQuizzes.length,
      hasMore: false,
    });
  }
}

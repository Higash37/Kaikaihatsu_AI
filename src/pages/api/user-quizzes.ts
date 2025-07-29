import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { getQuizzes } from "@/utils/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[user-quizzes] API endpoint called with method:", req.method);

  if (req.method !== "GET") {
    console.log("[user-quizzes] Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      console.log("[user-quizzes] Missing or invalid userId:", userId);
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log("[user-quizzes] Fetching quizzes for userId:", userId);

    // ユーザーが作成したクイズを取得
    console.log("[user-quizzes] Executing Supabase query");
    const supabaseQuizzes = await getQuizzes(userId);
    console.log(
      "[user-quizzes] Query completed, quiz count:",
      supabaseQuizzes.length
    );

    // Supabaseのデータ構造をフロントエンド用に変換
    const quizzes = supabaseQuizzes.map((quiz: any) => {
      console.log(
        "[user-quizzes] Processing quiz:",
        quiz.id,
        "title:",
        quiz.title
      );
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        creatorId: quiz.user_id,
        creatorName: 'You', // ユーザー自身の作成なので
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        questionCount: quiz.questions?.questions?.length || 0,
        isPublic: quiz.is_public,
        tags: quiz.questions?.tags || [],
        totalResponses: 0, // TODO: 統計から取得
        popularity: 0, // TODO: 統計から計算
        averageRating: 0, // TODO: 統計から計算
        questions: quiz.questions?.questions || [],
        enableDemographics: quiz.questions?.enableDemographics || false,
        enableLocationTracking: quiz.questions?.enableLocationTracking || false,
        enableRating: quiz.questions?.enableRating || true,
      };
    }) as Quiz[];

    // Sort by createdAt in descending order
    quizzes.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    console.log("[user-quizzes] Returning", quizzes.length, "quizzes");
    res.status(200).json({
      quizzes,
      totalCount: quizzes.length,
    });
  } catch (error) {
    console.error("[user-quizzes] Error fetching user quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";

import { Quiz } from "@/types/quiz";
import { getQuiz, getQuizResponses } from "@/utils/supabase";
import { supabase } from "@/utils/supabase";

// サンプルクイズデータ
const sampleQuizzes: Quiz[] = [
  {
    id: "sample-quiz-1",
    title: "恋愛スタイル診断",
    description: "あなたの恋愛における感情重視度と理性重視度を診断します",
    creatorId: "sample-creator",
    creatorName: "サンプル作成者",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questionCount: 5,
    isPublic: true,
    tags: ["恋愛", "診断", "性格"],
    totalResponses: 150,
    popularity: 85,
    averageRating: 4.2,
    axes: [
      { 
        id: 1, 
        name: "感情性", 
        description: "感情的な判断と理性的な判断の傾向",
        positiveName: "Emotional Style",
        negativeName: "Logical Style"
      },
      { 
        id: 2, 
        name: "直感性", 
        description: "直感的な行動と慎重な判断の傾向",
        positiveName: "Aggressive Play",
        negativeName: "Innovative Flair"
      },
    ],
    questions: [
      {
        id: "q1",
        text: "自分の直感を信じて行動することが多い。",
        type: "scale",
        required: true,
        order: 1,
        axisId: 2,
      },
      {
        id: "q2",
        text: "相手との関係において、未来のことよりも今のことを考える方だ。",
        type: "scale",
        required: true,
        order: 2,
        axisId: 1,
      },
      {
        id: "q3",
        text: "目の前の気持ちに素直に従うことが大切だと思う。",
        type: "scale",
        required: true,
        order: 3,
        axisId: 1,
      },
      {
        id: "q4",
        text: "決断する前にじっくりと考える方だ。",
        type: "scale",
        required: true,
        order: 4,
        axisId: 2,
      },
      {
        id: "q5",
        text: "論理的に分析してから判断することが多い。",
        type: "scale",
        required: true,
        order: 5,
        axisId: 1,
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
    axes: [
      { 
        id: 1, 
        name: "表現力", 
        description: "コミュニケーションの積極性",
        positiveName: "Active Communication",
        negativeName: "Thoughtful Listening"
      },
      { 
        id: 2, 
        name: "対話スタイル", 
        description: "相手との関わり方",
        positiveName: "Direct Expression",
        negativeName: "Empathetic Response"
      },
    ],
    questions: [
      {
        id: "q1",
        text: "人前で話すことが得意だ。",
        type: "scale",
        required: true,
        order: 1,
        axisId: 1,
      },
      {
        id: "q2",
        text: "相手の話をよく聞く方だ。",
        type: "scale",
        required: true,
        order: 2,
        axisId: 2,
      },
      {
        id: "q3",
        text: "自分の意見をはっきり言う方だ。",
        type: "scale",
        required: true,
        order: 3,
        axisId: 1,
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
    axes: [
      { 
        id: 1, 
        name: "学習アプローチ", 
        description: "理論と実践のバランス",
        positiveName: "Research Focus",
        negativeName: "Practical Skills"
      },
      { 
        id: 2, 
        name: "環境選好", 
        description: "学習環境の好み",
        positiveName: "Global Perspective",
        negativeName: "Career Oriented"
      },
    ],
    questions: [
      {
        id: "q1",
        text: "研究活動に興味がある。",
        type: "scale",
        required: true,
        order: 1,
        axisId: 1,
      },
      {
        id: "q2",
        text: "実践的なスキルを身につけたい。",
        type: "scale",
        required: true,
        order: 2,
        axisId: 1,
      },
      {
        id: "q3",
        text: "国際的な視野を広げたい。",
        type: "scale",
        required: true,
        order: 3,
        axisId: 2,
      },
      {
        id: "q4",
        text: "少人数での学習を好む。",
        type: "scale",
        required: true,
        order: 4,
        axisId: 2,
      },
      {
        id: "q5",
        text: "就職に有利な大学を選びたい。",
        type: "scale",
        required: true,
        order: 5,
        axisId: 2,
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
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Quiz ID is required" });
  }

  if (req.method === "GET") {
    try {
      console.log(`クイズ取得開始: ${id}`);

      let quiz: Quiz | null = null;

      // Supabaseからクイズを取得
      try {
        const supabaseQuiz = await getQuiz(id);
        if (supabaseQuiz) {
          // Supabaseのデータ構造を既存の Quiz 型に変換
          quiz = {
            id: supabaseQuiz.id,
            title: supabaseQuiz.title,
            description: supabaseQuiz.description || "",
            creatorId: supabaseQuiz.user_id,
            creatorName: "Unknown", // プロファイル情報から取得が必要
            createdAt: supabaseQuiz.created_at,
            updatedAt: supabaseQuiz.updated_at,
            questionCount: supabaseQuiz.questions?.questions?.length || 0,
            isPublic: supabaseQuiz.is_public,
            tags: [],
            totalResponses: 0, // 別途計算が必要
            popularity: 0,
            averageRating: 0,
            axes: supabaseQuiz.questions?.axes || [],
            questions: supabaseQuiz.questions?.questions || [],
            enableDemographics: false,
            enableLocationTracking: false,
            enableRating: true,
          };
          console.log("Supabaseからクイズを取得:", quiz.id);
        } else {
          console.log("Supabaseにクイズが見つかりません:", id);
        }
      } catch (supabaseError) {
        console.log("Supabaseからの取得に失敗:", supabaseError);
      }

      // Supabaseから取得できない場合はサンプルデータから検索
      if (!quiz) {
        console.log("サンプルデータから検索中...");
        quiz = sampleQuizzes.find((q) => q.id === id) || null;
        if (quiz) {
          console.log("サンプルデータからクイズを取得:", quiz.id);
        } else {
          console.log("サンプルデータにもクイズが見つかりません:", id);
        }
      }

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.status(200).json(quiz);
    } catch (error) {
      console.error("クイズの取得エラー:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    try {
      const updateData = req.body;
      
      // 権限チェック（簡易版）
      const existingQuiz = await getQuiz(id);
      if (!existingQuiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      // TODO: 実際の認証システムと連携して権限チェックを行う
      
      // クイズを更新
      const { error } = await supabase
        .from('quizzes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      res.status(200).json({ message: "Quiz updated successfully" });
    } catch (error) {
      console.error("クイズの更新エラー:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      // 関連する診断結果を削除
      const responses = await getQuizResponses(id);
      if (responses.length > 0) {
        const { error: deleteResponsesError } = await supabase
          .from('diagnoses')
          .delete()
          .eq('quiz_id', id);
        
        if (deleteResponsesError) throw deleteResponsesError;
      }

      // クイズを削除
      const { error: deleteQuizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (deleteQuizError) throw deleteQuizError;

      res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("クイズの削除エラー:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

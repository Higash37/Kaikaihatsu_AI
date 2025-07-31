// Supabase database utilities
import { createClient } from '@supabase/supabase-js';

import { getUserId } from './auth';

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("[supabase] Environment check:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length || 0
});

// クライアントサイド用（制限あり）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（フル権限）
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // フォールバック

// Check if Supabase is properly configured
const isSupabaseAvailable = () => {
  return supabaseUrl && supabaseAnonKey;
};

// Quiz results functions
export async function saveQuizResult(quizData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping save");
    return "sample-result-id";
  }

  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .insert([{
        user_id: getUserId(), // 常にデフォルトユーザーIDを使用
        quiz_id: quizData.quizId,
        result_data: quizData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    console.log("Quiz result saved with ID: ", data.id);
    return data.id;
  } catch (error) {
    console.error("Error saving quiz result: ", error);
    throw error;
  }
}

// Get all quiz results
export async function getAllQuizResults() {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting quiz results: ", error);
    throw error;
  }
}

// Get specific quiz result
export async function getQuizResult(id: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning null");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error("No such document!");
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting quiz result: ", error);
    throw error;
  }
}

// Update quiz result
export async function updateQuizResult(id: string, updateData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping update");
    return;
  }

  try {
    const { error } = await supabase
      .from('diagnoses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    console.log("Quiz result updated with ID: ", id);
  } catch (error) {
    console.error("Error updating quiz result: ", error);
    throw error;
  }
}

// Quiz functions
export async function getQuizById(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning mock data");
    return {
      id: quizId,
      title: "Mock Quiz",
      questions: {
        questions: [],
        axes: [],
        results: []
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching quiz: ", error);
    throw error;
  }
}

// User profile functions
export async function createUserProfile(userId: string, userData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping user creation");
    return userId;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: userData.username,
        email: userData.email,
        bio: userData.bio,
        avatar_url: userData.avatar_url,
        is_public: userData.is_public !== false,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    console.log("User profile created with ID: ", userId);
    return userId;
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning null");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updateData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping user update");
    return;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
    console.log("User profile updated with ID: ", userId);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
}

// Quiz management functions
export async function createQuiz(quizData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping quiz creation");
    return "sample-quiz-id";
  }

  try {
    // サーバーサイドではadminクライアントを使用してRLSをバイパス
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('quizzes')
      .insert([{
        user_id: quizData.userId || getUserId(), // quizData.userIdを優先、なければデフォルトユーザーID
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        difficulty: quizData.difficulty || 'medium',
        is_public: quizData.isPublic || false,
        questions: quizData.questions,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    console.log("Quiz created with ID: ", data.id);
    return data.id;
  } catch (error) {
    console.error("Error creating quiz: ", error);
    throw error;
  }
}

// Get quiz response statistics
export async function getQuizStats(quizId: string) {
  if (!isSupabaseAvailable()) {
    return {
      totalResponses: 0,
      completedResponses: 0,
      inProgressResponses: 0
    };
  }

  try {
    // Get total responses count
    const { count: totalCount, error: totalError } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);
    
    if (totalError) throw totalError;

    // Get completed responses count
    const { count: completedCount, error: completedError } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId)
      .not('completed_at', 'is', null);
    
    if (completedError) throw completedError;

    const totalResponses = totalCount || 0;
    const completedResponses = completedCount || 0;
    const inProgressResponses = totalResponses - completedResponses;

    return {
      totalResponses,
      completedResponses,
      inProgressResponses
    };
  } catch (error) {
    console.error('Error getting quiz stats:', error);
    return {
      totalResponses: 0,
      completedResponses: 0,
      inProgressResponses: 0
    };
  }
}

// Get quizzes with response statistics
export async function getQuizzesWithStats(userId?: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    console.log("[getQuizzesWithStats] Starting query for userId:", userId);
    
    // サーバーサイドではadminクライアントを使用
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    
    let query = client
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error("[getQuizzesWithStats] Supabase query error:", error);
      throw error;
    }
    
    if (!quizzes) {
      console.log("[getQuizzesWithStats] No quizzes found");
      return [];
    }

    console.log("[getQuizzesWithStats] Found", quizzes.length, "quizzes");

    // Get statistics for each quiz in parallel
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        try {
          const stats = await getQuizStats(quiz.id);
          return {
            ...quiz,
            totalResponses: stats.totalResponses,
            completedResponses: stats.completedResponses,
            inProgressResponses: stats.inProgressResponses
          };
        } catch (statsError) {
          console.error("[getQuizzesWithStats] Error getting stats for quiz", quiz.id, ":", statsError);
          // エラーが発生してもクイズ自体は返す
          return {
            ...quiz,
            totalResponses: 0,
            completedResponses: 0,
            inProgressResponses: 0
          };
        }
      })
    );

    return quizzesWithStats;
  } catch (error) {
    console.error("[getQuizzesWithStats] Error getting quizzes with stats: ", error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function getQuizzes(userId?: string) {
  return getQuizzesWithStats(userId);
}

// Get a specific quiz with statistics
export async function getQuizWithStats(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning null");
    return null;
  }

  try {
    // まずUUIDとして検索
    let { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    // UUIDで見つからない場合は、Firebase IDとして検索
    if (error && error.code === 'PGRST116') {
      console.log(`UUID検索失敗、Firebase ID検索中: ${quizId}`);
      const { data: firebaseData, error: firebaseError } = await supabase
        .from('quizzes')
        .select('*')
        .contains('questions', { firebase_id: quizId })
        .single();

      if (firebaseError && firebaseError.code === 'PGRST116') {
        throw new Error("Quiz not found!");
      } else if (firebaseError) {
        throw firebaseError;
      }

      data = firebaseData;
      error = null;
    } else if (error) {
      throw error;
    }

    if (!data) return null;

    // Get statistics for this quiz
    const stats = await getQuizStats(data.id);
    
    return {
      ...data,
      totalResponses: stats.totalResponses,
      completedResponses: stats.completedResponses,
      inProgressResponses: stats.inProgressResponses
    };
  } catch (error) {
    console.error("Error getting quiz with stats: ", error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function getQuiz(quizId: string) {
  return getQuizWithStats(quizId);
}

// Get public quizzes with statistics
export async function getPublicQuizzesWithStats() {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!quizzes) return [];

    // Get statistics for each quiz in parallel
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const stats = await getQuizStats(quiz.id);
        return {
          ...quiz,
          totalResponses: stats.totalResponses,
          completedResponses: stats.completedResponses,
          inProgressResponses: stats.inProgressResponses
        };
      })
    );

    return quizzesWithStats;
  } catch (error) {
    console.error("Error getting public quizzes with stats: ", error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function getPublicQuizzes() {
  return getPublicQuizzesWithStats();
}

// Save quiz response
export async function saveQuizResponse(responseData: any) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping save");
    return "sample-response-id";
  }

  try {
    // サーバーサイドではadminクライアントを使用してRLSをバイパス
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('diagnoses')
      .insert([{
        user_id: responseData.userId || getUserId(), // デフォルトユーザーIDを使用
        quiz_id: responseData.quizId,
        responses: responseData.responses,
        result_data: responseData.result,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    console.log("Quiz response saved with ID: ", data.id);
    return data.id;
  } catch (error) {
    console.error("Error saving quiz response: ", error);
    throw error;
  }
}

// Get quiz responses for analytics
export async function getQuizResponses(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting quiz responses: ", error);
    throw error;
  }
}

// === 通知機能 ===

// 通知を取得
export async function getNotifications(userId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting notifications: ", error);
    throw error;
  }
}

// 通知を既読にする
export async function markNotificationAsRead(notificationId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping mark as read");
    return;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking notification as read: ", error);
    throw error;
  }
}

// 全ての通知を既読にする
export async function markAllNotificationsAsRead(userId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping mark all as read");
    return;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error("Error marking all notifications as read: ", error);
    throw error;
  }
}

// === フォロー機能 ===

// ユーザーをフォロー
export async function followUser(followerId: string, followingId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping follow");
    return;
  }

  try {
    const { error } = await supabase
      .from('follows')
      .insert([{
        follower_id: followerId,
        following_id: followingId,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error("Error following user: ", error);
    throw error;
  }
}

// ユーザーのフォローを解除
export async function unfollowUser(followerId: string, followingId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping unfollow");
    return;
  }

  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  } catch (error) {
    console.error("Error unfollowing user: ", error);
    throw error;
  }
}

// フォロー状態を確認
export async function getFollowStatus(followerId: string, followingId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning false");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error("Error getting follow status: ", error);
    return false;
  }
}

// === いいね機能 ===

// クイズにいいね
export async function likeQuiz(userId: string, quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping like");
    return;
  }

  try {
    const { error } = await supabase
      .from('quiz_likes')
      .insert([{
        user_id: userId,
        quiz_id: quizId,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error("Error liking quiz: ", error);
    throw error;
  }
}

// クイズのいいねを取り消し
export async function unlikeQuiz(userId: string, quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping unlike");
    return;
  }

  try {
    const { error } = await supabase
      .from('quiz_likes')
      .delete()
      .eq('user_id', userId)
      .eq('quiz_id', quizId);

    if (error) throw error;
  } catch (error) {
    console.error("Error unliking quiz: ", error);
    throw error;
  }
}

// いいね状態を確認
export async function getLikeStatus(userId: string, quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning false");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('quiz_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error("Error getting like status: ", error);
    return false;
  }
}

// クイズのいいね数を取得
export async function getQuizLikeCount(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning 0");
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('quiz_likes')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting quiz like count: ", error);
    return 0;
  }
}

// === コメント機能 ===

// クイズにコメント追加
export async function addQuizComment(userId: string, quizId: string, comment: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, skipping comment");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('quiz_comments')
      .insert([{
        user_id: userId,
        quiz_id: quizId,
        comment: comment,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding quiz comment: ", error);
    throw error;
  }
}

// クイズのコメントを取得
export async function getQuizComments(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('quiz_comments')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting quiz comments: ", error);
    throw error;
  }
}

// === 統計・分析機能 ===

// クイズの詳細統計を取得
export async function getQuizDetailedStats(quizId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty stats");
    return {
      totalResponses: 0,
      averageScore: 0,
      completionRate: 0,
      responses: [],
    };
  }

  try {
    // 基本統計
    const { data: responses, error: responsesError } = await supabase
      .from('diagnoses')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (responsesError) throw responsesError;

    // 統計の更新または作成
    const stats = {
      totalResponses: responses?.length || 0,
      averageScore: 0,
      completionRate: 0,
    };

    if (responses && responses.length > 0) {
      const scoresWithValue = responses.filter(r => r.result_data?.score != null);
      if (scoresWithValue.length > 0) {
        stats.averageScore = scoresWithValue.reduce((sum, r) => sum + r.result_data.score, 0) / scoresWithValue.length;
      }

      const completedResponses = responses.filter(r => r.completed_at);
      stats.completionRate = (completedResponses.length / responses.length) * 100;
    }

    // 統計テーブルを更新
    const { error: updateError } = await supabase
      .from('quiz_statistics')
      .upsert({
        quiz_id: quizId,
        total_attempts: stats.totalResponses,
        average_score: stats.averageScore,
        completion_rate: stats.completionRate,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error("Error updating quiz statistics:", updateError);
    }

    return {
      ...stats,
      responses: responses || [],
    };
  } catch (error) {
    console.error("Error getting quiz detailed stats: ", error);
    throw error;
  }
}

// ユーザーの統計データを取得
export async function getUserStats(userId: string) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty stats");
    return {
      quizzesCreated: 0,
      quizzesTaken: 0,
      totalScore: 0,
      averageScore: 0,
      followers: 0,
      following: 0,
      likes: 0,
    };
  }

  try {
    // 作成したクイズ数
    const { count: quizzesCreated } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 回答したクイズ数
    const { count: quizzesTaken } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // スコア統計
    const { data: scores } = await supabase
      .from('diagnoses')
      .select('result_data')
      .eq('user_id', userId)
      .not('result_data->score', 'is', null);

    const totalScore = scores?.reduce((sum, item) => sum + (item.result_data?.score || 0), 0) || 0;
    const averageScore = scores && scores.length > 0 ? totalScore / scores.length : 0;

    // フォロワー数
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // フォロー数
    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // いいね数（受け取った）
    const { count: likes } = await supabase
      .from('quiz_likes')
      .select(`
        quiz_id,
        quizzes!inner (
          user_id
        )
      `, { count: 'exact', head: true })
      .eq('quizzes.user_id', userId);

    return {
      quizzesCreated: quizzesCreated || 0,
      quizzesTaken: quizzesTaken || 0,
      totalScore,
      averageScore,
      followers: followers || 0,
      following: following || 0,
      likes: likes || 0,
    };
  } catch (error) {
    console.error("Error getting user stats: ", error);
    throw error;
  }
}

// 期間別の統計データを取得
export async function getTimePeriodStats(
  quizId: string, 
  startDate: string, 
  endDate: string
) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('quiz_id', quizId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting time period stats: ", error);
    throw error;
  }
}

// 比較分析用データを取得
export async function getComparisonStats(quizIds: string[]) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('quiz_statistics')
      .select(`
        *,
        quizzes (
          title,
          description,
          created_at
        )
      `)
      .in('quiz_id', quizIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting comparison stats: ", error);
    throw error;
  }
}

// 高度な分析用のカスタムクエリ
export async function getAdvancedAnalytics(
  quizId: string,
  analysisType: 'demographic' | 'temporal' | 'correlation'
) {
  if (!isSupabaseAvailable()) {
    console.warn("Supabase not available, returning empty data");
    return null;
  }

  try {
    switch (analysisType) {
      case 'demographic': {
        // 人口統計学的分析
        const { data: demographicData } = await supabase
          .from('diagnoses')
          .select('responses, result_data')
          .eq('quiz_id', quizId);

        return demographicData;
      }

      case 'temporal': {
        // 時系列分析
        const { data: temporalData } = await supabase
          .from('diagnoses')
          .select('created_at, result_data, completed_at')
          .eq('quiz_id', quizId)
          .order('created_at', { ascending: true });

        return temporalData;
      }

      case 'correlation': {
        // 相関分析
        const { data: correlationData } = await supabase
          .from('diagnoses')
          .select('responses, result_data')
          .eq('quiz_id', quizId);

        return correlationData;
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("Error getting advanced analytics: ", error);
    throw error;
  }
}
-- Row Level Security (RLS) ポリシー

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profilesテーブルのポリシー
-- ユーザーは自分のプロファイルのみ更新可能
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 公開プロファイルは誰でも閲覧可能
CREATE POLICY "Public profiles are viewable" 
  ON profiles FOR SELECT 
  USING (is_public = true);

-- Quizzesテーブルのポリシー
-- ユーザーは自分のクイズを管理可能
CREATE POLICY "Users can create own quizzes" 
  ON quizzes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quizzes" 
  ON quizzes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" 
  ON quizzes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" 
  ON quizzes FOR DELETE 
  USING (auth.uid() = user_id);

-- 公開クイズは誰でも閲覧可能
CREATE POLICY "Public quizzes are viewable" 
  ON quizzes FOR SELECT 
  USING (is_public = true);

-- Diagnosesテーブルのポリシー
-- ユーザーは自分の診断結果のみアクセス可能
CREATE POLICY "Users can create own diagnoses" 
  ON diagnoses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnoses" 
  ON diagnoses FOR SELECT 
  USING (auth.uid() = user_id);

-- クイズ作成者は統計のために診断数を確認可能（個人情報は除く）
CREATE POLICY "Quiz creators can view diagnosis count" 
  ON diagnoses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = diagnoses.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );

-- Quiz Statisticsテーブルのポリシー
-- 統計は誰でも閲覧可能
CREATE POLICY "Statistics are publicly viewable" 
  ON quiz_statistics FOR SELECT 
  USING (true);

-- 統計の更新はシステムのみ（サービスロールキー使用）
-- クライアントからの直接更新は不可

-- Audit Logsテーブルのポリシー
-- 監査ログは管理者のみ閲覧可能（将来の実装用）
-- 現時点では全てのポリシーをDENYに設定
CREATE POLICY "Audit logs are admin only" 
  ON audit_logs FOR ALL 
  USING (false);

-- 新しいテーブルのRLS有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_comments ENABLE ROW LEVEL SECURITY;

-- Notificationsテーブルのポリシー
-- ユーザーは自分の通知のみアクセス可能
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Followsテーブルのポリシー
-- ユーザーは自分のフォロー関係を管理可能
CREATE POLICY "Users can create follows" 
  ON follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can view their follows" 
  ON follows FOR SELECT 
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can delete their follows" 
  ON follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- Quiz Likesテーブルのポリシー
-- ユーザーは自分のいいねを管理可能
CREATE POLICY "Users can create likes" 
  ON quiz_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view likes" 
  ON quiz_likes FOR SELECT 
  USING (true); -- いいねは公開情報

CREATE POLICY "Users can delete own likes" 
  ON quiz_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Quiz Commentsテーブルのポリシー
-- 認証ユーザーはコメント作成可能、誰でも閲覧可能
CREATE POLICY "Authenticated users can create comments" 
  ON quiz_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments are publicly viewable" 
  ON quiz_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own comments" 
  ON quiz_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON quiz_comments FOR DELETE 
  USING (auth.uid() = user_id);
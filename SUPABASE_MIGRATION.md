# Firebase → Supabase 移行ガイド

## 📋 移行の概要

このドキュメントはFirebaseからSupabaseへのバックエンド移行に関する情報をまとめています。フロントエンドとAI機能はそのまま維持し、バックエンドのみを移行しています。

## 🎯 移行の目標

- **既存機能の維持**: AIとフロントエンドは変更なし
- **通知機能の追加**: Supabaseの機能を活用
- **スケーラビリティの向上**: PostgreSQLベースの高性能DB
- **セキュリティの強化**: Row Level Security (RLS)
- **開発効率の向上**: よりモダンなAPIとツール

## 📊 データベース設計

### 主要テーブル

1. **profiles** - ユーザープロファイル
2. **quizzes** - クイズデータ  
3. **diagnoses** - 診断結果/回答データ
4. **notifications** - 通知機能（新機能）
5. **follows** - フォロー機能（新機能）
6. **quiz_likes** - いいね機能（新機能）
7. **quiz_comments** - コメント機能（新機能）
8. **quiz_statistics** - 統計データ
9. **audit_logs** - 監査ログ

### スキーマファイル

- `supabase/schema.sql` - メインスキーマ
- `supabase/rls-policies.sql` - セキュリティポリシー

## 🔧 セットアップ手順

### 1. 環境変数の設定

`.env.local`に以下を追加：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase設定（移行用）
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

### 2. Supabaseスキーマの設定

```bash
# 接続テスト
node scripts/setup-supabase-schema.js --test

# スキーマ適用（手動でSupabaseダッシュボードから実行推奨）
node scripts/setup-supabase-schema.js --setup
```

### 3. データ移行の実行

```bash
# 移行前のバックアップ作成
# Firebaseコンソールからデータをエクスポート

# 移行実行
node scripts/migrate-firebase-to-supabase.js --confirm

# データ確認
node scripts/check-supabase-data.js
```

## 🚀 新機能

### 通知システム

```javascript
import { getNotifications, markNotificationAsRead } from '@/utils/supabase';

// 通知取得
const notifications = await getNotifications(userId);

// 既読マーク
await markNotificationAsRead(notificationId);
```

### フォロー機能

```javascript
import { followUser, unfollowUser, getFollowStatus } from '@/utils/supabase';

// フォロー
await followUser(followerId, followingId);

// アンフォロー
await unfollowUser(followerId, followingId);

// フォロー状態確認
const isFollowing = await getFollowStatus(followerId, followingId);
```

### いいね・コメント機能

```javascript
import { 
  likeQuiz, 
  unlikeQuiz, 
  addQuizComment, 
  getQuizComments 
} from '@/utils/supabase';

// いいね
await likeQuiz(userId, quizId);

// コメント追加
await addQuizComment(userId, quizId, comment);

// コメント取得
const comments = await getQuizComments(quizId);
```

## 🔄 移行済みAPI

### 認証API
- `src/pages/api/auth/login.ts` - Supabase Auth
- `src/pages/api/auth/signup.ts` - Supabase Auth

### データAPI  
- `src/pages/api/save-diagnosis.ts` - Supabase
- `src/pages/api/get-diagnosis.ts` - Supabase
- `src/pages/api/public-quizzes.ts` - Supabase
- `src/pages/api/user-quizzes.ts` - Supabase

## 🔒 セキュリティ

### Row Level Security (RLS)

- ユーザーは自分のデータのみアクセス可能
- 公開クイズは誰でも閲覧可能
- 管理者のみ監査ログにアクセス可能

### 認証の変更点

- Firebase Auth → Supabase Auth
- ユーザー名ベース → メールベース認証
- より強固なセッション管理

## 📱 フロントエンド連携

### AuthContext

```javascript
import { useAuth } from '@/contexts/SupabaseAuthContext';

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth();
  // ...
}
```

### データ取得

```javascript
import { supabase } from '@/utils/supabase';

// リアルタイム更新
const subscription = supabase
  .channel('quiz-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'quizzes'
  }, (payload) => {
    console.log('新しいクイズ:', payload.new);
  })
  .subscribe();
```

## 🧪 テスト

### データ確認

```bash
# Supabaseデータの確認
node scripts/check-supabase-data.js

# 特定テーブルの確認
node scripts/check-supabase-data.js --table=profiles
```

### 機能テスト

1. ユーザー登録・ログイン
2. クイズ作成・回答
3. 通知機能
4. フォロー機能
5. いいね・コメント機能

## 🚨 注意事項

### 移行前

- Firebaseデータのバックアップ作成
- 環境変数の設定確認
- Supabaseプロジェクトの準備

### 移行後

- 既存ユーザーへの通知
- パスワードリセットの案内
- 機能テストの実施

## 📈 パフォーマンス最適化

### インデックス

主要なクエリに対してインデックスを作成済み：

- `idx_quizzes_user_id` - ユーザー別クイズ
- `idx_quizzes_is_public` - 公開クイズ
- `idx_diagnoses_user_id` - ユーザー別診断
- `idx_notifications_user_id` - ユーザー別通知

### キャッシュ戦略

- 公開クイズのキャッシュ
- 統計データのキャッシュ
- ユーザープロファイルのキャッシュ

## 🛠️ トラブルシューティング

### よくある問題

1. **認証エラー**
   - 環境変数の確認
   - Supabaseの設定確認

2. **データ移行エラー**
   - 権限の確認
   - ネットワーク接続の確認

3. **RLSエラー**
   - ポリシーの確認
   - 認証状態の確認

## 📞 サポート

移行に関する問題やご質問は以下まで：

- 開発チーム内での相談
- Supabaseドキュメント参照
- コミュニティフォーラム活用

---

**移行日**: 2025年1月

**バージョン**: v2.0 (Supabase版)

**ステータス**: 🚧 移行中 → ✅ 完了予定
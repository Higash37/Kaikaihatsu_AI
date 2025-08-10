# 🎯 Kaikaihatsu AI - AIクイズ診断プラットフォーム

> **Modern AI-Powered Quiz Platform** - Next.js + TypeScript + Supabase

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![DB](https://img.shields.io/badge/DB-Supabase-green?logo=supabase)](https://supabase.com)
[![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Anthropic-blue)](https://openai.com)

## 🚀 プロジェクト概要

AIを活用した4軸診断クイズプラットフォーム。座標系による結果配置とハート評価システムで、直感的で高度な診断体験を提供。

### 🎯 核心機能
- **AIクイズ生成**: OpenAI/Anthropic APIによる自動質問・結果生成
- **4軸診断システム**: 座標グラフでの結果配置とドラッグ&ドロップ編集
- **リアルタイム分析**: Chart.js/D3.jsによる高度な統計ビジュアライゼーション
- **PWA対応**: オフライン機能とモバイル最適化

## 🛠️ 技術スタック

### フロントエンド（Modern React Ecosystem）
```typescript
Next.js 14.2    // App Router + RSC
TypeScript 5.1  // 型安全性
Material-UI v6  // コンポーネントライブラリ  
Tailwind CSS    // ユーティリティファースト
Framer Motion   // 高性能アニメーション
```

### バックエンド（Serverless + Edge）
```typescript
Next.js API     // サーバーレス関数
Supabase        // BaaS (PostgreSQL + Auth + RLS)
OpenAI/Claude   // AI API統合
Vercel Edge     // エッジコンピューティング
```

### DevOps（モダン開発環境）
```bash
ESLint + Prettier  # コード品質
TypeScript         # 型チェック
Git Hooks          # コミット前検証
Vercel CI/CD       # 自動デプロイ
```

## ⚡ クイックスタート

### 1. 環境セットアップ
```bash
# リポジトリクローン
git clone https://github.com/yourusername/kaikaihatsu_ai.git
cd kaikaihatsu_ai

# 依存関係インストール（推奨: Node.js 18+）
npm install

# 環境変数設定
cp .env.example .env.local
```

### 2. 必須環境変数
```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI APIs (いずれか必須)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. データベース初期化
```bash
# Supabaseスキーマ適用
npm run supabase:setup

# 接続テスト
npm run supabase:test
```

### 4. 開発サーバー起動
```bash
npm run dev
# → http://localhost:3000
```

## 🏗️ アーキテクチャ設計

### プロジェクト構造（ドメイン駆動設計）
```
src/
├── components/           # UI コンポーネント層
│   ├── quiz/            # クイズ関連コンポーネント
│   ├── analytics/       # 分析関連コンポーネント
│   └── common/          # 共通コンポーネント
├── pages/               # ルーティング層 (Next.js Pages Router)
│   ├── api/            # API エンドポイント
│   ├── quiz/           # クイズ関連ページ
│   └── analytics/      # 分析関連ページ
├── lib/                # 外部ライブラリ設定
│   ├── supabase/       # Supabase クライアント
│   └── ai/             # AI API クライアント
├── utils/              # ビジネスロジック・ユーティリティ
│   ├── database/       # DB操作
│   ├── validation/     # 入力検証
│   └── export/         # データエクスポート
└── types/              # TypeScript型定義
    ├── quiz.type.ts    # クイズ関連型
    ├── user.type.ts    # ユーザー関連型
    └── common.type.ts  # 共通型
```

### 核心設計思想
- **1ファイル1責務**: 単一責任の原則を徹底
- **型安全性**: TypeScript first による開発時エラー防止
- **コンポーネント分離**: UI/Logic/Data の明確な責務分離
- **パフォーマンス最適化**: SSR + Static Generation の適切な使い分け

## 🔄 開発ワークフロー

### ブランチ戦略（Git Flow）
```bash
main        # 本番環境（自動デプロイ）
develop     # 開発統合ブランチ
feature/*   # 機能開発ブランチ
hotfix/*    # 緊急修正ブランチ
```

### 品質保証フロー
```bash
# 1. コード品質チェック
npm run lint        # ESLint実行
npm run type-check  # TypeScript型チェック
npm run format      # Prettier自動整形

# 2. テスト実行
npm run test        # Unit Test
npm run test:e2e    # E2E Test

# 3. ビルド検証
npm run build       # プロダクションビルド
npm run start       # プロダクション起動テスト
```

## 📊 データベース設計

### 主要エンティティ（Supabase PostgreSQL）
```sql
-- ユーザープロファイル
profiles (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  username VARCHAR,
  created_at TIMESTAMP
);

-- クイズメタデータ
quizzes (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  theme VARCHAR,
  axis_config JSONB,     -- 4軸設定
  results JSONB,         -- 結果配置データ
  questions JSONB,       -- 質問データ
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES profiles(id)
);

-- 診断結果
diagnoses (
  id UUID PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES profiles(id),
  answers JSONB,         -- 回答データ
  coordinates JSONB,     -- 診断座標結果
  result_name VARCHAR,   -- マッチした結果名
  created_at TIMESTAMP
);
```

### セキュリティ（Row Level Security）
```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_policy ON profiles 
  FOR ALL TO authenticated USING (auth.uid() = id);

-- 公開クイズは全員閲覧可、作成者のみ編集可
CREATE POLICY quizzes_select ON quizzes 
  FOR SELECT USING (is_public OR user_id = auth.uid());
CREATE POLICY quizzes_update ON quizzes 
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

## 🎨 UI/UXデザイン原則

### デザインシステム
- **カラーパレット**: iOS System Colors ベース（#007AFF プライマリ）
- **タイポグラフィ**: Zen Maru Gothic（日本語） + SF Pro Display（英語）
- **コンポーネント**: Material Design v3 準拠
- **アニメーション**: 60fps滑らか・意味のある動き

### アクセシビリティ（WCAG 2.1 AA準拠）
- セマンティックHTML使用
- キーボードナビゲーション対応
- スクリーンリーダー最適化
- 高コントラスト対応

## 🚀 デプロイメント

### 本番環境（Vercel）
```bash
# 自動デプロイ（main ブランチ）
git push origin main

# 手動デプロイ
npx vercel --prod

# 環境変数確認
npx vercel env ls
```

### パフォーマンス最適化
- **Next.js Image**: 自動画像最適化
- **Code Splitting**: ルート別バンドル分割
- **Edge Functions**: 地理的分散実行
- **CDN**: 静的アセット高速配信

## 🔧 ベストプラクティスへの道のり

### Phase 1: 基盤修正 ✅
- [x] ESLint/TypeScript設定最適化
- [x] セキュリティ問題修正（XSS、認証情報）
- [x] ファイル命名規約統一

### Phase 2: 品質向上 🟡
- [ ] テストカバレッジ 80%以上
- [ ] E2Eテスト自動化
- [ ] API型安全性強化（Zod導入）

### Phase 3: スケーラビリティ 🔄
- [ ] コンポーネント Story Book化
- [ ] CI/CDパイプライン強化
- [ ] モニタリング・ログ基盤

### Phase 4: 運用最適化 📈
- [ ] パフォーマンス監視（Core Web Vitals）
- [ ] エラートラッキング（Sentry）
- [ ] ユーザー分析（Analytics）

## 👥 チーム開発ガイド

### コントリビューション
1. **Issue作成**: 機能要求・バグ報告
2. **Feature Branch**: `feature/issue-number-description`
3. **Pull Request**: レビュー必須（最低1人）
4. **コードレビュー**: セキュリティ・パフォーマンス・可読性

### コミット規約（Conventional Commits）
```bash
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

## 📞 サポート・お問い合わせ

- **バグ報告**: [GitHub Issues](https://github.com/yourusername/kaikaihatsu_ai/issues)
- **機能要求**: [GitHub Discussions](https://github.com/yourusername/kaikaihatsu_ai/discussions)
- **開発相談**: [Discord](https://discord.gg/yourinvite)

## 📄 ライセンス

MIT License - オープンソースプロジェクト

---

**🚀 Built with ❤️ by Modern Engineering Team**
# Kaikaihatsu_AI (LoveNavi2)

AIを活用したインタラクティブなクイズ作成・診断プラットフォーム

## 概要

Kaikaihatsu_AIは、AIの力を活用して心理診断クイズや相性診断を簡単に作成・共有できるWebアプリケーションです。Next.js、Supabase、AI APIを統合し、リアルタイムの分析機能も提供します。

## 主な機能

- **AIクイズ生成**: OpenAI/Anthropic APIを使用した自動クイズ生成
- **診断機能**: 回答に基づく詳細な分析とレポート生成
- **データ分析**: リアルタイムの回答分析とビジュアライゼーション
- **ユーザー管理**: Supabase Authによる認証システム
- **レスポンシブデザイン**: モバイル対応のUIデザイン

## 技術スタック

- **フロントエンド**: Next.js 13.4, React 18, TypeScript
- **UI/UX**: Material-UI, Tailwind CSS, Framer Motion
- **認証**: Supabase Auth, NextAuth
- **データベース**: Supabase (PostgreSQL)
- **AI統合**: OpenAI API, Anthropic Claude API
- **グラフ**: Chart.js, Recharts, D3.js
- **デプロイ**: Vercel

## セットアップ

### 前提条件

- Node.js 18.x以上
- npm または yarn
- Supabaseアカウント
- OpenAI APIキー または Anthropic APIキー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/kaikaihatsu_ai.git
cd kaikaihatsu_ai

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定:

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# AI API設定（どちらか一方）
OPENAI_API_KEY=sk-your_openai_api_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key
```

### データベースのセットアップ

```bash
# Supabaseスキーマのセットアップ
npm run supabase:setup

# テストデータの確認
npm run supabase:test
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 使用可能なスクリプト

```bash
npm run dev          # 開発サーバーの起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバーの起動
npm run lint         # ESLintの実行
npm run format       # Prettierでコードフォーマット

# データベース関連
npm run supabase:setup   # Supabaseスキーマのセットアップ
npm run supabase:test    # Supabase接続テスト
npm run supabase:check   # データベースの状態確認
npm run demo:data        # デモデータの生成
```

## プロジェクト構成

```
kaikaihatsu_ai/
├── src/
│   ├── pages/          # Next.jsページコンポーネント
│   ├── components/     # 再利用可能なReactコンポーネント
│   ├── contexts/       # Reactコンテキスト（認証など）
│   ├── utils/          # ユーティリティ関数
│   ├── types/          # TypeScript型定義
│   └── styles/         # グローバルスタイル
├── public/             # 静的ファイル
├── scripts/            # ユーティリティスクリプト
└── vercel.json         # Vercel設定
```

## Vercelへのデプロイ

### 1. Vercelでプロジェクトを作成

```bash
# Vercel CLIを使用
npx vercel
```

### 2. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定:
- すべての`NEXT_PUBLIC_`で始まる変数
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL` (本番URLに変更)
- `NEXTAUTH_SECRET`
- AI APIキー

### 3. デプロイ

```bash
# 本番環境へデプロイ
npx vercel --prod
```

## デプロイ後の確認事項

1. **環境変数の確認**: すべての必要な環境変数が設定されているか
2. **データベース接続**: Supabaseへの接続が正常か
3. **AI API**: クイズ生成機能が動作するか
4. **認証フロー**: ログイン/サインアップが正常に動作するか
5. **レスポンシブ確認**: モバイル/タブレット表示の確認

## 今後の開発予定

- [ ] ソーシャルログイン機能の追加
- [ ] 多言語対応
- [ ] PWA対応の強化
- [ ] より高度な分析機能
- [ ] クイズテンプレートの拡充
- [ ] APIレート制限の実装
- [ ] キャッシュ戦略の最適化

## トラブルシューティング

### Supabase接続エラー
- 環境変数が正しく設定されているか確認
- Supabaseダッシュボードでプロジェクトのステータスを確認

### AI API エラー
- APIキーが有効か確認
- APIの使用制限に達していないか確認

### ビルドエラー
- `npm run lint`でコードエラーをチェック
- TypeScriptエラーがないか確認

## ライセンス

MIT License

## 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

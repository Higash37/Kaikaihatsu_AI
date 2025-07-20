# Vercelデプロイ手順

## 1. 準備

### 必要なもの

- Vercelアカウント
- GitHubリポジトリ（このプロジェクト）
- Firebaseプロジェクト

## 2. Vercelでのデプロイ

### 2.1 Vercelにログイン

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン

### 2.2 プロジェクトをインポート

1. "New Project"をクリック
2. GitHubリポジトリを選択
3. プロジェクト名を設定（例：`kaikaihatsu-ai`）

### 2.3 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を設定：

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

**注意**: 実際のFirebase設定値は、Firebaseコンソールのプロジェクト設定から取得してください。

### 2.4 デプロイ設定

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## 3. デプロイ後の確認

### 3.1 動作確認

1. デプロイされたURLにアクセス
2. アプリが正常に動作することを確認
3. Firebaseとの接続を確認

### 3.2 カスタムドメイン（オプション）

1. Vercelプロジェクト設定でカスタムドメインを追加
2. DNS設定を更新

## 4. トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**

   - Vercelの環境変数設定を確認
   - 再デプロイを実行

2. **Firebase接続エラー**

   - Firebase設定が正しいか確認
   - Firebaseプロジェクトの設定を確認

3. **ビルドエラー**
   - ローカルで`npm run build`を実行してエラーを確認
   - 依存関係の問題を解決

## 5. 継続的デプロイ

### GitHubとの連携

- メインブランチにプッシュすると自動デプロイ
- プルリクエストでプレビューデプロイ

### 環境別デプロイ

- Production: メインブランチ
- Preview: プルリクエスト
- Development: 開発ブランチ

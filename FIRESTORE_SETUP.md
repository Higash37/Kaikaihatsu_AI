# Firestore データベース設定手順

## 1. Firebaseコンソールにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト `aiform-8c4dc` を選択
3. 左側メニューから「Firestore Database」を選択

## 2. セキュリティルールを設定

「ルール」タブで以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 3. コレクションとデータを作成

### 3.1 usersコレクション

「データ」タブで「コレクションを開始」をクリック：

**コレクションID**: `users`

**最初のドキュメント**:

- ドキュメントID: 自動ID
- フィールド:
  ```
  id: 1 (number)
  name: "田中太郎" (string)
  age: 25 (number)
  gender: "男性" (string)
  emotion_score: 75 (number)
  rational_score: 60 (number)
  active_score: 80 (number)
  passive_score: 40 (number)
  createdAt: 現在のタイムスタンプ (timestamp)
  ```

### 3.2 quizzesコレクション

**コレクションID**: `quizzes`

**最初のドキュメント**:

- ドキュメントID: 自動ID
- フィールド:
  ```
  theme: "チームワーク診断" (string)
  title: "チームワーク適性診断" (string)
  questions: [
    {
      id: 1,
      text: "チームでの協力を重視しますか？"
    },
    {
      id: 2,
      text: "リーダーシップを発揮することが多いですか？"
    }
  ] (array)
  indicators: [
    {
      id: 1,
      name: "協調性",
      description: "チームとの協力能力"
    }
  ] (array)
  createdAt: 現在のタイムスタンプ (timestamp)
  ```

### 3.3 diagnosesコレクション

**コレクションID**: `diagnoses`

このコレクションは空で作成し、アプリケーションが診断結果を保存する際に使用されます。

## 4. 確認

各コレクションが作成され、適切なデータが入力されていることを確認してください。

## 5. アプリケーションのテスト

アプリケーションを再起動して、以下を確認：

1. クイズ生成API (`/api/generate-quiz`) が動作する
2. 診断API (`/api/diagnose`) が動作する
3. データ取得API (`/api/get-diagnosis`) が動作する

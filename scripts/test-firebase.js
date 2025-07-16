// Firebase接続テスト用スクリプト
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDxYHpOLc7YDVoH3sup0dGz5YLh8GNDIIw",
  authDomain: "kaikaihatsu-ai.firebaseapp.com",
  projectId: "kaikaihatsu-ai",
  storageBucket: "kaikaihatsu-ai.firebasestorage.app",
  messagingSenderId: "305633823710",
  appId: "1:305633823710:web:a0961257b3270d36706b4f",
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// テストデータを保存する関数
async function saveTestData() {
  try {
    console.log("🔥 Firebase接続テストを開始...");
    console.log("📂 コレクション: test_data");
    console.log("🌐 プロジェクト: kaikaihatsu-ai");

    // テストデータを作成
    const testData = {
      message: "Hello Firebase!",
      timestamp: serverTimestamp(),
      testType: "connection_test",
      testDate: new Date().toISOString(),
      data: {
        quizTitle: "テスト用アンケート",
        answers: { 1: 3, 2: 4, 3: 2, 4: 5 },
        userAgent: "Test Script",
        score: 85,
      },
    };

    console.log("💾 データを保存中...", JSON.stringify(testData, null, 2));

    // Firestoreに保存
    const docRef = await addDoc(collection(db, "test_data"), testData);
    console.log("✅ データが正常に保存されました！");
    console.log("📄 ドキュメントID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("❌ データ保存エラー:", error);
    console.error("エラーコード:", error.code);
    console.error("エラーメッセージ:", error.message);
    throw error;
  }
}

// 保存されたデータを取得する関数
async function getTestData() {
  try {
    console.log("📖 保存されたデータを取得中...");

    const querySnapshot = await getDocs(collection(db, "test_data"));
    const results = [];

    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("✅ データ取得成功！");
    console.log("📊 取得件数:", results.length);

    // 最新の3件を表示
    const latestResults = results.slice(-3);
    latestResults.forEach((item, index) => {
      console.log(`\n--- データ ${index + 1} ---`);
      console.log("ID:", item.id);
      console.log("メッセージ:", item.message);
      console.log("テストタイプ:", item.testType);
      console.log("作成日:", item.testDate);
      if (item.data) {
        console.log("クイズタイトル:", item.data.quizTitle);
        console.log("スコア:", item.data.score);
      }
    });

    return results;
  } catch (error) {
    console.error("❌ データ取得エラー:", error);
    console.error("エラーコード:", error.code);
    console.error("エラーメッセージ:", error.message);
    throw error;
  }
}

// メイン実行関数
async function main() {
  try {
    console.log("🚀 Firebase接続テストを開始します...\n");
    console.log("🔧 Firebase設定:");
    console.log("  - プロジェクトID:", firebaseConfig.projectId);
    console.log("  - 認証ドメイン:", firebaseConfig.authDomain);
    console.log("  - 地域:", "asia-northeast1 (想定)");
    console.log("");

    // 1. データを保存
    await saveTestData();
    console.log("\n" + "=".repeat(50));

    // 2. データを取得
    await getTestData();
    console.log("\n" + "=".repeat(50));

    console.log("🎉 全てのテストが完了しました！");
    console.log("🔗 Firebase接続は正常に動作しています。");
  } catch (error) {
    console.error("💥 テスト失敗:", error.message);
    process.exit(1);
  }
}

// スクリプト実行
main();

// Firebase接続テスト
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testFirebaseConnection() {
  console.log('🔍 Firebase接続テスト中...\n');
  
  try {
    // Firebase Admin SDK の初期化
    if (!admin.apps.length) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      console.log('📋 設定確認:');
      console.log(`   Project ID: ${projectId}`);
      console.log(`   Client Email: ${clientEmail}`);
      console.log(`   Private Key: ${privateKey ? '✅ 設定済み' : '❌ 未設定'}\n`);
      
      if (!projectId || !clientEmail || !privateKey) {
        console.error('❌ Firebase Admin SDK の環境変数が不足しています');
        console.log('必要な環境変数:');
        console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        console.log('- FIREBASE_CLIENT_EMAIL');
        console.log('- FIREBASE_PRIVATE_KEY');
        return;
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      
      console.log('✅ Firebase Admin SDK 初期化完了');
    }
    
    const firestore = admin.firestore();
    
    // ユーザーコレクションのテスト
    console.log('📊 Firebaseデータ確認中...');
    const usersSnapshot = await firestore.collection('users').limit(3).get();
    console.log(`   ユーザー数: ${usersSnapshot.size}件`);
    
    if (!usersSnapshot.empty) {
      console.log('   サンプルユーザー:');
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.username} (${data.email || 'メールなし'})`);
      });
    }
    
    // クイズコレクションのテスト
    const quizzesSnapshot = await firestore.collection('quizzes').limit(3).get();
    console.log(`\n   クイズ数: ${quizzesSnapshot.size}件`);
    
    if (!quizzesSnapshot.empty) {
      console.log('   サンプルクイズ:');
      quizzesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.title}`);
      });
    }
    
    console.log('\n🎉 Firebase接続テスト成功！');
    console.log('データ移行の準備が整いました。');
    
  } catch (error) {
    console.error('❌ Firebase接続エラー:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 ネットワーク接続を確認してください');
    } else if (error.message.includes('permission')) {
      console.log('\n💡 サービスアカウントキーの権限を確認してください');
    } else if (error.message.includes('credential')) {
      console.log('\n💡 Firebase認証情報を確認してください');
    }
  }
}

testFirebaseConnection();
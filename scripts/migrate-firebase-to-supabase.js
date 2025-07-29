// Firebase から Supabase へのデータ移行スクリプト
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
  // Firebase Admin SDK の設定（サービスアカウントキーが必要）
  // 注意：本番環境では環境変数から読み込む
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();

// Supabase クライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 管理者キーを使用
);

async function migrateUsers() {
  console.log('🔄 ユーザーデータの移行を開始...');
  
  try {
    const usersSnapshot = await firestore.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const firebaseId = doc.id;
      
      console.log(`📤 移行中: ${userData.username} (${firebaseId})`);
      
      // Supabase Auth でユーザーを作成
      let emailPrefix = userData.username.replace(/[^a-zA-Z0-9]/g, '');
      if (!emailPrefix) {
        emailPrefix = `user${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
      }
      const migrationEmail = userData.email || `${emailPrefix}@sciscitorai.com`;
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: migrationEmail,
        password: 'TempPassword123!', // 一時パスワード（後で変更を促す）
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          migrated_from_firebase: true,
          original_firebase_id: firebaseId,
        }
      });
      
      if (authError) {
        console.error(`❌ Auth作成エラー (${userData.username}):`, authError);
        continue;
      }
      
      // プロフィールテーブルにデータを挿入
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          username: userData.username,
          email: migrationEmail,
          bio: userData.profile?.bio || null,
          avatar_url: userData.profile?.avatar || null,
          is_public: userData.profile?.preferences?.publicProfile || true,
          created_at: userData.createdAt,
          updated_at: userData.updatedAt || userData.createdAt,
        });
      
      if (profileError) {
        console.error(`❌ プロフィール作成エラー (${userData.username}):`, profileError);
        continue;
      }
      
      console.log(`✅ 完了: ${userData.username}`);
    }
    
    console.log('✨ ユーザーデータ移行完了');
  } catch (error) {
    console.error('❌ ユーザー移行エラー:', error);
  }
}

async function migrateQuizzes() {
  console.log('🔄 クイズデータの移行を開始...');
  
  try {
    const quizzesSnapshot = await firestore.collection('quizzes').get();
    
    for (const doc of quizzesSnapshot.docs) {
      const quizData = doc.data();
      const firebaseId = doc.id;
      
      console.log(`📤 移行中: ${quizData.title} (${firebaseId})`);
      
      // Firebase ユーザーIDをSupabase ユーザーIDに変換
      // createdByがFirebase UIDの場合は、user_metadataから検索
      let userProfile;
      
      // まずcreatedByをusernameとして検索
      if (quizData.createdBy) {
        userProfile = await supabase
          .from('profiles')
          .select('id')
          .eq('username', quizData.createdBy)
          .single();
      }
      
      // usernameで見つからない場合は、Firebase UIDとして検索
      if (userProfile?.error || !quizData.createdBy) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const matchingUser = authUsers.users.find(user => 
          user.user_metadata?.original_firebase_id === quizData.createdBy ||
          user.user_metadata?.username === quizData.createdBy
        );
        
        if (matchingUser) {
          userProfile = { data: { id: matchingUser.id }, error: null };
        } else {
          console.error(`❌ ユーザー見つからず: ${quizData.createdBy}`);
          continue;
        }
      }
      
      // 完全なクイズデータにFirebase IDを追加
      const completeQuizData = {
        ...quizData,
        firebase_id: firebaseId, // Firebase IDをデータ内に保存
      };

      const { error: quizError } = await supabase
        .from('quizzes')
        .insert({
          user_id: userProfile.data.id,
          title: quizData.title,
          description: quizData.description || null,
          category: quizData.category || null,
          difficulty: quizData.difficulty || 'medium',
          is_public: quizData.isPublic || false,
          questions: completeQuizData, // 完全なクイズデータを保存
          created_at: quizData.createdAt,
          updated_at: quizData.updatedAt || quizData.createdAt,
        });
      
      if (quizError) {
        console.error(`❌ クイズ作成エラー (${quizData.title}):`, quizError);
        continue;
      }
      
      console.log(`✅ 完了: ${quizData.title}`);
    }
    
    console.log('✨ クイズデータ移行完了');
  } catch (error) {
    console.error('❌ クイズ移行エラー:', error);
  }
}

async function migrateResponses() {
  console.log('🔄 回答データの移行を開始...');
  
  try {
    const responsesSnapshot = await firestore.collection('quiz_results').get();
    
    for (const doc of responsesSnapshot.docs) {
      const responseData = doc.data();
      const firebaseId = doc.id;
      
      console.log(`📤 移行中: 回答 (${firebaseId})`);
      
      // Firebase UIDをSupabase UIDに変換
      let userId = null;
      if (responseData.userId) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const matchingUser = authUsers.users.find(user => 
          user.user_metadata?.original_firebase_id === responseData.userId ||
          user.user_metadata?.username === responseData.userId
        );
        
        if (matchingUser) {
          userId = matchingUser.id;
        }
      }
      
      // クイズIDを変換
      let quizId = null;
      if (responseData.quizId) {
        const { data: quiz } = await supabase
          .from('quizzes')
          .select('id')
          .contains('questions', { firebase_id: responseData.quizId })
          .single();
        
        if (quiz) {
          quizId = quiz.id;
        }
      }
      
      // 匿名回答または見つからない場合はスキップ
      if (!userId) {
        console.log(`⚠️ スキップ: ユーザーが見つからない (${firebaseId})`);
        continue;
      }
      
      const { error: responseError } = await supabase
        .from('diagnoses')
        .insert({
          user_id: userId,
          quiz_id: quizId || '00000000-0000-0000-0000-000000000000', // デフォルトクイズID
          responses: responseData.responses || responseData,
          result_data: responseData.result || responseData,
          score: responseData.score || null,
          completed_at: responseData.completedAt || responseData.createdAt,
          created_at: responseData.createdAt,
        });
      
      if (responseError) {
        console.error(`❌ 回答作成エラー (${firebaseId}):`, responseError);
        continue;
      }
      
      console.log(`✅ 完了: 回答 (${firebaseId})`);
    }
    
    console.log('✨ 回答データ移行完了');
  } catch (error) {
    console.error('❌ 回答移行エラー:', error);
  }
}

async function main() {
  console.log('🚀 Firebase → Supabase データ移行開始');
  console.log('⚠️  注意: この操作は本番データに影響します');
  
  // 移行前の確認
  const confirmation = process.argv.includes('--confirm');
  if (!confirmation) {
    console.log('❌ 確認フラグが必要です: node migrate-firebase-to-supabase.js --confirm');
    return;
  }
  
  try {
    // 順番に移行実行
    await migrateUsers();
    await migrateQuizzes();
    await migrateResponses();
    
    console.log('🎉 全データ移行完了！');
    console.log('📝 次の手順:');
    console.log('   1. 移行されたデータの確認');
    console.log('   2. ユーザーへのパスワード変更通知');
    console.log('   3. アプリケーションコードのSupabase切り替え');
    
  } catch (error) {
    console.error('❌ 移行プロセスエラー:', error);
  } finally {
    process.exit(0);
  }
}

// スクリプト実行
main();
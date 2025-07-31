// Supabaseのクイズ詳細を確認するスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuizDetails() {
  console.log('🔍 クイズ詳細確認中...\n');
  
  try {
    // すべてのクイズを取得
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📋 クイズ総数: ${quizzes?.length || 0}件\n`);
    
    if (quizzes && quizzes.length > 0) {
      quizzes.forEach((quiz, index) => {
        console.log(`[${index + 1}] ${quiz.title}`);
        console.log(`   ID: ${quiz.id}`);
        console.log(`   ユーザーID: ${quiz.user_id}`);
        console.log(`   公開: ${quiz.is_public ? 'はい' : 'いいえ'}`);
        console.log(`   作成日時: ${quiz.created_at}`);
        console.log(`   カテゴリ: ${quiz.category || 'なし'}`);
        console.log(`   問題数: ${quiz.questions?.questions?.length || 0}問`);
        console.log('');
      });
    }
    
    // default-user-001のクイズを確認
    const { data: defaultUserQuizzes } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', 'default-user-001');
    
    console.log(`\n👤 default-user-001 のクイズ: ${defaultUserQuizzes?.length || 0}件`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkQuizDetails();
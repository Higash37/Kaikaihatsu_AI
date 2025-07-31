// クイズのユーザーIDを修正するスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserIds() {
  console.log('🔧 クイズのユーザーIDを修正中...\n');
  
  try {
    // すべてのクイズを取得
    const { data: quizzes, error: fetchError } = await supabase
      .from('quizzes')
      .select('*');
    
    if (fetchError) throw fetchError;
    
    console.log(`📋 修正対象のクイズ: ${quizzes?.length || 0}件\n`);
    
    if (quizzes && quizzes.length > 0) {
      for (const quiz of quizzes) {
        console.log(`更新中: ${quiz.title}`);
        console.log(`  現在のユーザーID: ${quiz.user_id}`);
        
        // user_idをdefault-user-001に更新
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({ user_id: 'default-user-001' })
          .eq('id', quiz.id);
        
        if (updateError) {
          console.error(`  ❌ 更新エラー:`, updateError);
        } else {
          console.log(`  ✅ default-user-001 に更新しました`);
        }
        console.log('');
      }
    }
    
    // 更新後の確認
    const { data: updatedQuizzes } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', 'default-user-001');
    
    console.log(`\n✅ 修正完了`);
    console.log(`👤 default-user-001 のクイズ: ${updatedQuizzes?.length || 0}件`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

fixUserIds();
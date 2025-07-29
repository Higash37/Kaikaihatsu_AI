// Supabaseの現在のデータを確認するスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('🔍 Supabase データ確認中...\n');
  
  try {
    // プロファイル数を確認
    const { data: profiles, count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    console.log(`📊 プロファイル: ${profileCount}件`);
    if (profiles && profiles.length > 0) {
      console.log('   最初の3件:');
      profiles.slice(0, 3).forEach(profile => {
        console.log(`   - ${profile.username} (${profile.email})`);
      });
    }
    
    // クイズ数を確認
    const { data: quizzes, count: quizCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact' });
    
    console.log(`\n📋 クイズ: ${quizCount}件`);
    if (quizzes && quizzes.length > 0) {
      console.log('   最初の3件:');
      quizzes.slice(0, 3).forEach(quiz => {
        console.log(`   - ${quiz.title}`);
      });
    }
    
    // 診断数を確認
    const { data: diagnoses, count: diagnosisCount } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact' });
    
    console.log(`\n🔬 診断: ${diagnosisCount}件`);
    
    console.log('\n✅ データ確認完了');
    
  } catch (error) {
    console.error('❌ データ確認エラー:', error);
  }
}

checkData();
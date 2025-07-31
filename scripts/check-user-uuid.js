// ユーザーIDのUUIDを確認するスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserUUID() {
  console.log('🔍 ユーザーIDの確認中...\n');
  
  try {
    // プロファイルを確認
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    
    console.log('📊 プロファイル一覧:');
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`\nユーザー名: ${profile.username}`);
        console.log(`UUID: ${profile.id}`);
        console.log(`Email: ${profile.email}`);
      });
    }
    
    // デフォルトユーザーを作成する必要があるかチェック
    const defaultUserEmail = 'default-user@example.com';
    const existingDefault = profiles?.find(p => p.email === defaultUserEmail);
    
    if (!existingDefault) {
      console.log('\n⚠️  デフォルトユーザーが存在しません。新しいUUIDで作成が必要です。');
      console.log('\n推奨: AuthContextでこのUUIDを使用してください:');
      console.log('00000000-0000-0000-0000-000000000001');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

checkUserUUID();
// Supabaseスキーマセットアップスクリプト
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 環境変数の読み込み
dotenv.config({ path: '.env.local' });

// Supabase クライアント（管理者権限）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQLFile(filePath, description) {
  console.log(`🔄 ${description}を実行中...`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // SQLファイルを行ごとに分割して実行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`実行中: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`❌ SQLエラー:`, error);
          console.error(`失敗したSQL: ${statement}`);
        } else {
          console.log(`✅ 実行完了`);
        }
      }
    }
    
    console.log(`✨ ${description}完了`);
  } catch (error) {
    console.error(`❌ ${description}エラー:`, error);
  }
}

async function setupSupabaseSchema() {
  console.log('🚀 Supabaseスキーマセットアップ開始');
  
  try {
    // 現在のディレクトリを確認
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const policiesPath = path.join(process.cwd(), 'supabase', 'rls-policies.sql');
    
    console.log('📂 スキーマファイルパス:', schemaPath);
    console.log('📂 ポリシーファイルパス:', policiesPath);
    
    // ファイルの存在確認
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ スキーマファイルが見つかりません:', schemaPath);
      return;
    }
    
    if (!fs.existsSync(policiesPath)) {
      console.error('❌ ポリシーファイルが見つかりません:', policiesPath);
      return;
    }
    
    // 1. メインスキーマの実行
    await executeSQLFile(schemaPath, 'メインスキーマ');
    
    // 2. RLSポリシーの実行
    await executeSQLFile(policiesPath, 'RLSポリシー');
    
    console.log('🎉 Supabaseスキーマセットアップ完了！');
    console.log('📝 次の手順:');
    console.log('   1. Supabaseダッシュボードでテーブル確認');
    console.log('   2. 環境変数の設定確認');
    console.log('   3. アプリケーションのテスト');
    
  } catch (error) {
    console.error('❌ セットアップエラー:', error);
  }
}

// 手動でSQL実行する関数（RPC経由の代替）
async function executeSQLStatements() {
  console.log('🔄 手動SQLステートメント実行...');
  
  const statements = [
    'SELECT version();', // 接続テスト
  ];
  
  for (const sql of statements) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ SQL実行エラー:`, error);
        console.log('💡 ヒント: Supabaseダッシュボードから手動でスキーマを実行してください');
      } else {
        console.log(`✅ SQL実行成功:`, data);
      }
    } catch (err) {
      console.error(`❌ 実行エラー:`, err);
    }
  }
}

// メイン実行
async function main() {
  console.log('🔧 Supabaseスキーマセットアップツール');
  console.log('⚠️  注意: このスクリプトはSupabaseデータベースを変更します');
  
  const mode = process.argv[2];
  
  if (mode === '--test') {
    console.log('🧪 テストモードで実行中...');
    await executeSQLStatements();
  } else if (mode === '--setup') {
    console.log('⚙️  セットアップモードで実行中...');
    await setupSupabaseSchema();
  } else {
    console.log('❓ 使用方法:');
    console.log('   node setup-supabase-schema.js --test    # 接続テスト');
    console.log('   node setup-supabase-schema.js --setup   # スキーマセットアップ');
    console.log('');
    console.log('💡 推奨: まず --test で接続確認してから --setup を実行');
  }
}

// スクリプト実行
main().then(() => {
  console.log('🏁 処理完了');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 致命的エラー:', error);
  process.exit(1);
});
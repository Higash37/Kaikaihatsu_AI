import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDiagnosesTableSchema() {
  try {
    console.log('Checking diagnoses table schema...');
    
    // PostgreSQLのinformation_schemaを使ってテーブル構造を取得
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'diagnoses')
      .order('ordinal_position');

    if (error) {
      console.error('Error fetching schema:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No diagnoses table found or no columns returned');
      return;
    }

    console.log('\ndiagnoses table columns:');
    console.log('='.repeat(80));
    data.forEach(column => {
      console.log(`${column.column_name.padEnd(20)} | ${column.data_type.padEnd(15)} | ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\nExpected columns based on code:');
    console.log('- user_id');
    console.log('- quiz_id'); 
    console.log('- responses (JSONB)');
    console.log('- result_data (JSONB)');
    console.log('- created_at');
    console.log('- updated_at');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function checkQuizzesTableSchema() {
  try {
    console.log('\nChecking quizzes table schema...');
    
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'quizzes')
      .order('ordinal_position');

    if (error) {
      console.error('Error fetching quizzes schema:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No quizzes table found');
      return;
    }

    console.log('\nquizzes table columns:');
    console.log('='.repeat(80));
    data.forEach(column => {
      console.log(`${column.column_name.padEnd(20)} | ${column.data_type.padEnd(15)} | ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function main() {
  await checkDiagnosesTableSchema();
  await checkQuizzesTableSchema();
}

main();
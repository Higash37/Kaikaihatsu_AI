// server.mjs
/* global process, console */ // グローバル変数の宣言を追加
import dotenv from 'dotenv'
dotenv.config() // ← これが重要！

import express from 'express'
import next from 'next'
import bodyParser from 'body-parser'
import pkg from 'pg'
const { Pool } = pkg
import cors from 'cors'

const dev = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

// PostgreSQL の接続設定
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Render用
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'kaikaihatsu_test1',
        password: '2813210',
        port: 5432,
      },
)

// Express アプリの起動
nextApp.prepare().then(() => {
  const app = express()

  // CORS 設定（.env から読み込み）
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  app.use(
    cors({
      origin: allowedOrigins,
      methods: 'GET,POST',
      credentials: true,
    }),
  )

  app.use(bodyParser.json())

  // テーブルのカラムが不足している場合に追加
  const ensureTableStructure = async () => {
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `)
      console.log('テーブル構造チェック完了')
    } catch (error) {
      console.error('テーブル構造のチェック中にエラーが発生:', error)
    }
  }

  ensureTableStructure()

  // データ登録エンドポイント
  app.post('/api/save-diagnosis', async (req, res) => {
    try {
      const { emotion_score, rational_score, active_score, passive_score, x, y, gender, age } =
        req.body

      console.log('📌 受信したデータ:', req.body)

      const query = `
        INSERT INTO public.users (
          emotion_score, 
          rational_score, 
          active_score, 
          passive_score,
          "x",
          "y",
          gender,
          age
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `

      const values = [emotion_score, rational_score, active_score, passive_score, x, y, gender, age]

      const result = await pool.query(query, values)

      res.status(201).json({
        message: 'Diagnosis data saved successfully',
        data: result.rows,
      })
    } catch (error) {
      console.error('❌ データ保存エラー:', error)
      res.status(500).json({
        message: 'Error saving diagnosis data',
        error: error.message,
      })
    }
  })

  // データ取得エンドポイント
  app.get('/api/get-diagnosis', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC')
      res.status(200).json({
        message: 'Diagnoses retrieved successfully',
        data: result.rows,
      })
    } catch (error) {
      console.error('Error retrieving diagnoses:', error)
      res.status(500).json({
        message: 'Error retrieving diagnosis data',
        error: error.message,
      })
    }
  })

  // Next.js のルーティングに渡す
  app.all('*', (req, res) => {
    return handle(req, res)
  })

  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`)
  })
})

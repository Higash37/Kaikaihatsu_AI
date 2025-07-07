// Next.jsのAPIルートを作成
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

interface Data {
  name: string
}

// テスト用のAPIルートを作成
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: 'John Doe' }) // 英語圏でよく使われるダミー名、例としてのデフォルト処理
}

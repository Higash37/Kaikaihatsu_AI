// Next.js APIルート
import { NextApiRequest, NextApiResponse } from "next";

import { ApiResponse } from "@/types";

// リクエスト本文の型定義
interface NavigateRequest {
  currentPage: string;
}

// レスポンスデータの型定義
interface NavigateData {
  nextPage: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<NavigateData>>
) {
  if (req.method === "POST") {
    try {
      // 動的に遷移先を決定する例
      const { currentPage } = req.body as NavigateRequest;
      let nextPage = "/next-page"; // デフォルトの遷移先

      // 現在のページに応じて動作を変更できる
      if (currentPage === "home") {
        nextPage = "/next-page";
      } else if (currentPage === "next-page") {
        nextPage = "/"; // 次ページからはホームページに戻る
      }

      res.status(200).json({
        success: true,
        data: { nextPage },
        message: "ナビゲーション情報を取得しました",
      });
    } catch {
      res.status(500).json({
        success: false,
        error: "ナビゲーション処理中にエラーが発生しました",
      });
    }
  } else {
    // POST以外のメソッドは405エラー
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }
}

import { NextApiRequest, NextApiResponse } from "next";

import { ApiResponse, DiagnosisItem } from "@/types";

// サンプルデータ（実際のアプリケーションではデータベースから取得する）
const sampleDiagnosisData: DiagnosisItem[] = [
  {
    id: "1",
    gender: "male",
    age: 25,
    emotion_score: 65,
    rational_score: 35,
    active_score: 70,
    passive_score: 30,
    created_at: "2023-12-01T10:30:00Z",
  },
  {
    id: "2",
    gender: "female",
    age: 31,
    emotion_score: 55,
    rational_score: 45,
    active_score: 40,
    passive_score: 60,
    created_at: "2023-12-02T14:20:00Z",
  },
  {
    id: "3",
    gender: "others",
    age: 22,
    emotion_score: 50,
    rational_score: 50,
    active_score: 50,
    passive_score: 50,
    created_at: "2023-12-03T09:15:00Z",
  },
  {
    id: "4",
    gender: "male",
    age: 19,
    emotion_score: 70,
    rational_score: 30,
    active_score: 75,
    passive_score: 25,
    created_at: "2023-12-04T16:45:00Z",
  },
  {
    id: "5",
    gender: "female",
    age: 28,
    emotion_score: 40,
    rational_score: 60,
    active_score: 45,
    passive_score: 55,
    created_at: "2023-12-05T12:00:00Z",
  },
  {
    id: "6",
    gender: "male",
    age: 35,
    emotion_score: 35,
    rational_score: 65,
    active_score: 60,
    passive_score: 40,
    created_at: "2023-12-06T08:30:00Z",
  },
  {
    id: "7",
    gender: "female",
    age: 42,
    emotion_score: 60,
    rational_score: 40,
    active_score: 30,
    passive_score: 70,
    created_at: "2023-12-07T18:20:00Z",
  },
  {
    id: "8",
    gender: "others",
    age: 27,
    emotion_score: 55,
    rational_score: 45,
    active_score: 55,
    passive_score: 45,
    created_at: "2023-12-08T11:10:00Z",
  },
  {
    id: "9",
    gender: "male",
    age: 23,
    emotion_score: 75,
    rational_score: 25,
    active_score: 80,
    passive_score: 20,
    created_at: "2023-12-09T13:40:00Z",
  },
  {
    id: "10",
    gender: "female",
    age: 30,
    emotion_score: 45,
    rational_score: 55,
    active_score: 40,
    passive_score: 60,
    created_at: "2023-12-10T10:00:00Z",
  },
  // 10代前半
  {
    id: "11",
    gender: "male",
    age: 13,
    emotion_score: 80,
    rational_score: 20,
    active_score: 85,
    passive_score: 15,
    created_at: "2023-12-11T15:30:00Z",
  },
  {
    id: "12",
    gender: "female",
    age: 14,
    emotion_score: 75,
    rational_score: 25,
    active_score: 65,
    passive_score: 35,
    created_at: "2023-12-12T09:45:00Z",
  },
  // 10代後半
  {
    id: "13",
    gender: "male",
    age: 17,
    emotion_score: 70,
    rational_score: 30,
    active_score: 75,
    passive_score: 25,
    created_at: "2023-12-13T14:20:00Z",
  },
  {
    id: "14",
    gender: "female",
    age: 18,
    emotion_score: 65,
    rational_score: 35,
    active_score: 60,
    passive_score: 40,
    created_at: "2023-12-14T11:10:00Z",
  },
  // 20代前半
  {
    id: "15",
    gender: "male",
    age: 22,
    emotion_score: 60,
    rational_score: 40,
    active_score: 70,
    passive_score: 30,
    created_at: "2023-12-15T16:40:00Z",
  },
  {
    id: "16",
    gender: "female",
    age: 23,
    emotion_score: 55,
    rational_score: 45,
    active_score: 50,
    passive_score: 50,
    created_at: "2023-12-16T13:15:00Z",
  },
  // 20代後半
  {
    id: "17",
    gender: "male",
    age: 27,
    emotion_score: 50,
    rational_score: 50,
    active_score: 65,
    passive_score: 35,
    created_at: "2023-12-17T10:30:00Z",
  },
  {
    id: "18",
    gender: "female",
    age: 28,
    emotion_score: 45,
    rational_score: 55,
    active_score: 45,
    passive_score: 55,
    created_at: "2023-12-18T15:50:00Z",
  },
  // 30代
  {
    id: "19",
    gender: "male",
    age: 33,
    emotion_score: 40,
    rational_score: 60,
    active_score: 60,
    passive_score: 40,
    created_at: "2023-12-19T09:20:00Z",
  },
  {
    id: "20",
    gender: "female",
    age: 35,
    emotion_score: 35,
    rational_score: 65,
    active_score: 40,
    passive_score: 60,
    created_at: "2023-12-20T14:40:00Z",
  },
  // 40代
  {
    id: "21",
    gender: "male",
    age: 42,
    emotion_score: 30,
    rational_score: 70,
    active_score: 55,
    passive_score: 45,
    created_at: "2023-12-21T11:10:00Z",
  },
  {
    id: "22",
    gender: "female",
    age: 46,
    emotion_score: 25,
    rational_score: 75,
    active_score: 35,
    passive_score: 65,
    created_at: "2023-12-22T16:30:00Z",
  },
  // 50代以上
  {
    id: "23",
    gender: "male",
    age: 53,
    emotion_score: 20,
    rational_score: 80,
    active_score: 50,
    passive_score: 50,
    created_at: "2023-12-23T10:15:00Z",
  },
  {
    id: "24",
    gender: "female",
    age: 58,
    emotion_score: 15,
    rational_score: 85,
    active_score: 30,
    passive_score: 70,
    created_at: "2023-12-24T13:45:00Z",
  },
];

// 定義した変数またはインポートするデータを使用するハンドラー関数
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DiagnosisItem[]>>
) {
  if (req.method === "GET") {
    try {
      // サンプルデータをクライアントに返す
      // 実際のアプリケーションではデータベースからデータを取得
      res.status(200).json({
        success: true,
        data: sampleDiagnosisData,
        message: "診断データを取得しました",
      });
    } catch (error) {
      console.error("診断データ取得エラー:", error);
      res.status(500).json({
        success: false,
        error: "診断データの取得中にエラーが発生しました",
      });
    }
  } else {
    // GET以外のメソッドは許可しない
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }
}

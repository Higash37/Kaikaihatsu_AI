import { Box, CircularProgress, Alert } from "@mui/material";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import Layout from "@/components/layout/Layout";
import QuizAnalytics from "@/components/charts/views/QuizAnalytics";

export default function Analytics() {
  const router = useRouter();
  const { id } = router.query;

  const [quizData, setQuizData] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        console.log("分析データ取得開始, クイズID:", id);

        // クイズデータを取得
        console.log("クイズデータ取得中...");
        const quizResponse = await fetch(`/api/quiz/${id}`);
        console.log(
          "クイズAPIレスポンス:",
          quizResponse.status,
          quizResponse.statusText
        );

        if (!quizResponse.ok) {
          const errorText = await quizResponse.text();
          console.error("クイズAPIエラー詳細:", errorText);
          throw new Error(
            `クイズデータの取得に失敗しました: ${quizResponse.status}`
          );
        }

        const quiz = await quizResponse.json();
        console.log("取得したクイズデータ:", quiz);
        setQuizData(quiz);

        // 回答データを取得
        console.log("回答データ取得中...");
        const responsesResponse = await fetch(`/api/responses?quizId=${id}`);
        console.log(
          "回答APIレスポンス:",
          responsesResponse.status,
          responsesResponse.statusText
        );

        if (responsesResponse.ok) {
          const responsesData = await responsesResponse.json();
          console.log("取得した回答データ:", responsesData);
          setResponses(responsesData.responses || []);
        } else {
          console.log("回答データが取得できないため、空配列を使用");
          setResponses([]);
        }
      } catch (err: any) {
        console.error("分析データ取得エラー:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            paddingTop: "80px",
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3, width: "100%" }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );
  }

  if (!quizData) {
    return (
      <Layout>
        <Box sx={{ p: 3, width: "100%" }}>
          <Alert severity="warning">クイズが見つかりません</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
        <QuizAnalytics
          quizTitle={quizData.title}
          responses={responses}
          questions={quizData.questions || []}
          quizData={quizData}
        />
      </Box>
    </Layout>
  );
}

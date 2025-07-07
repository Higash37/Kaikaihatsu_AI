import { Box, Typography, Paper, Grid, LinearProgress } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";

import Header from "@/components/Header";

// 型定義
type Question = { id: number; text: string };
type Indicator = { id: number; name: string; description: string };
type Answers = { [id: number]: number | undefined };
type QuizResult = {
  title: string;
  questions: Question[];
  indicators: Indicator[];
  answers: Answers;
};

type IndicatorScore = {
  id: number;
  name: string;
  description: string;
  score: number;
};

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<QuizResult | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("quizResult");
    if (storedData) {
      setResultData(JSON.parse(storedData));
    } else {
      router.replace("/");
    }
  }, [router]);

  // 仮のスコア計算ロジック
  // 本来はAIが提供するロジックや、回答内容に基づいて計算する
  const calculatedScores: IndicatorScore[] = useMemo(() => {
    if (!resultData) return [];
    // 現状は、各指標にランダムなスコアを割り当てるダミーロジック
    return resultData.indicators.map((indicator) => ({
      ...indicator,
      score: Math.floor(Math.random() * 101), // 0-100のランダムスコア
    }));
  }, [resultData]);

  const topIndicator = useMemo(() => {
    if (calculatedScores.length === 0) return null;
    return [...calculatedScores].sort((a, b) => b.score - a.score)[0];
  }, [calculatedScores]);

  if (!resultData || !topIndicator) {
    return <Typography>結果を読み込んでいます...</Typography>;
  }

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <Header />
      <Box
        sx={{
          pt: { xs: 12, sm: 14, md: 16 },
          pb: 6,
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '16px' }}>
          <Typography variant="h4" component="h1" textAlign="center" sx={{ fontWeight: 'bold', mb: 1 }}>
            診断結果
          </Typography>
          <Typography variant="h6" component="h2" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            {resultData.title}
          </Typography>

          <Box sx={{ textAlign: 'center', p: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: '12px' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>あなたの最も強い特性は...</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
              {topIndicator.name}
            </Typography>
            <Typography variant="body1">
              {topIndicator.description}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
            あなたの詳細プロファイル
          </Typography>
          <Grid container spacing={3}>
            {calculatedScores.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{item.name}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.score}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.score}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

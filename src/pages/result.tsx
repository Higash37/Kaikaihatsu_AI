import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import {
  getThemeKey,
  selectPersonResult,
  getDetailItems,
  calculateDetailScores,
  getThemeResults,
} from "@/data/DiagnosisResults";
import { saveQuizResult } from "@/utils/firebase";

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

// 拡張された診断結果の型
type ExtendedDiagnosisResult = {
  id: string;
  gender: string;
  age: number;
  emotion_score: number;
  rational_score: number;
  active_score: number;
  passive_score: number;
  resultName?: string;
  resultDescription?: string;
  traits?: string[];
};

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<QuizResult | null>(null);
  const [diagnosisResult, setDiagnosisResult] =
    useState<ExtendedDiagnosisResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const theme = useTheme();

  useEffect(() => {
    // ブラウザ環境でのみsessionStorageにアクセス
    if (typeof window !== "undefined") {
      const storedData = window.sessionStorage.getItem("quizResult");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setResultData(parsedData);

        // 診断結果をローカルで生成
        const generateLocalResult = (): ExtendedDiagnosisResult => {
          const scores = Object.values(parsedData.answers) as number[];
          const validScores = scores.filter(
            (score) => typeof score === "number" && score > 0
          );
          const averageScore =
            validScores.length > 0
              ? validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length
              : 3;

          // クイズのテーマに基づいた結果を生成
          const quizTitle = parsedData.title || "診断結果";
          const themeKey = getThemeKey(quizTitle);
          const themeResults = getThemeResults(themeKey, quizTitle);

          // スコアと回答傾向に基づいて最適な人物を選択
          const selectedPerson = selectPersonResult(
            themeResults,
            averageScore,
            parsedData.answers
          );

          return {
            id: "1",
            gender: "分析結果",
            age: Math.round(averageScore * 20),
            emotion_score: Math.round(averageScore * 20),
            rational_score: Math.round(averageScore * 20),
            active_score: Math.round(averageScore * 15),
            passive_score: Math.round((5 - averageScore) * 15),
            resultName: selectedPerson.name,
            resultDescription: selectedPerson.description,
            traits: selectedPerson.traits,
          };
        };

        setDiagnosisResult(generateLocalResult());
      } else {
        router.replace("/");
      }
    }
  }, [router]);

  // Firestoreに結果を保存する関数
  const handleSaveResult = async () => {
    if (!resultData || !diagnosisResult) {
      setSaveMessage("保存できるデータがありません。");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("結果を保存しています...");

    try {
      const saveData = {
        quizTitle: resultData.title,
        answers: resultData.answers,
        diagnosisResult: diagnosisResult,
        detailScores: calculateDetailScores(
          resultData.answers,
          getDetailItems(getThemeKey(resultData.title), resultData.title)
        ),
        userAgent:
          typeof window !== "undefined" ? window.navigator.userAgent : "",
      };

      const docId = await saveQuizResult(saveData);
      setSaveStatus("saved");
      setSaveMessage(`結果が保存されました！ ID: ${docId}`);
    } catch (error) {
      console.error("保存エラー:", error);
      setSaveStatus("error");
      setSaveMessage("保存に失敗しました。もう一度お試しください。");
    }
  };

  if (!resultData || !diagnosisResult) {
    return <Typography>結果を読み込んでいます...</Typography>;
  }

  // diagnosisResultから表示用のデータを作成
  const topIndicator = {
    name: diagnosisResult?.resultName || "診断結果",
    description: diagnosisResult?.resultDescription || "あなたの診断結果です。",
  };

  // テーマに応じた詳細項目を取得
  const quizTitle = resultData.title || "診断結果";
  const themeKey = getThemeKey(quizTitle);
  const detailItems = getDetailItems(themeKey, quizTitle);
  const calculatedScores = calculateDetailScores(
    resultData.answers,
    detailItems
  );

  return (
    <Layout>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
          width: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Header />
        <Box
          sx={{
            pt: { xs: 12, sm: 14, md: 16 },
            pb: 6,
            px: { xs: 2, sm: 4, md: 6 },
            maxWidth: "900px",
            mx: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              mb: 4,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              textAlign="center"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: theme.palette.text.primary,
              }}
            >
              アンケート結果
            </Typography>
            <Typography
              variant="h6"
              component="h2"
              textAlign="center"
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              {resultData.title}
            </Typography>

            <Box
              sx={{
                textAlign: "center",
                p: 3,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                最も顕著な特性は...
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold", my: 2 }}>
                {topIndicator.name}
              </Typography>
              <Typography variant="body1">
                {topIndicator.description}
              </Typography>
            </Box>
          </Paper>

          {/* 特性（Traits）表示セクション */}
          {diagnosisResult.traits && diagnosisResult.traits.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                position: "relative",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                pointerEvents: "auto",
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                あなたの特性
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {diagnosisResult.traits.map((trait, index) => (
                  <Chip
                    key={index}
                    label={trait}
                    variant="outlined"
                    color="primary"
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: "medium",
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontWeight: "bold",
                mb: 3,
                color: theme.palette.text.primary,
              }}
            >
              詳細なプロファイル
            </Typography>
            <Grid container spacing={3}>
              {calculatedScores.map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "medium",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
                        }}
                      >
                        {item.score}%
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 1,
                      }}
                    >
                      {item.description}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.score}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: theme.palette.divider,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* 保存ボタンとステータス */}
          <Paper
            elevation={3}
            sx={{
              padding: 3,
              marginTop: 3,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              position: "relative",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveResult}
                disabled={saveStatus === "saving"}
                sx={{
                  backgroundColor: "#007AFF !important",
                  color: "#FFFFFF !important",
                  mb: 2,
                  mr: 1,
                  minWidth: 200,
                  height: 50,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#0056CC !important",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                  "&:disabled": {
                    backgroundColor: "#CCCCCC !important",
                    color: "#888888 !important",
                  },
                }}
              >
                {saveStatus === "saving"
                  ? "保存中..."
                  : "結果をデータベースに保存"}
              </Button>

              {/* トップページに戻るボタン */}
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/")}
                sx={{
                  backgroundColor: "#28A745 !important",
                  color: "#FFFFFF !important",
                  mb: 2,
                  ml: 1,
                  minWidth: 200,
                  height: 50,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2,
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#218838 !important",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                トップページへ戻る
              </Button>

              {saveMessage && (
                <Alert
                  severity={
                    saveStatus === "saved"
                      ? "success"
                      : saveStatus === "error"
                        ? "error"
                        : "info"
                  }
                  sx={{ mt: 2 }}
                >
                  {saveMessage}
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}

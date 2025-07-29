import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import React from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxMiddleRight,
  CircleBoxBigright,
  CircleBoxSmall,
} from "@/components/QuizHeart";

// 新しいデータ構造に合わせた型定義
type Question = {
  id: string;
  text: string;
  type: string;
  required: boolean;
  order: number;
  axisId?: number;
};

type Axis = {
  id: number;
  name: string;
  description: string;
};

type QuizData = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  axes?: Axis[];
  indicators?: any[];
  questionCount: number;
  isPublic: boolean;
  tags: string[];
  totalResponses: number;
  popularity: number;
  averageRating?: number;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  enableDemographics: boolean;
  enableLocationTracking: boolean;
  enableRating: boolean;
};

export default function Quiz() {
  const router = useRouter();
  const theme = useTheme();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<{ [id: string]: number | undefined }>(
    {}
  );
  const [page, setPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const loadQuizData = async () => {
      if (typeof window !== "undefined") {
        const storedData = window.sessionStorage.getItem("quizData");
        if (storedData) {
          const parsedData: QuizData = JSON.parse(storedData);
          setQuizData(parsedData);
        } else if (router.query.id) {
          // sessionStorageにデータがない場合、APIからクイズデータを取得
          try {
            const response = await fetch(`/api/quiz/${router.query.id}`);
            if (response.ok) {
              const quizData = await response.json();
              setQuizData(quizData);
              // 取得したデータをsessionStorageに保存
              window.sessionStorage.setItem("quizData", JSON.stringify(quizData));
            } else {
              console.error("クイズデータの取得に失敗しました");
              router.replace("/");
            }
          } catch (error) {
            console.error("クイズデータの取得エラー:", error);
            router.replace("/");
          }
        } else {
          // クイズデータがない場合はトップページに戻す
          router.replace("/");
        }
      }
    };

    if (router.isReady) {
      loadQuizData();
    }
  }, [router.isReady, router.query.id, router]);

  const questionsPerPage = 10;
  const currentQuestions = useMemo(() => {
    if (!quizData) return [];
    return quizData.questions.slice(
      page * questionsPerPage,
      (page + 1) * questionsPerPage
    );
  }, [page, quizData]);

  const handleBoxClick = (questionId: string, value: number | undefined) => {
    setAnswers((prev) => {
      const prevValue = prev[questionId];
      const newValue = prevValue === value ? undefined : value;
      return { ...prev, [questionId]: newValue };
    });
  };

  const handleSubmit = async () => {
    if (!quizData) return;

    try {
      const quizId = quizData.id || (router.query.id as string) || "unknown";

      // 回答データを保存
      const responseData = {
        quizId: quizId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId: questionId,
          value: value || 0,
          text: undefined,
        })),
        demographics: {},
        rating: undefined,
        location: undefined,
      };

      // 回答を保存
      const saveResponse = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      });

      if (!saveResponse.ok) {
        console.warn("回答の保存に失敗しました");
      }

      // 4軸診断システムで診断を実行
      const diagnosisResponse = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quizId,
          answers: answers, // { questionId: score } 形式
        }),
      });

      if (diagnosisResponse.ok) {
        const diagnosisData = await diagnosisResponse.json();
        
        // 新しい診断結果データを構築
        const resultData = {
          ...quizData,
          answers,
          diagnosis: diagnosisData.diagnosis,
          quizTitle: diagnosisData.quizTitle,
          quizDescription: diagnosisData.quizDescription,
        };

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("quizResult", JSON.stringify(resultData));
        }

        router.push("/result");
      } else {
        throw new Error("診断に失敗しました");
      }

    } catch (error) {
      console.error("診断処理エラー:", error);
      
      // エラー時は従来の結果表示に戻す
      const fallbackData = {
        ...quizData,
        answers,
        axes: quizData.axes || [
          {
            id: 1,
            name: "感情↔理性",
            description: "感情的か理性的かの軸",
            positiveName: "理性的",
            negativeName: "感情的"
          },
          {
            id: 2,
            name: "内向↔外向",
            description: "内向的か外向的かの軸",
            positiveName: "外向的",
            negativeName: "内向的"
          }
        ]
      };

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("quizResult", JSON.stringify(fallbackData));
      }

      router.push("/result");
    }
  };

  const goToNextPage = () => {
    const allAnswered = currentQuestions.every(
      (question) => answers[question.id] !== undefined
    );
    if (!allAnswered) {
      alert("このページのすべての質問に回答してください。");
      return;
    }
    if (quizData && (page + 1) * questionsPerPage < quizData.questions.length) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const progressPercentage = useMemo(() => {
    if (!quizData) return 0;
    const totalQuestions = quizData.questions.length;
    const answeredCount = Object.values(answers).filter(
      (value) => value !== undefined
    ).length;
    return totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  }, [answers, quizData]);

  if (!quizData) {
    // データロード中の表示
    return <Typography>Loading...</Typography>;
  }

  return (
    <Layout>
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          paddingTop: { xs: "80px", sm: "90px" }, // ヘッダー分のマージン
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
            position: "fixed",
            top: theme.spacing(8),
            left: 0,
            right: 0,
            zIndex: 9,
            backgroundColor: theme.palette.background.paper,
            opacity: isScrolling ? 1 : 0.9,
            transition: "opacity 0.3s ease-in-out",
            p: 2,
            boxShadow: theme.shadows[1],
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <Box
            sx={{
              width: { xs: "95%", lg: "75%" },
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              textAlign="center"
              sx={{
                mb: 1,
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              {quizData.title}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: { xs: 8, sm: 10 },
                borderRadius: 5,
                backgroundColor: theme.palette.divider,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
            <Typography
              sx={{
                textAlign: "center",
                mt: 1,
                fontWeight: "bold",
                fontSize: { xs: 12, sm: 14 },
                color: theme.palette.text.secondary,
              }}
            >
              回答進捗: {Math.round(progressPercentage)}%
            </Typography>
          </Box>
        </Box>

        {currentQuestions.map((question) => (
          <Box
            key={question.id}
            id={`question-${question.id}`}
            sx={{
              mt: { xs: 18, sm: 20, md: 22, lg: 24, xl: 26 },
              mx: "auto",
              width: { xs: "95%", lg: "75%" },
              maxWidth: "1200px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: 18, sm: 24 },
                textAlign: "center",
                color: theme.palette.text.primary,
              }}
            >
              {question.text}
            </Typography>

            <Box
              sx={{
                mt: { xs: 3, sm: 4, md: 5 },
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <CircleBoxBigleft
                onClick={() => handleBoxClick(question.id, 5)}
                selected={answers[question.id] === 5}
                questionId={question.id}
              />
              <CircleBoxMiddleLeft
                onClick={() => handleBoxClick(question.id, 4)}
                selected={answers[question.id] === 4}
                questionId={question.id}
              />
              <CircleBoxSmall
                onClick={() => handleBoxClick(question.id, 3)}
                selected={answers[question.id] === 3}
                questionId={question.id}
              />
              <CircleBoxMiddleRight
                onClick={() => handleBoxClick(question.id, 2)}
                selected={answers[question.id] === 2}
                questionId={question.id}
              />
              <CircleBoxBigright
                onClick={() => handleBoxClick(question.id, 1)}
                selected={answers[question.id] === 1}
                questionId={question.id}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mx: { xs: 2, sm: 4, md: 6 },
                mt: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
              >
                そう思う
              </Typography>
              <Typography
                sx={{ color: theme.palette.secondary.main, fontWeight: "bold" }}
              >
                そう思わない
              </Typography>
            </Box>
          </Box>
        ))}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "75%",
            maxWidth: "1200px",
            mt: { xs: 4, sm: 6 },
          }}
        >
          <Button
            onClick={goToPreviousPage}
            disabled={page === 0}
            variant="outlined"
            sx={{
              color: "#007AFF !important",
              borderColor: "#007AFF !important",
              backgroundColor: "#FFFFFF !important",
              borderRadius: 2,
              borderWidth: "2px !important",
              minWidth: 120,
              height: 45,
              fontWeight: "bold",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                borderColor: "#0056CC !important",
                color: "#0056CC !important",
                backgroundColor: "#F0F8FF !important",
              },
              "&:disabled": {
                borderColor: "#CCCCCC !important",
                color: "#888888 !important",
                backgroundColor: "#F5F5F5 !important",
              },
            }}
          >
            前のページ
          </Button>

          {page <
          Math.ceil(quizData.questions.length / questionsPerPage) - 1 ? (
            <Button
              onClick={goToNextPage}
              variant="contained"
              sx={{
                backgroundColor: "#007AFF !important",
                color: "#FFFFFF !important",
                borderRadius: 2,
                minWidth: 120,
                height: 45,
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "#0056CC !important",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              次のページ
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: "#4CAF50 !important",
                color: "#FFFFFF !important",
                borderRadius: 2,
                minWidth: 120,
                height: 45,
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "#388E3C !important",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              アンケートを完了する
            </Button>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

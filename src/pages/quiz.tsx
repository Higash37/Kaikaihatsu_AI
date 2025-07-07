import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import React from "react";

import Header from "@/components/Header";
import {
  CircleBoxBigleft,
  CircleBoxMiddleLeft,
  CircleBoxMiddleRight,
  CircleBoxBigright,
  CircleBoxSmall,
} from "@/components/QuizHeart";

// 新しいデータ構造に合わせた型定義
type Question = {
  id: number;
  text: string;
};

type Indicator = {
  id: number;
  name: string;
  description: string;
};

type QuizData = {
  title: string;
  questions: Question[];
  indicators: Indicator[];
};

export default function Quiz() {
  const router = useRouter();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<{ [id: number]: number | undefined }>({});
  const [page, setPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("quizData");
    if (storedData) {
      const parsedData: QuizData = JSON.parse(storedData);
      setQuizData(parsedData);
    } else {
      // クイズデータがない場合はトップページに戻す
      router.replace("/");
    }
  }, [router]);

  const questionsPerPage = 10;
  const currentQuestions = useMemo(() => {
    if (!quizData) return [];
    return quizData.questions.slice(
      page * questionsPerPage,
      (page + 1) * questionsPerPage
    );
  }, [page, quizData]);

  const handleBoxClick = (questionId: number, value: number | undefined) => {
    setAnswers((prev) => {
      const prevValue = prev[questionId];
      const newValue = prevValue === value ? undefined : value;
      return { ...prev, [questionId]: newValue };
    });
  };

  const handleSubmit = async () => {
    if (!quizData) return;

    const resultData = {
      ...quizData,
      answers,
    };

    // 診断結果をセッションストレージに保存
    sessionStorage.setItem("quizResult", JSON.stringify(resultData));
    router.push("/result");
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
    <Box
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#fff",
      }}
    >
      <Header />
      <Box
        sx={{
          position: "fixed",
          top: { xs: 80, sm: 130, md: 130, lg: 60, xl: 60 },
          left: 0,
          right: 0,
          zIndex: 9,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          opacity: isScrolling ? 1 : 0.3,
          transition: "opacity 0.3s ease-in-out",
          p: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { xs: "90%", sm: "800px" }, mx: "auto" }}>
          <Typography variant="h5" component="h1" textAlign="center" sx={{ mb: 1, fontWeight: 'bold' }}>
            {quizData.title}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ height: { xs: 8, sm: 10 }, borderRadius: 5, backgroundColor: "#e0e0e0" }}
          />
          <Typography
            sx={{ textAlign: "center", mt: 1, fontWeight: "bold", fontSize: { xs: 12, sm: 14 }}}
          >
            回答進捗: {Math.round(progressPercentage)}%
          </Typography>
        </Box>
      </Box>

      {currentQuestions.map((question) => (
        <Box
          key={question.id}
          id={`question-${question.id}`}
          sx={{ mt: { xs: 6, sm: 8, md: 10, lg: 12, xl: 14 }, mx: "auto", width: "100%", maxWidth: { xs: "90%", sm: "800px" } }}
        >
          <Typography
            sx={{ fontWeight: "bold", fontSize: { xs: 18, sm: 24 }, textAlign: "center" }}
          >
            {question.text}
          </Typography>

          <Box
            sx={{ mt: { xs: 3, sm: 4, md: 5 }, display: "flex", justifyContent: "space-around", alignItems: "center" }}
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
            sx={{ display: "flex", justifyContent: "space-between", mx: { xs: 2, sm: 4, md: 6 }, mt: { xs: 1, sm: 2 } }}
          >
            <Typography sx={{ color: "rgb(242, 135, 5)", fontWeight: "bold" }}>
              そう思う
            </Typography>
            <Typography sx={{ color: "rgb(4, 119, 191)", fontWeight: "bold" }}>
              そう思わない
            </Typography>
          </Box>
        </Box>
      ))}

      <Box
        sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: { xs: "90%", sm: "800px" }, mt: { xs: 4, sm: 6 } }}
      >
        <Button onClick={goToPreviousPage} disabled={page === 0} variant="outlined">
          前のページ
        </Button>

        {page < Math.ceil(quizData.questions.length / questionsPerPage) - 1 ? (
          <Button onClick={goToNextPage} variant="contained">
            次のページ
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" color="success">
            診断する
          </Button>
        )}
      </Box>
    </Box>
  );
}

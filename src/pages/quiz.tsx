import { ChevronLeft, ChevronRight, Check } from "@mui/icons-material";
import { Box, Button, Typography, LinearProgress, Container } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import React from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import QuestionInput from "@/components/QuestionInput";
import { Quiz as QuizType, Answer } from "@/types/quiz";

export default function Quiz() {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | number | boolean }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuiz(id as string);
    }
  }, [id]); // fetchQuizは依存配列に追加不要（関数内で定義されているため）

  const fetchQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
      } else {
        console.error('クイズの取得に失敗しました');
        router.push('/');
      }
    } catch (error) {
      console.error('クイズ取得エラー:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | number | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      // 回答データを構築
      const answersArray: Answer[] = quiz.questions.map(question => ({
        questionId: question.id,
        value: answers[question.id] || (question.type === 'scale' ? 3 : ''),
        text: question.type === 'text' ? String(answers[question.id] || '') : undefined
      }));

      const responseData = {
        quizId: quiz.id,
        answers: answersArray,
        demographics: {
          // ユーザー情報があれば追加
        }
      };

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        // 結果ページに遷移
        router.push(`/result?id=${quiz.id}`);
      } else {
        throw new Error('回答の保存に失敗しました');
      }
    } catch (error) {
      console.error('回答送信エラー:', error);
      alert('回答の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>クイズを読み込み中...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>クイズが見つかりませんでした</Typography>
        </Box>
      </Layout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  // 回答が必須かつ未入力かチェック
  const isAnswerRequired = currentQuestion.required && 
    (currentAnswer === undefined || currentAnswer === '' || currentAnswer === null);

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "70px", sm: "80px" },
          paddingBottom: "80px",
        }}
      >
        <Header />
        
        {/* プログレスバー */}
        <Box sx={{ position: 'fixed', top: { xs: 56, sm: 64 }, left: 0, right: 0, zIndex: 100, backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
          <Container maxWidth="md">
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                質問 {currentQuestionIndex + 1} / {quiz.questions.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#007AFF',
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          </Container>
        </Box>

        {/* 質問エリア */}
        <Container maxWidth="md" sx={{ pt: 8 }}>
          <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <QuestionInput
              question={currentQuestion}
              value={currentAnswer}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          </Box>

          {/* ナビゲーションボタン */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 2,
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              startIcon={<ChevronLeft />}
              sx={{ 
                minWidth: 120,
                borderRadius: 3,
                py: 1.5 
              }}
            >
              前の質問
            </Button>

            <Typography variant="body2" color="text.secondary">
              {quiz.title}
            </Typography>

            {isLastQuestion ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isAnswerRequired || isSubmitting}
                startIcon={<Check />}
                sx={{
                  minWidth: 120,
                  borderRadius: 3,
                  py: 1.5,
                  backgroundColor: '#007AFF',
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                }}
              >
                {isSubmitting ? '送信中...' : '完了'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isAnswerRequired}
                endIcon={<ChevronRight />}
                sx={{
                  minWidth: 120,
                  borderRadius: 3,
                  py: 1.5,
                  backgroundColor: '#007AFF',
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                }}
              >
                次の質問
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}
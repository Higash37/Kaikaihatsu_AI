import { Send, AutoAwesome, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";
import { Quiz } from "@/types/quiz";

export default function Home() {
  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 最近の人気クイズを取得（より多く表示）
    const fetchRecentQuizzes = async () => {
      try {
        const response = await fetch('/api/public-quizzes?limit=12');
        if (response.ok) {
          const data = await response.json();
          setRecentQuizzes(data.quizzes || []);
        }
      } catch (error) {
        console.error('最近のクイズ取得エラー:', error);
      }
    };

    fetchRecentQuizzes();
  }, []);

  const handleGenerateQuiz = async () => {
    if (!theme.trim()) {
      alert('テーマを入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      // クイズ生成APIを呼び出し
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: theme,
          questionCount: 10,
          difficulty: 'medium'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // 生成されたクイズのページに遷移
        router.push(`/quiz?id=${data.quizId}`);
      } else {
        throw new Error('クイズ生成に失敗しました');
      }
    } catch (error) {
      console.error('クイズ生成エラー:', error);
      alert('クイズの生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz?id=${quizId}`);
  };

  const handleViewAllQuizzes = () => {
    router.push('/browse'); // 既存の一覧機能は別ページに移動
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "60px", sm: "70px" },
          paddingBottom: "60px",
        }}
      >
        <Header />

        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          {/* メインのテーマ入力エリア */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  background: "linear-gradient(45deg, #007AFF 30%, #5856D6 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontSize: { xs: "1.8rem", md: "2.2rem" }
                }}
              >
                LoveNavi2
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 1.5, fontSize: { xs: "0.9rem", md: "1rem" } }}
              >
                AI でアンケートを自動生成
              </Typography>
            </Box>

            {/* ChatGPT風の入力エリア - コンパクト化 */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 2,
                border: "1px solid #e0e0e0",
                maxWidth: "700px",
                mx: "auto"
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <TextField
                  fullWidth
                  placeholder="テーマを入力（例：恋愛観、性格診断）"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: "0.9rem",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleGenerateQuiz}
                  disabled={!theme.trim() || isGenerating}
                  startIcon={isGenerating ? <AutoAwesome /> : <Send />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 0.8,
                    backgroundColor: "#007AFF",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    minWidth: "100px",
                    "&:hover": {
                      backgroundColor: "#0056CC",
                    },
                  }}
                >
                  {isGenerating ? "生成中" : "生成"}
                </Button>
              </Box>
            </Paper>
            
            {/* クイック選択 - 上部に移動 */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.8rem" }}>
                人気テーマ
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                {["恋愛観", "性格", "価値観", "ライフスタイル", "仕事観"].map((quickTheme) => (
                  <Chip
                    key={quickTheme}
                    label={quickTheme}
                    variant="outlined"
                    size="small"
                    onClick={() => setTheme(quickTheme + "診断")}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(0, 122, 255, 0.1)",
                        borderColor: "#007AFF",
                      },
                      fontSize: "0.75rem",
                      height: "24px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* 人気のアンケート - 最大コンパクト化 */}
          {recentQuizzes.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ mb: 1.5, fontWeight: "bold", textAlign: "center", fontSize: "1.1rem" }}
              >
                人気のアンケート
              </Typography>
              <Grid container spacing={1}>
                {recentQuizzes.slice(0, 9).map((quiz) => (
                  <Grid item xs={6} sm={4} md={4} key={quiz.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        height: "100%",
                        "&:hover": {
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                      onClick={() => handleQuizClick(quiz.id)}
                    >
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            mb: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "0.85rem",
                            lineHeight: 1.2,
                            minHeight: "2.1em"
                          }}
                        >
                          {quiz.title}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                            {quiz.questionCount}問
                          </Typography>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: "bold", fontSize: "0.7rem" }}>
                            {quiz.totalResponses || 0}人
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.25, flexWrap: "wrap" }}>
                          {quiz.tags.slice(0, 2).map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              sx={{ 
                                fontSize: "0.6rem", 
                                height: "18px",
                                "& .MuiChip-label": { px: 0.5 }
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* フッターボタン */}
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Button
              variant="outlined"
              onClick={handleViewAllQuizzes}
              startIcon={<TrendingUp />}
              size="small"
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 0.5,
                fontSize: "0.8rem",
              }}
            >
              もっと見る
            </Button>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}

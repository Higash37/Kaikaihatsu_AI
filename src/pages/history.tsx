import { Search, Schedule, Delete, Edit, Share } from "@mui/icons-material";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  InputAdornment,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import Header from "@/components/Header";
import Layout from "@/components/Layout";

// 仮のデータ型（後でFirestoreから取得）
interface MyQuiz {
  id: string;
  title: string;
  description: string;
  tags: string[];
  popularity: number;
  questionCount: number;
  createdAt: string;
  isPublic: boolean;
}

export default function History() {
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<MyQuiz | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 仮のデータ（後でFirestoreから取得）
    const mockQuizzes: MyQuiz[] = [
      {
        id: "1",
        title: "チームメンバーの隠れた強みを見つけるための適性診断",
        description:
          "チームの各メンバーの強みを発見し、より効果的なチーム編成を実現するための診断です。",
        tags: ["チーム", "強み", "適性"],
        popularity: 45,
        questionCount: 15,
        createdAt: "2024-01-10",
        isPublic: true,
      },
      {
        id: "2",
        title: "新入社員向けキャリア適性診断",
        description:
          "新入社員が自分に合ったキャリアパスを見つけるための診断テストです。",
        tags: ["キャリア", "新入社員", "適性"],
        popularity: 123,
        questionCount: 20,
        createdAt: "2024-01-05",
        isPublic: true,
      },
      {
        id: "3",
        title: "プライベート診断テスト",
        description: "個人用の診断テストです。",
        tags: ["プライベート", "個人"],
        popularity: 0,
        questionCount: 10,
        createdAt: "2024-01-12",
        isPublic: false,
      },
    ];

    // 実際の実装では、ここでFirestoreからユーザーの作成したクイズを取得
    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQuizzes = quizzes
    .filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz?id=${quizId}`);
  };

  const handleDeleteClick = (quiz: MyQuiz) => {
    setSelectedQuiz(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedQuiz) {
      // 実際の実装では、ここでFirestoreからデータを削除
      setQuizzes(quizzes.filter((q) => q.id !== selectedQuiz.id));
      setDeleteDialogOpen(false);
      setSelectedQuiz(null);
    }
  };

  const handleEditClick = (quizId: string) => {
    router.push(`/create?edit=${quizId}`);
  };

  const handleShareClick = (quizId: string) => {
    // 実際の実装では、共有リンクを生成
    const shareUrl = `${window.location.origin}/quiz?id=${quizId}`;
    if (typeof window !== "undefined" && window.navigator?.clipboard) {
      window.navigator.clipboard.writeText(shareUrl);
      // TODO: トースト通知を表示
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          paddingTop: { xs: "70px", sm: "80px" }, // ヘッダー分のマージン
          paddingBottom: "80px", // フッターの高さ分のパディング
        }}
      >
        <Header />

        <Box
          sx={{
            padding: { xs: 2, md: 3 },
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 1,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              作成したアンケート
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              あなたが作成したアンケートの管理
            </Typography>

            {/* 検索バー */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="アンケートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* アンケートカード一覧 */}
            <Grid container spacing={2}>
              {filteredQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* 公開状態の表示 */}
                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                          <Chip
                            label={quiz.isPublic ? "公開" : "非公開"}
                            size="small"
                            color={quiz.isPublic ? "primary" : "default"}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            pr: 8, // 公開状態ラベルのスペース
                          }}
                        >
                          {quiz.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {quiz.description}
                        </Typography>

                        {/* タグ */}
                        <Box sx={{ mb: 2 }}>
                          {quiz.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>

                        {/* 統計情報 */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {quiz.questionCount}問
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.popularity}回実施
                          </Typography>
                        </Box>

                        {/* 作成日 */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Schedule
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(quiz.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions
                        sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                      >
                        <Button
                          size="small"
                          onClick={() => handleQuizClick(quiz.id)}
                          sx={{ color: "#007AFF" }}
                        >
                          開始する
                        </Button>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(quiz.id)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleShareClick(quiz.id)}
                          >
                            <Share />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(quiz)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {filteredQuizzes.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  {searchQuery
                    ? "該当するアンケートが見つかりませんでした"
                    : "まだアンケートを作成していません"}
                </Typography>
                {!searchQuery && (
                  <Button
                    variant="contained"
                    onClick={() => router.push("/create")}
                    sx={{ mt: 2 }}
                  >
                    アンケートを作成する
                  </Button>
                )}
              </Box>
            )}
          </motion.div>
        </Box>

        {/* 削除確認ダイアログ */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>アンケートを削除しますか？</DialogTitle>
          <DialogContent>
            <Typography>
              「{selectedQuiz?.title}
              」を削除します。この操作は元に戻すことができません。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleDeleteConfirm} color="error">
              削除
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

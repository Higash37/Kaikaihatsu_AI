import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Header from "@/components/Header";

export default function Home() {
  const [theme, setTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(10); // デフォルト10問
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const muiTheme = useTheme();

  const handleGenerateQuiz = async () => {
    if (!theme.trim()) {
      setError("テーマを入力してください。");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme, questionCount }),
      });

      if (!response.ok) {
        throw new Error("アンケートの生成に失敗しました。");
      }

      const quizData = await response.json();

      // 生成されたデータをセッションストレージに保存
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("quizData", JSON.stringify(quizData));
      }

      // クイズページに遷移
      router.push("/quiz");
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: { xs: 2, md: 4 },
          position: "relative",
          backgroundColor: muiTheme.palette.background.default,
          width: "100%",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ zIndex: 2, width: "100%", maxWidth: "600px" }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 2,
              color: muiTheme.palette.text.primary,
              fontWeight: "bold",
            }}
          >
            新しいアンケートを作成
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: muiTheme.palette.text.secondary }}
          >
            作成したいアンケートのテーマを入力してください。AIが質問を生成します。
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="例：チームメンバーの隠れた強みを見つけるための適性診断"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: muiTheme.palette.background.paper,
                "& fieldset": {
                  borderColor: muiTheme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: muiTheme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: muiTheme.palette.primary.main,
                },
              },
            }}
          />

          {/* 問題数選択ドロップダウン */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="question-count-label">問題数</InputLabel>
            <Select
              labelId="question-count-label"
              id="question-count-select"
              value={questionCount}
              label="問題数"
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: muiTheme.palette.background.paper,
                },
                "& fieldset": {
                  borderColor: muiTheme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: muiTheme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: muiTheme.palette.primary.main,
                },
              }}
            >
              <MenuItem value={5}>5問</MenuItem>
              <MenuItem value={10}>10問</MenuItem>
              <MenuItem value={15}>15問</MenuItem>
              <MenuItem value={20}>20問</MenuItem>
              <MenuItem value={25}>25問</MenuItem>
              <MenuItem value={30}>30問</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateQuiz}
            disabled={loading}
            sx={{
              width: "100%",
              py: 2,
              fontSize: "1.2rem",
              fontWeight: "bold",
              backgroundColor: "#007AFF !important",
              color: "#FFFFFF !important",
              borderRadius: 2,
              boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#0056CC !important",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
              },
              "&:focus": {
                backgroundColor: "#007AFF !important",
              },
              "&.Mui-disabled": {
                backgroundColor: "#CCCCCC !important",
                color: "#888888 !important",
                opacity: "0.7 !important",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              "アンケートを生成する"
            )}
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </motion.div>
      </Box>
    </motion.div>
  );
}

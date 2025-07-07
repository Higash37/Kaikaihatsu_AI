import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useRouter } from "next/router";

import HeartGradient from "@/components/HalfBlueOrangeHeart";
import Header from "@/components/Header";
import {
  BackgroundAnimation,
  HeartMarkBackground,
} from "@/components/home";

export default function Home() {
  const [showLines, setShowLines] = useState(false);
  const [isBackgroundAnimated, setIsBackgroundAnimated] = useState(false);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerateQuiz = async () => {
    if (!theme.trim()) {
      setError("テーマを入力してください。");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('クイズの生成に失敗しました。');
      }

      const quizData = await response.json();
      
      // 生成されたクイズデータをセッションストレージに保存
      sessionStorage.setItem('quizData', JSON.stringify(quizData));

      // クイズページに遷移
      router.push('/quiz');

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
      onAnimationComplete={() => setShowLines(true)}
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
          overflow: "hidden",
        }}
      >
        <BackgroundAnimation
          showLines={showLines}
          isBackgroundAnimated={isBackgroundAnimated}
          onLinesAnimationComplete={() => setIsBackgroundAnimated(true)}
        />

        {isBackgroundAnimated && <HeartMarkBackground />}
        {showLines && <HeartGradient />}

        <Header />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ zIndex: 2, width: '100%', maxWidth: '600px' }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
            オリジナル診断を作成
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'white' }}>
            診断したいテーマを入力してください。AIがあなただけの診断クイズを生成します。
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
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
              },
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateQuiz}
            disabled={loading}
            sx={{
              width: '100%',
              py: 1.5,
              fontSize: '1.2rem',
              backgroundColor: '#ff6b6b',
              '&:hover': {
                backgroundColor: '#ff4757',
              },
            }}
          >
            {loading ? <CircularProgress size={28} color="inherit" /> : "診断クイズを生成する"}
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

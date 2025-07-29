import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Header from "../components/Header";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/SupabaseAuthContext";

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError("");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (tabValue === 0) {
        // ログイン
        await signIn(email, password);
      } else {
        // サインアップ
        if (!email || !password || !username) {
          throw new Error("すべての項目を入力してください");
        }
        await signUp(email, password, username);
      }
      router.push("/");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "認証エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomUserLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      // RFC 2606準拠のテスト用ドメインを使用
      const testEmail = "testuser@example.com";
      const testUsername = "テストユーザー";
      const testPassword = "password123";

      // サインアップを試行、既に存在する場合はログイン
      try {
        console.log('Attempting to sign up with:', testEmail);
        await signUp(testEmail, testPassword, testUsername);
        console.log('Sign up successful');
      } catch (signUpError: any) {
        console.error('Sign up error:', signUpError);
        if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
          console.log('User exists, attempting to sign in');
          await signIn(testEmail, testPassword);
        } else {
          throw signUpError;
        }
      }
      
      // 少し待ってからリダイレクト（認証状態の更新を待つ）
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Random user login error:", err);
      setError(err.message || "ランダムユーザーログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          minHeight: "calc(100vh - 140px)", // ヘッダー(70px) + フッター(70px)を考慮
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          paddingTop: { xs: "80px", md: "0px" }, // ヘッダー70px + 15px余白
          paddingBottom: { xs: "100px", md: "30px" }, // フッターの高さ + 余白
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ flex: 1, display: "flex", alignItems: "center", py: 2 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              transform: { md: "scale(0.8)" }, // PCで75%のサイズに
              transformOrigin: "center",
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center">
              SciscitorAI
            </Typography>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                mb: 3,
                "& .MuiTab-root": {
                  color: "#666666 !important",
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "#667eea !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea !important",
                },
              }}
            >
              <Tab label="ログイン" />
              <Tab label="サインアップ" />
            </Tabs>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              {tabValue === 1 && (
                <TextField
                  fullWidth
                  label="ユーザー名"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  helperText="3文字以上で入力してください"
                />
              )}
              <TextField
                fullWidth
                label="パスワード"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                helperText={tabValue === 1 ? "6文字以上で入力してください" : ""}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mb: 2,
                  backgroundColor: "#667eea !important",
                  color: "#ffffff !important",
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  "&:hover": {
                    backgroundColor: "#5a67d8 !important",
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc !important",
                    color: "#888888 !important",
                    boxShadow: 'none',
                    transform: 'none',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {isLoading
                  ? "処理中..."
                  : tabValue === 0
                    ? "ログイン"
                    : "サインアップ"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleRandomUserLogin}
                disabled={isLoading}
                sx={{
                  mb: 2,
                  borderColor: "#667eea",
                  color: "#667eea",
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#5a67d8",
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                    color: "#5a67d8",
                  },
                  "&:disabled": {
                    borderColor: "#cccccc",
                    color: "#888888",
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                ランダムユーザーとしてログイン
              </Button>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              {tabValue === 0
                ? "アカウントをお持ちでない場合は、"
                : "すでにアカウントをお持ちの場合は、"}{" "}
              <Button
                variant="text"
                onClick={() => setTabValue(tabValue === 0 ? 1 : 0)}
                sx={{
                  textTransform: "none",
                  color: "#667eea",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                  },
                }}
              >
                {tabValue === 0 ? "サインアップ" : "ログイン"}
              </Button>
              してください。
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default AuthPage;

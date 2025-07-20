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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";

import Header from "../components/Header";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";

import { UserRole } from "@/types/quiz";

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("creator");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();
  const router = useRouter();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (tabValue === 0) {
        await login(username, password);
      } else {
        await signup(username, password, userRole);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          // Layout のpaddingTop を上書きして調整
          marginTop: { xs: "-70px", sm: "-80px", md: "-100px" }, // PC版では上部マージンを少なくする
          paddingTop: { xs: "70px", sm: "80px", md: "20px" }, // PC版では上部マージンを少なくする
        }}
      >
        <Header />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: 2, md: 4 },
            paddingTop: { xs: 2, md: 2 }, // PC版では上部マージンを少なくする
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
              >
                LoveNavi
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
                    color: "#1976d2 !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#1976d2 !important",
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
                  label="ユーザー名"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  helperText={
                    tabValue === 1 ? "3文字以上で入力してください" : ""
                  }
                />
                <TextField
                  fullWidth
                  label="パスワード"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  helperText={
                    tabValue === 1 ? "6文字以上で入力してください" : ""
                  }
                />

                {/* 新規登録時のみユーザーロール選択を表示 */}
                {tabValue === 1 && (
                  <Card sx={{ mb: 3, bgcolor: "#f8f9fa" }}>
                    <CardContent>
                      <FormControl component="fieldset">
                        <FormLabel
                          component="legend"
                          sx={{ mb: 2, fontWeight: "bold" }}
                        >
                          アカウントタイプを選択してください
                        </FormLabel>
                        <RadioGroup
                          value={userRole}
                          onChange={(e) =>
                            setUserRole(e.target.value as UserRole)
                          }
                        >
                          <FormControlLabel
                            value="respondent"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  回答者
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  クイズに回答して結果を楽しみたい方
                                </Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="creator"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  作成者
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  クイズを作成して分析データを確認したい方
                                </Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    mb: 2,
                    backgroundColor: "#1976d2 !important",
                    color: "#ffffff !important",
                    "&:hover": {
                      backgroundColor: "#1565c0 !important",
                    },
                    "&:disabled": {
                      backgroundColor: "#cccccc !important",
                      color: "#888888 !important",
                    },
                  }}
                >
                  {isLoading
                    ? "処理中..."
                    : tabValue === 0
                      ? "ログイン"
                      : "サインアップ"}
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
                    color: "#1976d2 !important",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.04) !important",
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
      </Box>
    </Layout>
  );
};

export default AuthPage;

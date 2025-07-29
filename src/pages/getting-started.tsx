import {
  AccountCircle,
  Create,
  Quiz,
  Analytics,
  CheckCircle,
  Star,
  Speed,
  Security,
  Group,
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import Layout from "../components/Layout";

const steps = [
  {
    label: "アカウント作成",
    description: "まずはアカウントを作成してSciscitorAIを始めましょう",
    icon: <AccountCircle />,
    content: [
      "右上の「ログイン」ボタンをクリック",
      "「サインアップ」タブを選択",
      "ユーザー名とパスワードを入力",
      "「サインアップ」ボタンでアカウント作成完了",
    ],
  },
  {
    label: "アンケート作成",
    description: "AIを使って簡単にアンケートを作成できます",
    icon: <Create />,
    content: [
      "ホームページで「新しいアンケートを作成」を選択",
      "アンケートのテーマを入力（例：チーム診断、適性検査など）",
      "問題数を選択（5問〜30問）",
      "AIが自動で質問を生成します",
    ],
  },
  {
    label: "アンケート実施",
    description: "ハート型のボタンで楽しくアンケートに回答",
    icon: <Quiz />,
    content: [
      "生成された質問に順番に回答",
      "ハート型のボタンから最適な答えを選択",
      "自動スクロールで次の質問に移動",
      "すべての質問に回答完了",
    ],
  },
  {
    label: "結果確認",
    description: "AIが分析した結果を確認し、保存できます",
    icon: <Analytics />,
    content: [
      "アンケート結果の詳細分析を確認",
      "結果をデータベースに保存",
      "過去の結果履歴を確認",
      "データの傾向を分析",
    ],
  },
];

const features = [
  {
    icon: <Star />,
    title: "AI自動生成",
    description: "高度なAIがテーマに応じて最適な質問を自動生成",
  },
  {
    icon: <Speed />,
    title: "簡単操作",
    description: "直感的なハート型UIで楽しく回答できる",
  },
  {
    icon: <Security />,
    title: "セキュア",
    description: "Firebase認証でデータを安全に保護",
  },
  {
    icon: <Group />,
    title: "チーム対応",
    description: "個人からチーム診断まで幅広く対応",
  },
];

const GettingStartedPage: React.FC = () => {
  const router = useRouter();

  return (
    <Layout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          minHeight: "100vh",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              SciscitorAIをはじめよう
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              AIを活用した次世代アンケートシステム
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 4 }}
            >
              <Chip label="無料" color="primary" />
              <Chip label="AI搭載" color="secondary" />
              <Chip label="簡単操作" color="success" />
            </Box>
          </Box>

          {/* 機能紹介 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
              主な機能
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: "100%", textAlign: "center" }}>
                    <CardContent>
                      <Box sx={{ color: "primary.main", mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 使い方手順 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
              使い方
            </Typography>
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <Stepper orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={index} active={true}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "primary.main",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {step.icon}
                        </Box>
                      )}
                    >
                      <Typography variant="h6">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                      <List dense>
                        {step.content.map((item, itemIndex) => (
                          <ListItem key={itemIndex}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>

          {/* アクションボタン */}
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <Typography variant="h5" gutterBottom>
              今すぐ始めましょう！
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              無料でアカウントを作成して、AIアンケートを体験してみてください
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/auth")}
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "grey.100",
                  },
                }}
              >
                アカウント作成
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                ホームに戻る
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default GettingStartedPage;

import {
  ExpandMore,
  Email,
  QuestionAnswer,
  Settings,
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
} from "@mui/material";
import React from "react";

import Layout from "../components/layout/Layout";

const faqs = [
  {
    question: "アカウントを作成する必要はありますか？",
    answer:
      "はい、アンケートの作成と結果の保存にはアカウントが必要です。右上の「ログイン」ボタンから無料でアカウントを作成できます。",
  },
  {
    question: "アンケートの質問数は変更できますか？",
    answer:
      "はい、アンケート生成時に5問から30問まで選択できます。用途に応じて最適な問題数を選択してください。",
  },
  {
    question: "どのようなテーマでアンケートを作成できますか？",
    answer:
      "恋愛診断、性格分析、チーム適性診断、職業適性、趣味診断など、様々なテーマに対応しています。具体的で明確なテーマを入力することで、より精度の高い質問が生成されます。",
  },
  {
    question: "アンケート結果はどこに保存されますか？",
    answer:
      "回答結果は安全なデータベースに保存され、アカウントと紐付けて管理されます。個人情報は適切に保護されています。",
  },
  {
    question: "アンケートを他の人と共有できますか？",
    answer:
      "現在のバージョンでは、生成されたアンケートを他の人と共有する機能は提供していません。今後のアップデートで追加予定です。",
  },
  {
    question: "パスワードを忘れた場合はどうすればいいですか？",
    answer:
      "現在のバージョンではパスワードリセット機能は提供していません。サポートまでお問い合わせください。",
  },
];

const HelpPage: React.FC = () => {
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
        <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            ヘルプ・サポート
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            よくある質問とサポート情報
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center" }}>
                  <QuestionAnswer
                    sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    よくある質問
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    一般的な質問と回答を確認できます
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Settings
                    sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    設定・カスタマイズ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    アカウント設定やアプリの使い方を確認
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Email sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    お問い合わせ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    解決しない問題はサポートへ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            よくある質問
          </Typography>

          <Box sx={{ mb: 6 }}>
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Paper elevation={1} sx={{ p: 3, backgroundColor: "grey.50" }}>
            <Typography variant="h6" gutterBottom>
              問題が解決しませんか？
            </Typography>
            <Typography variant="body1" paragraph>
              上記の質問で解決しない場合は、サポートチームまでお気軽にお問い合わせください。
              できるだけ早く回答いたします。
            </Typography>
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Email />}
                href="mailto:support@lovenavi.com"
                sx={{ mr: 2 }}
              >
                サポートに連絡
              </Button>
              <Button variant="outlined" size="large" href="/getting-started">
                使い方ガイド
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default HelpPage;

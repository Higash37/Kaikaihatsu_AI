import { Person, Security, Notifications, Delete } from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
} from "@mui/material";
import React, { useState } from "react";

import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import UserProfileForm from "../components/UserProfileForm";
import { useAuth } from "../contexts/AuthContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSaveSettings = () => {
    // TODO: 設定保存のAPI呼び出し
    setSuccessMessage("設定を保存しました");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteAccount = () => {
    // TODO: アカウント削除のAPI呼び出し
    setDeleteDialogOpen(false);
    // ログアウト処理等
  };

  return (
    <Layout>
      <ProtectedRoute>
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
            paddingBottom: "80px", // フッターの高さ分のパディング
          }}
        >
          <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
              設定
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              アカウント設定とプロフィール管理
            </Typography>

            {/* タブナビゲーション */}
            <Card sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="settings tabs"
                centered
              >
                <Tab label="プロフィール" />
                <Tab label="アプリ設定" />
                <Tab label="プライバシー" />
                <Tab label="アカウント" />
              </Tabs>
            </Card>

            {/* タブコンテンツ */}
            <TabPanel value={currentTab} index={0}>
              <UserProfileForm />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Notifications sx={{ mr: 1, verticalAlign: "middle" }} />
                    アプリケーション設定
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="通知を有効にする"
                        secondary="新しいコメントやアップデートの通知を受け取る"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemText
                        primary="自動保存"
                        secondary="作業内容を自動的に保存する"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <Button
                    variant="contained"
                    onClick={handleSaveSettings}
                    sx={{ mt: 2 }}
                  >
                    設定を保存
                  </Button>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Security sx={{ mr: 1, verticalAlign: "middle" }} />
                    プライバシー設定
                  </Typography>

                  <Typography variant="body1" paragraph>
                    プライバシー設定は「プロフィール」タブで管理できます。
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    • データ収集の許可/拒否
                    <br />
                    • 位置情報の利用設定
                    <br />• プロフィールデータの共有設定
                  </Typography>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                    アカウント情報
                  </Typography>

                  <TextField
                    label="ユーザー名"
                    value={user?.username || ""}
                    disabled
                    fullWidth
                    margin="normal"
                  />

                  <TextField
                    label="ユーザーID"
                    value={user?.id || ""}
                    disabled
                    fullWidth
                    margin="normal"
                  />

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom color="error">
                      危険な操作
                    </Typography>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDeleteDialogOpen(true)}
                      startIcon={<Delete />}
                    >
                      アカウントを削除
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {/* 削除確認ダイアログ */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>アカウントの削除</DialogTitle>
              <DialogContent>
                <Typography>
                  アカウントを削除すると、すべてのデータが完全に削除されます。
                  この操作は取り消すことができません。本当に削除しますか？
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleDeleteAccount} color="error">
                  削除する
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </ProtectedRoute>
    </Layout>
  );
};

export default SettingsPage;

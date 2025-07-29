import { 
  Security, 
  Notifications, 
  ChevronRight,
  AccountCircle,
  Language,
  Palette,
  Storage,
  Info,
  Lock,
  Email,
  Share,
  CloudUpload,
  Download,
  Warning
} from "@mui/icons-material";
import {
  Container,
  Typography,
  Box,
  Button,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  ListItemButton,
  Divider,
  useTheme,
  Paper,
} from "@mui/material";
import React, { useState } from "react";

import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/SupabaseAuthContext";

// カスタムListItemコンポーネント
interface SettingsListItemProps {
  icon?: React.ReactNode;
  primary: string;
  secondary?: string;
  onClick?: () => void;
  action?: React.ReactNode;
  showChevron?: boolean;
}

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  icon,
  primary,
  secondary,
  onClick,
  action,
  showChevron = false,
}) => {
  const theme = useTheme();
  
  return (
    <ListItemButton 
      onClick={onClick}
      sx={{ 
        py: 1.5,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      {icon && (
        <ListItemIcon sx={{ minWidth: 40 }}>
          {icon}
        </ListItemIcon>
      )}
      <ListItemText 
        primary={primary} 
        secondary={secondary}
        primaryTypographyProps={{
          fontSize: '1rem',
          fontWeight: 400,
        }}
        secondaryTypographyProps={{
          fontSize: '0.875rem',
          color: 'text.secondary'
        }}
      />
      {action && (
        <ListItemSecondaryAction>
          {action}
        </ListItemSecondaryAction>
      )}
      {showChevron && (
        <ChevronRight sx={{ color: theme.palette.text.secondary }} />
      )}
    </ListItemButton>
  );
};

// セクションコンポーネント
interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography 
          variant="body2" 
          sx={{ 
            px: 2, 
            py: 1, 
            color: theme.palette.text.secondary,
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          {title}
        </Typography>
      )}
      <Paper 
        elevation={0} 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <List sx={{ py: 0 }}>
          {children}
        </List>
      </Paper>
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shareData, setShareData] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [_activeSection, setActiveSection] = useState<string | null>(null);

  const _handleSaveSettings = () => {
    // TODO: 設定保存のAPI呼び出し
    setSuccessMessage("設定を保存しました");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteAccount = () => {
    // TODO: アカウント削除のAPI呼び出し
    setDeleteDialogOpen(false);
    // ログアウト処理等
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    // ここで各セクションの詳細画面へ遷移する処理を追加
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
            backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#f5f5f7',
            paddingBottom: "80px",
          }}
        >
          <Container maxWidth="sm" sx={{ py: 2, mt: 8 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                px: 2
              }}
            >
              設定
            </Typography>

            {/* プロフィールセクション */}
            <SettingsSection>
              <SettingsListItem
                icon={<AccountCircle sx={{ color: theme.palette.primary.main }} />}
                primary={user?.username || "ユーザー"}
                secondary="プロフィールを編集"
                onClick={() => handleSectionClick('profile')}
                showChevron
              />
            </SettingsSection>

            {/* 一般設定セクション */}
            <SettingsSection title="一般">
              <SettingsListItem
                icon={<Notifications sx={{ color: '#ff9500' }} />}
                primary="通知"
                secondary={notifications ? "オン" : "オフ"}
                action={
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
              <Divider />
              <SettingsListItem
                icon={<Email sx={{ color: '#007aff' }} />}
                primary="メール通知"
                secondary={emailNotifications ? "オン" : "オフ"}
                action={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
              <Divider />
              <SettingsListItem
                icon={<CloudUpload sx={{ color: '#34c759' }} />}
                primary="自動保存"
                secondary={autoSave ? "オン" : "オフ"}
                action={
                  <Switch
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
            </SettingsSection>

            {/* 表示とサウンドセクション */}
            <SettingsSection title="表示とサウンド">
              <SettingsListItem
                icon={<Palette sx={{ color: '#5856d6' }} />}
                primary="ダークモード"
                secondary={darkMode ? "オン" : "オフ"}
                action={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
              <Divider />
              <SettingsListItem
                icon={<Language sx={{ color: '#ff3b30' }} />}
                primary="言語"
                secondary="日本語"
                onClick={() => handleSectionClick('language')}
                showChevron
              />
            </SettingsSection>

            {/* プライバシーセクション */}
            <SettingsSection title="プライバシー">
              <SettingsListItem
                icon={<Lock sx={{ color: '#ff3b30' }} />}
                primary="プライバシー設定"
                secondary="データの収集と使用"
                onClick={() => handleSectionClick('privacy')}
                showChevron
              />
              <Divider />
              <SettingsListItem
                icon={<Share sx={{ color: '#007aff' }} />}
                primary="データ共有"
                secondary={shareData ? "許可" : "拒否"}
                action={
                  <Switch
                    checked={shareData}
                    onChange={(e) => setShareData(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
            </SettingsSection>

            {/* データ管理セクション */}
            <SettingsSection title="データ管理">
              <SettingsListItem
                icon={<Storage sx={{ color: '#5856d6' }} />}
                primary="ストレージ"
                secondary="キャッシュとデータを管理"
                onClick={() => handleSectionClick('storage')}
                showChevron
              />
              <Divider />
              <SettingsListItem
                icon={<Download sx={{ color: '#34c759' }} />}
                primary="データをエクスポート"
                secondary="すべてのデータをダウンロード"
                onClick={() => handleSectionClick('export')}
                showChevron
              />
            </SettingsSection>

            {/* サポートセクション */}
            <SettingsSection title="サポート">
              <SettingsListItem
                icon={<Info sx={{ color: '#007aff' }} />}
                primary="バージョン情報"
                secondary="v1.0.0"
                onClick={() => handleSectionClick('about')}
                showChevron
              />
              <Divider />
              <SettingsListItem
                icon={<Security sx={{ color: '#ff9500' }} />}
                primary="利用規約"
                onClick={() => handleSectionClick('terms')}
                showChevron
              />
            </SettingsSection>

            {/* 危険な操作セクション */}
            <SettingsSection>
              <SettingsListItem
                icon={<Warning sx={{ color: '#ff3b30' }} />}
                primary="アカウントを削除"
                onClick={() => setDeleteDialogOpen(true)}
              />
            </SettingsSection>

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

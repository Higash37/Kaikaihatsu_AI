import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { useAuth } from "../contexts/SupabaseAuthContext";
import { getUserInitials, getSafeDisplayName } from "@/utils/userDisplay";

const Header = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const theme = useTheme();
  const { user, profile, signOut } = useAuth();
  
  console.log('Header - Current user:', user, 'Profile:', profile);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<any>(null);

  const handleMenuClick = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClick = (event: React.MouseEvent<any>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleMenuClose();
    router.push("/");
  };

  const navigateTo = (path: string) => {
    router.push(path);
    handleMenuClose();
  };


  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: { xs: 60, sm: 70 },
        width: "100vw",
        padding: { xs: "0 16px", md: "0 24px" },
        backgroundColor: theme.palette.background.paper,
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1100,
      }}
    >
      {/* ロゴ部分 */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isHome ? (
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
          >
            SciscitorAI
          </Typography>
        ) : (
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              SciscitorAI
            </Typography>
          </Link>
        )}
      </Box>

      {/* ナビゲーションメニュー */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* デスクトップメニュー */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {/* 一般的なナビゲーション */}
          <Button
            color="inherit"
            onClick={() => navigateTo("/getting-started")}
            sx={{ 
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              py: 0.5,
              color: '#4a5568',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
              }
            }}
          >
            はじめに
          </Button>
          <Button
            color="inherit"
            onClick={() => navigateTo("/help")}
            sx={{ 
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              py: 0.5,
              color: '#4a5568',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
              }
            }}
          >
            ヘルプ
          </Button>

          {/* ログインユーザー向けナビゲーション */}
          {user && (
            <>
              <Button
                color="inherit"
                onClick={() => navigateTo("/create")}
                sx={{ 
                  textTransform: "none", 
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  color: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    color: '#5a67d8',
                  }
                }}
              >
                クイズ作成
              </Button>
              <Button
                color="inherit"
                onClick={() => navigateTo("/history")}
                sx={{ 
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  color: '#4a5568',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                  }
                }}
              >
                履歴・分析
              </Button>
            </>
          )}
        </Box>

        {/* ユーザーメニュー */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleMenuClick}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#667eea',
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    backgroundColor: '#5a67d8',
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out',
                  }
                }}
              >
                {getUserInitials(profile?.username)}
              </Avatar>
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => navigateTo("/auth")}
            sx={{
              textTransform: "none",
              backgroundColor: "#667eea !important",
              color: "#ffffff !important",
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              "&:hover": {
                backgroundColor: "#5a67d8 !important",
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)',
              },
              "&:focus": {
                backgroundColor: "#667eea !important",
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            ログイン
          </Button>
        )}

        {/* モバイルメニューボタン */}
        <IconButton
          sx={{ display: { xs: "flex", md: "none" } }}
          onClick={handleMobileMenuClick}
        >
          <MenuIcon />
        </IconButton>

        {/* ユーザーメニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem disabled>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={getSafeDisplayName(profile?.username)} />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => navigateTo("/settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="設定" />
          </MenuItem>
          <MenuItem onClick={() => navigateTo("/help")}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="ヘルプ" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="ログアウト" />
          </MenuItem>
        </Menu>

        {/* モバイルメニュー */}
        <Menu
          anchorEl={mobileMenuAnchorEl}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={() => navigateTo("/")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="ホーム" />
          </MenuItem>
          <MenuItem onClick={() => navigateTo("/getting-started")}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="はじめに" />
          </MenuItem>
          <MenuItem onClick={() => navigateTo("/help")}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="ヘルプ" />
          </MenuItem>

          {/* ログインユーザー向けメニュー */}
          {user && <Divider />}
          {user && (
            <MenuItem onClick={() => navigateTo("/create")}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="クイズ作成" />
            </MenuItem>
          )}
          {user && (
            <MenuItem onClick={() => navigateTo("/history")}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="履歴・分析" />
            </MenuItem>
          )}
          {user && <Divider />}
          {user && (
            <MenuItem onClick={() => navigateTo("/settings")}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="設定" />
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;

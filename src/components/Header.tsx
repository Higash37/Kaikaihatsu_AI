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

import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const theme = useTheme();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push("/");
  };

  const navigateTo = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  const getUserInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
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
        zIndex: 10,
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
            LoveNavi
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
              LoveNavi
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
            sx={{ textTransform: "none" }}
          >
            はじめに
          </Button>
          <Button
            color="inherit"
            onClick={() => navigateTo("/help")}
            sx={{ textTransform: "none" }}
          >
            ヘルプ
          </Button>

          {/* ログインユーザー向けナビゲーション */}
          {user && (
            <>
              <Button
                color="inherit"
                onClick={() => navigateTo("/create")}
                sx={{ textTransform: "none", fontWeight: "bold" }}
              >
                クイズ作成
              </Button>
              <Button
                color="inherit"
                onClick={() => navigateTo("/history")}
                sx={{ textTransform: "none" }}
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
                  backgroundColor: theme.palette.primary.main,
                  fontSize: "0.875rem",
                }}
              >
                {getUserInitials(user.username)}
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
              backgroundColor: "#1976d2 !important",
              color: "#ffffff !important",
              "&:hover": {
                backgroundColor: "#1565c0 !important",
              },
              "&:focus": {
                backgroundColor: "#1976d2 !important",
              },
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
            <ListItemText primary={user?.username} />
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
          {user && (
            <>
              <Divider />
              <MenuItem onClick={() => navigateTo("/create")}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="クイズ作成" />
              </MenuItem>
              <MenuItem onClick={() => navigateTo("/history")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="履歴・分析" />
              </MenuItem>
            </>
          )}

          {user && (
            <>
              <Divider />
              <MenuItem onClick={() => navigateTo("/settings")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="設定" />
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;

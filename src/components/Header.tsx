import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const theme = useTheme();

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: { xs: 60, sm: 70 }, // ヘッダーの高さを調整
        width: "100vw",
        padding: { xs: "0 16px", md: "0 24px" },
        backgroundColor: theme.palette.background.paper, // テーマの背景色を適用
        boxShadow: "none", // 影を削除
        borderBottom: `1px solid ${theme.palette.divider}`, // 下線を追加
        zIndex: 10,
      }}
    >
      {/* ホームの場合はリンクなし */}
      {isHome ? (
        <Typography
          variant="h5"
          component="h1"
          sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
        >
          QuestionnaireApp
        </Typography>
      ) : (
        // ホーム以外ではリンク化
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
            QuestionnaireApp
          </Typography>
        </Link>
      )}
    </Box>
  );
};

export default Header;

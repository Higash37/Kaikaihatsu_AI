import { Box } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import TabBarFooter from "./NavigationBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  // タブバーフッターを表示しないページ
  const hideTabBarPages = ["/getting-started", "/quiz", "/result"];
  const showTabBar = !hideTabBarPages.includes(router.pathname);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          // ヘッダーのマージン（高さ + 余白）
          paddingTop: { xs: "10px", sm: "80px" },
          // フッターのマージン（高さ + 余白）
          paddingBottom: showTabBar ? "0px" : "10px",
        }}
      >
        {children}
      </Box>
      <TabBarFooter show={showTabBar} />
    </Box>
  );
};

export default Layout;

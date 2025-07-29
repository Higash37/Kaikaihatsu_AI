import { Home, Add, History, Settings } from "@mui/icons-material";
import { Box, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { useAuth } from "../contexts/SupabaseAuthContext";

interface TabBarFooterProps {
  show?: boolean;
}

const TabBarFooter: React.FC<TabBarFooterProps> = ({ show = true }) => {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [clickedTab, setClickedTab] = useState<number | null>(null);

  // 現在のパスに基づいてアクティブタブを設定
  useEffect(() => {
    const path = router.pathname;
    switch (path) {
      case "/":
        setActiveTab(0);
        break;
      case "/create":
        setActiveTab(1);
        break;
      case "/history":
        setActiveTab(2);
        break;
      case "/settings":
        setActiveTab(3);
        break;
      case "/analytics":
        setActiveTab(-1); // 分析ページでは何も選択しない
        break;
      case "/quiz":
        setActiveTab(-1); // クイズページでは何も選択しない
        break;
      case "/auth":
        setActiveTab(-1); // 認証ページでは何も選択しない
        // 認証ページから他のページに移動した時はclickedTabをリセット
        if (clickedTab !== null) {
          setTimeout(() => setClickedTab(null), 100);
        }
        break;
      default:
        setActiveTab(-1); // その他のページでは何も選択しない
    }
  }, [router.pathname, clickedTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setClickedTab(newValue); // クリックされたタブを記録
    
    switch (newValue) {
      case 0:
        router.push("/");
        break;
      case 1:
        // 一時的に認証チェックを無効化
        router.push("/create");
        break;
      case 2:
        // 一時的に認証チェックを無効化
        router.push("/history");
        break;
      case 3:
        // 一時的に認証チェックを無効化
        router.push("/settings");
        break;
    }
  };

  if (!show) return null;


  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        boxShadow: "0 -4px 12px rgba(102, 126, 234, 0.1)",
      }}
    >
      <BottomNavigation
        value={router.pathname === "/auth" && clickedTab !== null ? clickedTab : activeTab}
        onChange={handleTabChange}
        sx={{
          height: 70,
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "8px 12px",
            margin: "0 2px",
            "&.Mui-selected": {
              color: "#667eea",
              fontWeight: 600,
              "& .MuiSvgIcon-root": {
                color: "#667eea",
                fontSize: "1.3rem",
              }
            },
            "& .MuiTouchRipple-root": {
              display: "none",
            },
          },
        }}
        showLabels
      >
        <BottomNavigationAction
          label="ホーム"
          icon={<Home />}
          disableRipple
          sx={{
            "&.Mui-selected": {
              color: "#667eea",
            },
          }}
        />
        <BottomNavigationAction
          label="作成"
          icon={<Add />}
          disableRipple
          sx={{
            "&.Mui-selected": {
              color: "#667eea",
            },
          }}
        />
        <BottomNavigationAction
          label="履歴"
          icon={<History />}
          disableRipple
          sx={{
            "&.Mui-selected": {
              color: "#667eea",
            },
          }}
        />
        <BottomNavigationAction
          label="設定"
          icon={<Settings />}
          disableRipple
          sx={{
            "&.Mui-selected": {
              color: "#667eea",
            },
          }}
        />
      </BottomNavigation>
    </Box>
  );
};

export default TabBarFooter;
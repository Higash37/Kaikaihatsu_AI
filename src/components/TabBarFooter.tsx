import { Home, Add, History, Settings } from "@mui/icons-material";
import { Box, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { useAuth } from "../contexts/AuthContext";

interface TabBarFooterProps {
  show?: boolean;
}

const TabBarFooter: React.FC<TabBarFooterProps> = ({ show = true }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

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
      default:
        setActiveTab(0);
    }
  }, [router.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    switch (newValue) {
      case 0:
        router.push("/");
        break;
      case 1:
        // 作成ページは認証が必要
        if (!user) {
          router.push("/auth");
        } else {
          router.push("/create");
        }
        break;
      case 2:
        // 履歴ページも認証が必要
        if (!user) {
          router.push("/auth");
        } else {
          router.push("/history");
        }
        break;
      case 3:
        // 設定ページも認証が必要
        if (!user) {
          router.push("/auth");
        } else {
          router.push("/settings");
        }
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
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#ffffff",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <BottomNavigation
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          height: 70,
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: "8px 12px",
            "&.Mui-selected": {
              color: "#007AFF",
            },
          },
        }}
      >
        <BottomNavigationAction
          label="ホーム"
          icon={<Home />}
          sx={{
            "&.Mui-selected": {
              color: "#007AFF !important",
            },
          }}
        />
        <BottomNavigationAction
          label="作成"
          icon={<Add />}
          sx={{
            "&.Mui-selected": {
              color: "#007AFF !important",
            },
          }}
        />
        <BottomNavigationAction
          label="履歴"
          icon={<History />}
          sx={{
            "&.Mui-selected": {
              color: "#007AFF !important",
            },
          }}
        />
        <BottomNavigationAction
          label="設定"
          icon={<Settings />}
          sx={{
            "&.Mui-selected": {
              color: "#007AFF !important",
            },
          }}
        />
      </BottomNavigation>
    </Box>
  );
};

export default TabBarFooter;

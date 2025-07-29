import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { useAuth } from "../contexts/SupabaseAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 一時的に認証チェックを無効化
  return <>{children}</>;
};

export default ProtectedRoute;

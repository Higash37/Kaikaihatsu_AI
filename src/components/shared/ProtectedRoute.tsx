import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 一時的に認証チェックを無効化
  return <>{children}</>;
};

export default ProtectedRoute;

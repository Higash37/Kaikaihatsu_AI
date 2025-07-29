import { Box, Container, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

import { useAuth } from "../contexts/SupabaseAuthContext";

const Footer: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      router.push("/auth");
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        px: 2,
        backgroundColor: "primary.main",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" component="div">
            SciscitorAI
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user && (
              <Typography variant="body2">
                {user.username}としてログイン中
              </Typography>
            )}
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleAuthAction}
              sx={{
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {user ? "ログアウト" : "ログイン"}
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          © 2024 SciscitorAI. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

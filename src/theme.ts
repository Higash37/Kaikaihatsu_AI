import { createTheme } from "@mui/material/styles";

// Material-UI テーマを作成
const theme = createTheme({
  palette: {
    primary: {
      main: "#007AFF",
      dark: "#0056CC",
      light: "#4DA6FF",
    },
    secondary: {
      main: "#FF6B6B",
      dark: "#FF5252",
      light: "#FF8A80",
    },
    success: {
      main: "#4CAF50",
      dark: "#388E3C",
      light: "#81C784",
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
    action: {
      disabled: "#CCCCCC",
    },
  },
  typography: {
    fontFamily: '"ZenMaruGothic", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
  },
});

export default theme;

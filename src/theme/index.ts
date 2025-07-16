import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // iOS system blue
    },
    secondary: {
      main: '#8E8E93', // iOS system gray
    },
    background: {
      default: '#F2F2F7', // iOS light background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E', // iOS dark text
      secondary: '#636366', // iOS secondary text
    },
  },
  typography: {
    fontFamily: [
      '"Zen Maru Gothic"',
      'Inter', // A common modern sans-serif font, similar to SF Pro
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // ボタンのテキストを大文字にしない
    },
  },
  shape: {
    borderRadius: 10, // 全体的に角丸を適用
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, // ボタンの角丸
          boxShadow: 'none', // デフォルトの影をなくす
          '&:hover': {
            boxShadow: 'none', // ホバー時の影もなし
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10, // Paperコンポーネントの角丸
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', // 控えめな影
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10, // Selectコンポーネントの角丸
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8, // MenuItemの角丸
          margin: '0 4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.08)', // ホバー時の背景色
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 122, 255, 0.15)', // 選択時の背景色
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.2)',
            },
          },
        },
      },
    },
  },
});

export default theme;

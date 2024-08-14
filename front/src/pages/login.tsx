import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Container, CssBaseline, TextField, Typography, Avatar, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';import DrawerAppBar from '@/components/DrawerAppBar';

const defaultTheme = createTheme();

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // パスワードエラーメッセージを表示するための状態
  const [snackbarOpen, setSnackbarOpen] = useState(false); // スナックバーの開閉状態

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(true);
  };

  const handleMouseUpPassword = () => {
    setShowPassword(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      });

      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
        return;
      }

      const ResData = await response.json();
      if (ResData.status === 'not correct') {
        setError('ユーザー名またはパスワードが違います'); // エラーメッセージを設定
      } else if (ResData.status === 'ok') {
        setError('')
        await Cookies.set('jwt', ResData.token);
        await Cookies.set('username', ResData.username);
        setSnackbarOpen(true); // スナックバーを開く
        router.push('/users/' + ResData.username);
      } else {
        setError('ログインに失敗しました。もう一度お試しください。'); // その他のエラーメッセージ
      }
    } catch (error) {
      console.error('エラーが発生しました', error);
      setError('サーバーとの通信に失敗しました。'); // 通信エラー時のエラーメッセージ
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DrawerAppBar />
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddAltIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            ログイン
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="ユーザー名"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="pass"
              label="パスワード"
              type={showPassword ? 'text' : 'password'}
              id="pass"
              autoComplete="current-pass"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      onMouseLeave={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
             <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Log in
            </Button>
          </Box>
        </Box>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            ログインに成功しました！
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
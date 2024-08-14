import React from 'react';
import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Container, CssBaseline, Box, Avatar, Typography, TextField, Button, Snackbar, IconButton, InputAdornment } from '@mui/material';
import { useRouter } from 'next/router';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import MuiAlert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DrawerAppBar from '@/components/DrawerAppBar'; // DrawerAppBarをインポート

const defaultTheme = createTheme();

export default function SignUp() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
    router.push('/login'); // ユーザーをログインページにリダイレクト
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9]{6,}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username') as string;
    const password = data.get('pass') as string;

    if (!validateUsername(username)) {
      setErrorMessage("ユーザー名は半角英数6文字以上である必要があります。");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("パスワードは英数両方を含む6文字以上である必要があります。");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/user`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.fromEntries(data)),
    });

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      return;
    } else {
      const ResData = await response.json();
      
      if (ResData.status === "ok") {
        setErrorMessage("")
        setOpenSnackbar(true); // スナックバーを開く
      } else if (ResData.status === "existing") {
        setErrorMessage("そのユーザー名は既に使われています。");
      }
    }
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(true);
  };

  const handleMouseUpPassword = () => {
    setShowPassword(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <DrawerAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddAltIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            ユーザー登録
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
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
            {errorMessage && (
              <Typography color="error" variant="body2">
                {errorMessage}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          ユーザー登録が完了しました！ログインしてください。
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  );
}
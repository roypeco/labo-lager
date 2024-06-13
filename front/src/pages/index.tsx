import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar'; // ここが正しいコンポーネントを指しているか確認してください
import Box from '@mui/material/Box'; // @mui/material がインストールされていることを確認してください

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usernameFromCookie = Cookies.get('username');
    const jwtTokenFromCookie = Cookies.get('jwt');
    setUsername(usernameFromCookie || '');
    setJwtToken(jwtTokenFromCookie || '');
    setLoading(false);
  }, []);

  return (
    <div>
      <DrawerAppBar />
      <Box
        sx={{
          // marginTop: 15,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <a href="/signup">Sign up Page</a>
        <a href="/login">Login Page</a>
        <a href={"/users/" + username}>User Page</a>
      </Box>
      {!loading ? (
        username ? (
          jwtToken ? (
            <Box>{username} {jwtToken}</Box>
          ) : (
            <Box>jwttokenないよ</Box>
          )
        ) : (
          <Box>usernameないよ</Box>
        )
      ) : (
        <Box>Loading...</Box>
      )}
    </div>
  );
};

export default Index;

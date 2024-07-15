import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar'; // ここが正しいコンポーネントを指しているか確認してください
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1>LaboLager</h1>
        <p>研究室で使える在庫管理サービス</p>
        <Divider />
        <nav aria-label="index list">
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/login">
              <ListItemText primary="ログイン" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/signup">
                <ListItemText primary="アカウント登録" />
              </ListItemButton>
            </ListItem>
            {username && (
              <ListItem disablePadding>
                <ListItemButton component="a" href={"/users/" + username}>
                  <ListItemText primary="ユーザーページ" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </nav>
      </Box>
      {loading && (
        <p>Loading</p>
      )}
    </div>
  );
};

export default Index;

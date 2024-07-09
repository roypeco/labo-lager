import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar'; // ここが正しいコンポーネントを指しているか確認してください
import Box from '@mui/material/Box'; // @mui/material がインストールされていることを確認してください
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import StoreIcon from '@mui/icons-material/Store';
import { styled } from '@mui/material/styles';

const MyPage = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [stores, setStores] = useState<{ID: number, StoreName: string, Description: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const usernameFromCookie = Cookies.get('username');
      const jwtTokenFromCookie = Cookies.get('jwt');
      setUsername(usernameFromCookie || '');
      setJwtToken(jwtTokenFromCookie || '');

      try {
        const response = await fetch('http://localhost:8000/restricted/stores?username='+usernameFromCookie, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwtTokenFromCookie || ''
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // データ構造が配列であることを確認する
        if (Array.isArray(result)) {
          setStores(result);
        } else {
          console.error('Invalid data structure:', result);
        }
        
        // console.log('Success:', result);
      } catch (error) {
        console.error('Error:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const CustomListItem = styled(ListItem)(({ theme }) => ({
    height: '80px', // ここで高さを調整
    width: '400px',
  }));

  const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
    height: '100%', // ListItem の高さを100%に設定
    border: '1px solid', // 枠線を追加
    borderColor: theme.palette.divider, // 枠線の色をテーマのdivider色に設定
    borderRadius: '4px', // 角を丸める（必要に応じて）
  }));
  

  const CustomListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
      fontSize: '1.5rem', // ここでフォントサイズを調整
    },
  }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <DrawerAppBar />
      <Box
        component="form"
        noValidate
        sx={{
            mt: 1,
            width: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
      >
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          >
          <h1>店舗一覧</h1>
          <nav aria-label="all stores list">
            <List>
              {stores.map((store) => (
                <CustomListItem key={store.ID} disablePadding>
                  <CustomListItemButton>
                    <ListItemIcon>
                      <StoreIcon />
                    </ListItemIcon>
                    <CustomListItemText primary={store.StoreName} />
                  </CustomListItemButton>
                </CustomListItem>
              ))}
            </List>
          </nav>
        </Box>
      </Box>
    </Box>
  );
}

export default MyPage;

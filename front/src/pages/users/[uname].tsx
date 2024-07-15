import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import DrawerAppBar from '@/components/DrawerAppBar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import StoreIcon from '@mui/icons-material/Store';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router'; // useRouter をインポートする

const MyPage = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [stores, setStores] = useState<{ID: number, StoreName: string, Description: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const rowPath = usePathname();
  const userPath = rowPath ? rowPath.slice(7) : '';
  const router = useRouter(); // useRouter を初期化する

  useEffect(() => {
    const fetchData = async () => {
      if (!userPath) return;

      const usernameFromCookie = Cookies.get('username');
      const jwtTokenFromCookie = Cookies.get('jwt');
      setUsername(usernameFromCookie || '');
      setJwtToken(jwtTokenFromCookie || '');

      try {
        const response = await fetch('http://localhost:8000/restricted/stores?username=' + userPath, {
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

        if (Array.isArray(result)) {
          setStores(result);
        } else {
          console.error('Invalid data structure:', result);
        }

      } catch (error) {
        console.error('Error:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, [userPath]);

  const handleClick = (storeName: string) => {
    // storeNameに基づいてリンク先のURLを生成する
    const url = `/stores/${encodeURIComponent(storeName)}`;
    // リンク先に遷移する処理
    router.push(url); // useRouterを使用して実際に遷移する
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const CustomListItem = styled(ListItem)(({ theme }) => ({
    height: '80px',
    width: '400px',
  }));

  const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
    height: '100%',
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: '4px',
  }));

  const CustomListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
      fontSize: '1.5rem',
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
            textAlign: 'center',
          }}
        >
          <nav aria-label="all stores list">
            <h1>店舗一覧</h1>
            <List>
              {stores.map((store) => (
                <CustomListItem key={store.ID} disablePadding>
                  <CustomListItemButton onClick={() => handleClick(store.StoreName)}>
                    <ListItemIcon>
                      <StoreIcon />
                    </ListItemIcon>
                    <CustomListItemText primary={store.StoreName} />
                  </CustomListItemButton>
                </CustomListItem>
              ))}
            </List>
          </nav>
          <Divider />
          <nav aria-label="register new store">
            <h1>新規店舗に登録</h1>
          </nav>
        </Box>
      </Box>
    </Box>
  );
}

export default MyPage;

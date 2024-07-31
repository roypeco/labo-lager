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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

const MyPage = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [stores, setStores] = useState<{ID: number, StoreName: string, Description: string}[]>([]);
  const [otherStores, setOtherStores] = useState<{ID: number, StoreName: string, Description: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [newstoreName, setNewStoreName] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const rowPath = usePathname();
  const userPath = rowPath ? rowPath.slice(7) : '';
  const router = useRouter();

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

      try {
        const response = await fetch('http://localhost:8000/restricted/other_stores?username=' + userPath, {
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
          setOtherStores(result);
        } else {
          console.error('Invalid data structure:', result);
        }

      } catch (error) {
        console.error('Error:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, [userPath, clickCount]);

  const handleClick = (storeName: string) => {
    const url = `/stores/${encodeURIComponent(storeName)}`;
    router.push(url);
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const handleChange = (event: SelectChangeEvent) => {
    setNewStoreName(event.target.value as string);
  };

  const handleSubmit = async (storeName: string, jwtToken: string | null, username: string | null) => {
    try {
      const response = await fetch('http://localhost:8000/restricted/register/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken || ''
        },
        body: JSON.stringify({
          "username": username,
          "storename": storeName,
          "roll": 'C'
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setClickCount(prevCount => prevCount + 1);
  };

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
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
          <nav aria-label="all stores list">
            <h1>登録店舗一覧</h1>
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
            <h2>既存の店舗に自分を登録</h2>
            <FormControl fullWidth>
              <InputLabel id="store-select-label">店舗選択</InputLabel>
              <Select
                labelId="store-select-label"
                id="store-select"
                value={newstoreName}
                label="store-name"
                onChange={handleChange}
              >
                {otherStores.map((store) => (
                  <MenuItem value={store.StoreName} key={store.ID}>{store.StoreName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => handleSubmit(newstoreName, jwtToken, username)} sx={{ mt: 1 , mb: 1}}>
              登録
            </Button>
            <br />
            <h2>新規店舗を開設する</h2>
            <Button variant='outlined' href='/stores/register' size='large'>新規店舗を開設</Button>
          </nav>
        </Box>
      </Box>
    </Box>
  );
};

export default MyPage;

import DrawerAppBar from "@/components/DrawerAppBar";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Image from 'next/image';
import itemImage from '../../../public/img/square.jpg';

const register_store = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const rowPath = usePathname();
    const storeName = rowPath ? rowPath.slice(8) : '';
    const [items, setItems] = useState<{ID: number, ItemName: string, Price: number, Category: string, JanCode: string, Num: number}[]>([]);

    useEffect(() => {
        if (!storeName) return;

        const fetchData = async () => {
            const usernameFromCookie = Cookies.get('username');
            const jwtTokenFromCookie = Cookies.get('jwt');
            setUsername(usernameFromCookie || '');
            setJwtToken(jwtTokenFromCookie || '');

            try {
                const response = await fetch(`http://localhost:8000/restricted/stock/${storeName}`, {
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
                    setItems(result);
                } else {
                    console.error('Invalid data structure:', result);
                }
        
              } catch (error) {
                console.error('Error:', error);
              }
        };

        fetchData();
    }, [storeName]);
    
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
                sx={{
                    mt: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <h1>商品一覧</h1>
                <nav aria-label="store item list">
                <Grid container spacing={0}>
                    {items.map((item) => (
                        <Grid item key={item.ID} sm={4} xs={6}>
                            <ListItemButton
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column', // ここで縦方向に並べる
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    aspectRatio: '1',
                                    maxWidth: '300px',
                                    maxHeight: '300px',
                                }}
                                >
                                <ListItemText
                                    primary={item.ItemName}
                                    sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                    textAlign: 'center',
                                    }}
                                />
                                <Image
                                    src={itemImage}
                                    alt="Description of image"
                                    width={300}
                                    height={300}
                                    layout="responsive"
                                />
                                <ListItemText primary={`${item.Price}円`} />
                                </ListItemButton>
                        </Grid>
                    ))}
                </Grid>

                </nav>
            </Box>
        </Box>
    )
}

export default register_store;

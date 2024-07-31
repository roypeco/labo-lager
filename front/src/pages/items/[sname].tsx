import * as React from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const RegisterStore = () => {
    const router = useRouter();
    const [usernameFromCookie, setUsernameFromCookie] = useState<string | undefined>(undefined);
    const [jwtTokenFromCookie, setJwtTokenFromCookie] = useState<string | undefined>(undefined);
    const [storeName, setStoreName] = useState<string>('');
    const rowPath = usePathname();

    useEffect(() => {
        setUsernameFromCookie(Cookies.get('username'));
        setJwtTokenFromCookie(Cookies.get('jwt'));

        if (rowPath) {
            setStoreName(rowPath.slice(6));
        }
    }, [rowPath]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if (usernameFromCookie) {
            data.append('username', usernameFromCookie);
        }

        const itemname = data.get('itemname') as string | null;
        const category = data.get('category') as string | null;
        const price = data.get('price') as number | null;
        const num = data.get('num') as number | null;

        const jsonData = {
            username: usernameFromCookie,
            storename: storeName,
            itemname: itemname,
            category: category,
            price: price,
            num: num,
        };

        try {
            const response = await fetch('http://localhost:8000/restricted/register/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwtTokenFromCookie || ''
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        router.push('/stores/' + storeName);
    };

    return (
        <div className="parent">
            <DrawerAppBar />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <h1>新規店舗登録</h1>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{
                            mt: 1,
                            width: 400,
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            fullWidth
                            required
                            label="商品名"
                            id="itemname"
                            name="itemname"
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="category-label">カテゴリー</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category"
                                name="category"
                                label="カテゴリー"
                            >
                                <MenuItem value={"カップ麺"}>カップ麺</MenuItem>
                                <MenuItem value={"お菓子"}>お菓子</MenuItem>
                                <MenuItem value={"アイスクリーム"}>アイスクリーム</MenuItem>
                                <MenuItem value={"その他"}>その他</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="値段"
                            id="price"
                            name="price"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="個数"
                            id="num"
                            name="num"
                            margin="normal"
                        />
                        <Button
                            variant="outlined"
                            size="large"
                            type="submit"
                        >
                            登録
                        </Button>
                    </Box>
                </Box>
            </Box>
        </div>
    );
}

export default RegisterStore;

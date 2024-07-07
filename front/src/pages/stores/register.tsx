import * as React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button } from "@mui/material";

const register_store = () => {
    const router = useRouter();
    const [usernameFromCookie, setUsernameFromCookie] = useState<string | undefined>(undefined);
    const [jwtTokenFromCookie, setJwtTokenFromCookie] = useState<string | undefined>(undefined);

    useEffect(() => {
        setUsernameFromCookie(Cookies.get('username'));
        setJwtTokenFromCookie(Cookies.get('jwt'));
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        // usernameFromCookie を FormData に追加
        if (usernameFromCookie) {
            data.append('username', usernameFromCookie);
        }

        const storename = data.get('storename') as string | null;
        const description = data.get('description') as string | null;
        const username = data.get('username') as string | null;

        // console.log("Username from Cookie: ", usernameFromCookie);
        // console.log("Store Name: ", storename);
        // console.log("Description: ", description);
        // console.log("Username: ", username);

        // FormData から JSON に変換
        const jsonData = {
            storename: storename,
            description: description,
            username: username
        };

        // ここでAPIにデータを送信する処理を行う
        try {
            const response = await fetch('http://localhost:8000/restricted/register/store', {
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

            // const result = await response.json();
            // console.log('Success:', result);
        } catch (error) {
            console.error('Error:', error);
        }
        router.push('/users/'+username);
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
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            fullWidth
                            required
                            label="店名"
                            id="storename"
                            name="storename"
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            multiline
                            maxRows={5}
                            label="概要"
                            id="description"
                            name="description"
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

export default register_store;

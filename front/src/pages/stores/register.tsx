import * as React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button, Snackbar, Typography, Alert } from "@mui/material";

const RegisterStore = () => {
    const router = useRouter();
    const [usernameFromCookie, setUsernameFromCookie] = useState<string | undefined>(undefined);
    const [jwtTokenFromCookie, setJwtTokenFromCookie] = useState<string | undefined>(undefined);
    const [storeName, setStoreName] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        setUsernameFromCookie(Cookies.get('username'));
        setJwtTokenFromCookie(Cookies.get('jwt'));
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        if (usernameFromCookie) {
            data.append('username', usernameFromCookie);
        }

        const storename = data.get('storename') as string | null;
        const description = data.get('description') as string | null;
        const username = data.get('username') as string | null;

        const jsonData = {
            storename: storename,
            description: description,
            username: username
        };

        try {
            const response = await fetch('http://localhost:8000/restricted/register/store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwtTokenFromCookie || ''
                },
                body: JSON.stringify(jsonData)
            });

            const responseData = await response.json();

            if (responseData.status === 'existing') {
                setErrorMessage('その店舗名はすでに利用されています。');
            } else if (responseData.status === 'ok') {
                setSnackbarMessage('新規店舗登録が完了しました。');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                router.push('/users/' + username);
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleStoreNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStoreName(event.target.value);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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
                            label="店名"
                            id="storename"
                            name="storename"
                            margin="normal"
                            onChange={handleStoreNameChange}
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
                            disabled={!storeName || storeName.toLowerCase() === 'register'}
                        >
                            登録
                        </Button>
                    </Box>
                    {errorMessage && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackbarClose}
                    >
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </div>
    );
}

export default RegisterStore;

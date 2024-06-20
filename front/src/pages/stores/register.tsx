import * as React from 'react';
import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button } from "@mui/material";


const register_store = () => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
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
                        width: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                    >
                    <h1>新規店舗登録</h1>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            required
                            label="店名"
                            id="storename"
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
    )
}

export default register_store;
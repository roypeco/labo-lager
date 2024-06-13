import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button } from "@mui/material";

const handleSubmit = () => {
    
}

const register_store = () => {
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
                    <TextField fullWidth label="店名" id="fullWidth" margin="normal" />
                    <Button variant="outlined" size="large">登録</Button>
                </Box>
            </Box>
        </div>
    )
}

export default register_store;
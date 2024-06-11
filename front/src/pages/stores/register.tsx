import DrawerAppBar from "@/components/DrawerAppBar";
import { TextField, Box, Button } from "@mui/material";

const register_store = () => {
    return (
        <div className="parent">
            <DrawerAppBar />
            <Box
                sx={{
                marginTop: 15,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <h1>新規店舗登録</h1>
                <TextField fullWidth label="店名" id="fullWidth" margin="normal" />
                <Button variant="outlined">登録</Button>
            </Box>
        </div>
    )
}

export default register_store;
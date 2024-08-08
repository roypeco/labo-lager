import DrawerAppBar from "@/components/DrawerAppBar";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { AxiosError } from "axios";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import itemImage from '../../../public/img/item.png';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import { DialogContentText } from "@mui/material";


const register_store = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [items, setItems] = useState<{ID: number, ItemName: string, Price: number, Category: string, ImgPass: string, Num: number}[]>([]);
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [open, setOpen] = useState(false);
    const [openPurchaseSnack, setOpenPurchaseSnack] = useState(false);
    const [openCheck, setOpenCheck] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ID: number, ItemName: string, Price: number, Category: string, ImgPass: string, Num: number} | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [refresh, setRefresh] = useState(false);
    const [roll, setRoll] = useState(false);
    const [mode, setMode] = useState(false);
    const rowPath = usePathname();
    const storeName = rowPath ? rowPath.slice(8) : '';
    
    const handleClickOpen = (item: {ID: number, ItemName: string, Price: number, Category: string, ImgPass: string, Num: number}) => {
        setSelectedItem(item);
        setOpen(true);
        setTotalPrice(item.Price);
    };

    const handleCheckOpen = (item: {ID: number, ItemName: string, Price: number, Category: string, ImgPass: string, Num: number}) => {
        setOpenCheck(true);
    };

    const handleClose = () => {
        setOpen(false);
        setOpenCheck(false);
        setSelectedItem(null);
        setQuantity(1);
        setTotalPrice(0);
    };

    const handleCloseSnack = () => {
        setOpenPurchaseSnack(false); // アラートを閉じる
    };


    const handleIncrement = (singlePrice: number) => {
        setQuantity(prevQuantity => prevQuantity + 1);
        setTotalPrice(prevTotalPrice => prevTotalPrice + singlePrice);
    };

    const handleDecrement = (singlePrice: number) => {
        if (quantity > 1) {
        setQuantity(prevQuantity => prevQuantity - 1);
        }
        setTotalPrice(prevTotalPrice => prevTotalPrice - singlePrice);
    };

    const handleChange = () => {
        setMode((prevState) => !prevState);
    };

    const handleReplenishment = async (id: number) => {
        const jsonData = {
            username: username,
            storename: storeName,
            itemid: id,
            num: quantity,
        }
    
        // APIにデータを送信する処理を行う
        try {
            const response = await fetch('http://localhost:8000/restricted/register/replenishment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwtToken || ''
                },
                body: JSON.stringify(jsonData)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setRefresh(prev => !prev);
    
        } catch (error) {
            console.error('Error:', error);
        }
    
        setOpenPurchaseSnack(true);
        handleClose();
    }

    const handlePurchase = async (id: number) => {
        const jsonData = {
            username: username,
            storename: storeName,
            itemid: id,
            num: quantity,
        }
    
        // APIにデータを送信する処理を行う
        try {
            const response = await fetch('http://localhost:8000/restricted/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': jwtToken || ''
                },
                body: JSON.stringify(jsonData)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setRefresh(prev => !prev);
    
        } catch (error) {
            console.error('Error:', error);
        }
    
        setOpenPurchaseSnack(true);
        handleClose();
    }
    


    useEffect(() => {
        if (!storeName) return;

        const fetchData = async () => {
            const usernameFromCookie = Cookies.get('username');
            const jwtTokenFromCookie = Cookies.get('jwt');
            setUsername(usernameFromCookie || '');
            setJwtToken(jwtTokenFromCookie || '');

            try {
                const url = mode ? `http://localhost:8000/restricted/stock_all/${storeName}` : `http://localhost:8000/restricted/stock/${storeName}`;

                const response = await fetch(url, {
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

                    // 画像のプリサインドURLを取得
                    const imagePromises = result.map(async (item) => {
                        if (item.ImgPass) {
                            const imageUrl = await fetchImageUrl(item.ImgPass);
                            return { id: item.ID, url: imageUrl };
                        }
                        return { id: item.ID, url: '' };
                    });

                    const urls = await Promise.all(imagePromises);
                    const urlsMap = urls.reduce((acc, { id, url }) => {
                        acc[id] = url;
                        return acc;
                    }, {} as { [key: number]: string });

                    setImageUrls(urlsMap);
                } else {
                    console.error('Invalid data structure:', result);
                }
        
              } catch (error) {
                console.error('Error:', error);
              }

              const response = await fetch(`http://localhost:8000/restricted/permission?username=${usernameFromCookie}&storename=${storeName}`, {
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
              if (result.Roll == "M"){
                setRoll(true);
              } else {
                setRoll(false);
              }
            //   console.log(result)
        };

        fetchData();
    }, [storeName, refresh, mode]);

    const fetchImageUrl = async (imgPass: string) => {
        try {
            const response = await axios.get('/api/getPresignedUrl', {
                params: { key: imgPass },
            });
            return response.data.url;
        } catch (error) {
            // errorがAxiosError型であることを確認してからアクセスする
            if (error instanceof AxiosError) {
                console.error('Error data:', error.response?.data);
                console.error('Error status:', error.response?.status);
                console.error('Error headers:', error.response?.headers);
            } else {
                // それ以外のエラー型の場合
                console.error('An unexpected error occurred:', error);
            }
            return '';
        }
    };

    return (
        <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
        >
            <DrawerAppBar />
            {roll && (
                <Box
                    sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%',
                    mr: 2,
                    }}
                >
                    {mode ? (
                        <Box>商品を追加/補充</Box>
                    ) : (
                        <Box>商品を購入する</Box>
                    )}
                    <Switch
                    checked={mode}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                    />
                </Box>
            )}
            {mode && (
                <nav aria-label="register new item">
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            width: '100%',
                            mr: 2,
                        }}
                    >
                        <Button href={`/items/${storeName}`}>
                            新商品を追加する場合はこちら
                        </Button>
                    </Box>
                </nav>
            )}
            <Box
                sx={{
                    mt: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {mode && (<h1>商品を補充する</h1>)}
                <nav aria-label="store item list">
                <Grid container spacing={0.5} rowSpacing={1} sx={{mb: 5, maxWidth: '750px'}}>
                    {items.map((item,index) => (
                        <Grid item key={item.ID} sm={4} md={4} lg={4} xl={4} xs={6} 
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <ListItemButton
                                onClick={() => handleClickOpen(item)}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    mb: 3,
                                    padding: 0,
                                }}
                                >
                                <ListItemText
                                    primary={
                                        <span>
                                            {item.ItemName}
                                            {item.Num === 0 && <span style={{ color: 'red' }}>(欠品中)</span>}
                                        </span>
                                    }
                                    sx={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                    height: '20%',
                                    textAlign: 'center',
                                    }}
                                />
                                {imageUrls[item.ID] ? (
                                    <Image
                                        src={imageUrls[item.ID]}
                                        alt={item.ItemName}
                                        layout="responsive"
                                        width={300}
                                        height={300}
                                    />
                                ) : (
                                    <Image
                                        src={itemImage}
                                        alt="Default image"
                                        layout="responsive"
                                        width={300}
                                        height={300}
                                    />
                                )}
                                <ListItemText
                                    primary={`${item.Price}円`} 
                                    sx={{
                                        height: '20%',
                                        textOverflow: 'ellipsis',
                                    }}
                                />
                                </ListItemButton>
                        </Grid>
                    ))}
                </Grid>
                </nav>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {selectedItem?.ItemName}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Image
                        src={selectedItem && imageUrls[selectedItem.ID] ? imageUrls[selectedItem.ID] : itemImage}
                        alt={selectedItem?.ItemName || 'Default image'}
                        layout="responsive"
                        width={150}
                        height={150}
                    />
                        {mode ? ( // 補充画面の数量選択
                            <Box mt={2} display="flex" alignItems="center" justifyContent="center">
                                    <Button
                                    variant="outlined"
                                    onClick={() => {
                                        if (selectedItem) {
                                        handleDecrement(selectedItem.Price);
                                        }
                                    }}
                                    disabled={quantity <= 1}
                                    sx={{
                                    borderRadius: '50%',
                                    minWidth: '40px',
                                    minHeight: '40px',
                                    }}
                                >
                                    -
                                </Button>
                                <Box 
                                    mx={2} 
                                    width={80} 
                                    height={80} 
                                    textAlign="center" 
                                    display="flex" 
                                    justifyContent="center" 
                                    alignItems="center"
                                    sx={{ 
                                        outline: '1px solid lightgray', // アウトラインの色を灰色に設定
                                        borderRadius: '8px', // 丸角を設定
                                        fontSize: '4vw',
                                    }} 
                                >
                                    {quantity}
                                </Box>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        if (selectedItem) {
                                            handleIncrement(selectedItem.Price);
                                        }
                                    }}
                                    sx={{
                                        borderRadius: '50%',
                                        minWidth: '40px',
                                        minHeight: '40px',
                                    }}
                                >
                                    +
                                </Button>
                            </Box>
                        ) : ( // 購入画面の数量選択
                            <Box mt={2} display="flex" alignItems="center" justifyContent="center">
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        if (selectedItem) {
                                        handleDecrement(selectedItem.Price);
                                        }
                                    }}
                                    disabled={quantity <= 1}
                                    sx={{
                                    borderRadius: '50%',
                                    minWidth: '40px',
                                    minHeight: '40px',
                                    }}
                                >
                                    -
                                </Button>
                                <Box 
                                    mx={2} 
                                    width={80} 
                                    height={80} 
                                    textAlign="center" 
                                    display="flex" 
                                    justifyContent="center" 
                                    alignItems="center"
                                    sx={{ 
                                        outline: '1px solid lightgray', // アウトラインの色を灰色に設定
                                        borderRadius: '8px', // 丸角を設定
                                        fontSize: '4vw',
                                    }} 
                                >
                                    {quantity}
                                </Box>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        if (selectedItem) {
                                            handleIncrement(selectedItem.Price);
                                        }
                                    }}
                                    disabled={selectedItem?.Num === undefined || quantity >= selectedItem.Num}
                                    sx={{
                                        borderRadius: '50%',
                                        minWidth: '40px',
                                        minHeight: '40px',
                                    }}
                                >
                                    +
                                </Button>
                            </Box>
                        )}
                    <Box mt={2}>
                        <ListItemText primary={`合計: ${totalPrice}円`} />
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        justifyContent: 'center',
                    }}
                >
                    {mode ? (
                        <Button
                        onClick={() => {
                            if (selectedItem) {
                              handleCheckOpen(selectedItem);
                            }
                        }}
                        sx={{
                            alignContent: 'center',
                            textAlign: 'center',
                        }}
                        >
                            補充
                    </Button>
                    ) : (
                    <Button
                        onClick={() => {
                            if (selectedItem) {
                              handlePurchase(selectedItem.ID);
                            }
                        }}
                        sx={{
                            alignContent: 'center',
                            textAlign: 'center',
                        }}
                        >
                            購入
                    </Button>
                )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={openCheck}
                onClose={handleClose}
                aria-labelledby="checktitle"
                aria-describedby="check-description"
            >
                <DialogTitle id="alert-check">
                    {"これは購入ではなく商品の補充です"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-check-desc">
                        商品の補充を行う場合は、続けるを押してください
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>やめる</Button>
                    <Button
                        onClick={() => {
                            if (selectedItem) {
                              handleReplenishment(selectedItem.ID);
                            }
                        }}
                        autoFocus
                    >
                        続ける
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openPurchaseSnack} autoHideDuration={6000} onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success" sx={{ width: '100%' }}>
                    購入が完了しました！
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default register_store;

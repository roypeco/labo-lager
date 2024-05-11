import DrawerAppBar from "@/components/DrawerAppBar";
import Box from '@mui/material/Box';


const Index = () => {
	return (
		<div>
			<DrawerAppBar/>
			<Box
				sx={{
					marginTop: 15,
					display: 'flex',
					flexDirection: 'column',
            		alignItems: 'center',
				}}>
				<a href="/login">Login Page</a>
			</Box>
		</div>
	);
};

export default Index;

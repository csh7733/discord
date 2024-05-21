import { createTheme } from '@mui/material/styles';

const discordTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#36393F',
            paper: '#2F3136',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B9BBBE',
        },
    },
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    borderBottom: 'none',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: '#FFFFFF',
                },
                secondary: {
                    color: '#B9BBBE',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    margin: '0 4px',
                },
            },
        },
    },
});

export default discordTheme;
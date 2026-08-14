import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: "#242424",
    },
    secondary: {
      main: "#FFE2D9",
    },
  },
  typography: {
    fontFamily: [
      '"Marcellus"',
      '"Marcellus SC"',
    
    ].join(','),
  },
  
})

theme = responsiveFontSizes(theme)

export default theme
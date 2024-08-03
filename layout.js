"use client";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const theme = createTheme({
  typography: {
    fontFamily: "'Roboto', sans-serif",  // Change this to your desired font
    h2: {
      fontFamily: "'Arial'",  // Apply custom font to h2
      color: '#555555',
    },
    body1: {
      color: '#555555',
    },
  },
  palette: {
    primary: {
      main: '#dbb8f2',
    },
    background: {
      default: '#f5eddf', // Cream color
    },
    
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Pantry Tracker</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

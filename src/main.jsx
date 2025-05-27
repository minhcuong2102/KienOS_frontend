import React from 'react';
import ReactDOM from 'react-dom/client';
import theme from './theme/theme';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from './providers/BreakpointsProvider';
import router from './routes/router';
import './index.css';
import { AuthProvider } from './context/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BreakpointsProvider>
        <CssBaseline />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
      </BreakpointsProvider>
    </ThemeProvider>
  </React.StrictMode>
);

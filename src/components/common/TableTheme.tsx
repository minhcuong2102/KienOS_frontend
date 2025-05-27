import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const theme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // Sets background color for the entire DataGrid
        },
        pinnedColumns: {
          left: {
            backgroundColor: '#ececec', // Background for left pinned columns
          },
          right: {
            backgroundColor: '#ececec', // Background for right pinned columns
          },
        },
        columnHeaders: {
          backgroundColor: '#black',
        },
        footerContainer: {
          backgroundColor: '#ffffff', 
          display: 'flex', // Make the footer a flex container
          justifyContent: 'space-between', // Space out items
          alignItems: 'center', // Center content vertically
          padding: '8px', // Add padding to prevent sticking to edges
        },
        cell: {
            display: 'flex', // Make the cell a flex container
            alignItems: 'center', // Center content vertically
          },
      },
    },
  },
});

export default theme;

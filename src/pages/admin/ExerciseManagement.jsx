import React from 'react';
import { Box } from '@mui/material';

import Exercises from '../../components/admin/exercise/Exercises';

const AccountManagement = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <Exercises />
        </Box>
    </>
  );
};

export default AccountManagement;

import React from 'react';
import { Box } from '@mui/material';

import Accounts from '../../components/admin/account/Accounts';

const AccountManagement = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <Accounts />
        </Box>
    </>
  );
};

export default AccountManagement;

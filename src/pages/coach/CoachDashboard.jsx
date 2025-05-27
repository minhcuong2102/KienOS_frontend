import React from 'react';
import { Box } from '@mui/material';

import ManageCustomer from '../../components/coach/ManageCustomer';

const CoachDashboard = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <ManageCustomer />
        </Box>
    </>
  );
};

export default CoachDashboard;

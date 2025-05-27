import React from 'react';
import { Box } from '@mui/material';

import Coachs from '../../components/admin/coach/Coachs';

const CoachManagement = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <Coachs />
        </Box>
    </>
  );
};

export default CoachManagement;

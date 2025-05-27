import React from 'react';
import { Box } from '@mui/material';

import TraningPlans from '../../components/coach/TrainingPlans';

const TrainingPlanManagement = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <TraningPlans />
        </Box>
    </>
  );
};

export default TrainingPlanManagement;

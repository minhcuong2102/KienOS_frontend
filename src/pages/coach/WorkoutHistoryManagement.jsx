import React from 'react';
import { Box } from '@mui/material';

import WorkoutHistory from '../../components/coach/WorkoutHistory';

const WorkoutHistoryManagement = () => {
  return (
    <>
        <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
          <WorkoutHistory />
        </Box>
    </>
  );
};

export default WorkoutHistoryManagement;

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

import PTServiceCustomers from '../../components/admin/statistic/PTServiceCustomers';
import NonPTServiceCustomers from '../../components/admin/statistic/NonPTServiceCustomers';

const ServiceManagement = () => {
  const [value, setValue] = useState(0); 

  const handleChange = (event, newValue) => {
    setValue(newValue); 
  };

  return (
    <>
      <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
        <Tabs value={value} onChange={handleChange} aria-label="service tabs">
          <Tab label="Gói tháng" />
          <Tab label="Dịch vụ PT" />
        </Tabs>

        {value === 0 && <NonPTServiceCustomers />} 
        {value === 1 && <PTServiceCustomers />} 
      </Box>
    </>
  );
};

export default ServiceManagement;

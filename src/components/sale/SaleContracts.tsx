
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

import SalePTContract from './SalePTContract';
import SaleNonPTContract from './SaleNonPTContract';

const SaleContracts = () => {
  const [value, setValue] = useState(0); 

  const handleChange = (event, newValue) => {
    setValue(newValue); 
  };

  return (
    <>
      <Box gridColumn={{ xs: 'span 12', '2xl': 'span 6' }} order={{ xs: 7 }}>
        <Tabs value={value} onChange={handleChange} aria-label="service tabs">
          <Tab label="Hợp đồng HLV" />
          <Tab label="Hợp đồng gói tháng" />
        </Tabs>

        {value === 0 && <SalePTContract />} 
        {value === 1 && <SaleNonPTContract />} 
      </Box>
    </>
  );
};

export default SaleContracts;

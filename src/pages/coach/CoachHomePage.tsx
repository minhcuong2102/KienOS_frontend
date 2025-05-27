import React, { useState } from 'react';

import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Container,
  Box,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";

const CoachHomePage = () => {
  const [value, setValue] = useState(0); 

  const handleChange = (event, newValue) => {
    
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Trang chủ của Coach
      </Typography>
    </Container>
  );
};

export default CoachHomePage;

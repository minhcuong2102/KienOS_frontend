import { useState, ChangeEvent, useCallback, ReactElement } from 'react';
import { Box, Paper, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import IconifyIcon from '../../base/IconifyIcon';
import AccountTable from './AccountTable';
import React from 'react';

const Accounts = (): ReactElement => {
  const [search, setSearch] = useState<string>('');

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  }, []);

  return (
    <Paper sx={{ p: { xs: 4, sm: 8 }, height: 1 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        flexWrap="wrap"
        gap={3}
      >
        <Typography variant="h4" color="common.white">
          Quản lý tài khoản
        </Typography>
        <TextField
          variant="filled"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={handleChange}
          sx={{
            '.MuiFilledInput-root': {
              bgcolor: 'grey.A100',
              ':hover': {
                bgcolor: 'background.default',
              },
              ':focus': {
                bgcolor: 'background.default',
              },
              ':focus-within': {
                bgcolor: 'background.default',
              },
            },
            borderRadius: 2,
            height: 40,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="akar-icons:search" width={13} height={13} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Box width={1} flexGrow={1} minHeight={325}>
        <AccountTable searchText={search} />
      </Box>
    </Paper>
  );
};

export default Accounts;

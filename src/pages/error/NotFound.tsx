import { ReactElement } from 'react';
import { Link, Stack, Button, Typography } from '@mui/material';
import Image from '../../components/base/Image';
import errorSvg from '../../assets/images/error/error.svg';
import paths from '../../routes/paths';
import React from 'react';

const NotFound = (): ReactElement => {
  return (
    <Stack
      minHeight="100vh"
      width="fit-content"
      mx="auto"
      justifyContent="center"
      alignItems="center"
      gap={10}
      py={12}
    >
      <Typography variant="h1" color="text.secondary">
        Oops! Trang này không tồn tại!
      </Typography>
      <Typography
        variant="h5"
        fontWeight={400}
        color="text.primary"
        maxWidth={600}
        textAlign="center"
      >
        Chúng tôi không tìm thấy trang hiện tại bạn đang truy cập, vui lòng kiểm tra lại đường dẫn!
      </Typography>
      <Image
        alt="Not Found Image"
        src={errorSvg}
        sx={{
          mx: 'auto',
          height: 260,
          my: { xs: 5, sm: 10 },
          width: { xs: 1, sm: 340 },
        }}
      />
      <Button href={ paths.login } size="large" variant="contained" component={Link}>
        Quay lại
      </Button>
    </Stack>
  );
};

export default NotFound;

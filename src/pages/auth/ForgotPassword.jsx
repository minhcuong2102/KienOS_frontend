import {
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  Typography,
  Link,
  Snackbar,
  Alert
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import axios from '../../services/axios';
import paths from '../../routes/paths';
import { useNavigate } from 'react-router-dom';
import logo from '/kienos-logo1.png';
import { rootPaths } from '../../routes/paths';
import Image from '../../components/base/Image';

const FORGOT_PASSWORD_URL = rootPaths.root + '/api/v1/users/forgot-password/';
const COUNTDOWN_DURATION = 30;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const errRef = useRef();

  function changeBackground(e) {
    document.getElementById('forgotBtn').style.backgroundColor = '#F3976A';
    
  }

  function changeBackground1(e) {
    document.getElementById('forgotBtn').style.backgroundColor = '#f36100';
  }

  const validateEmail = (email) => {
    const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return gmailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setErrMsg(null);
    if (!validateEmail(email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email không đúng định dạng!',
      }));
    } else {
      setErrors((prevErrors) => {
        const { email, ...rest } = prevErrors; 
        return rest;
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email) {
      newErrors.email = 'Email không được để trống!';
    }
    if (errMsg) {
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post(FORGOT_PASSWORD_URL,
        JSON.stringify({ email }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setIsSubmitted(true);
      setOpenSnackbar(true);
      setCountdown(COUNTDOWN_DURATION);

    } catch (err) {
      if (!err?.response) {
        setErrMsg('Không có phản hồi từ máy chủ!');
      } else if (err.response?.status === 404) {
        setErrMsg('Người dùng này không tồn tại trong hệ thống!');
      } else {
        setErrMsg('Lỗi bất định!');
      }
      errRef.current.focus();
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      setIsSubmitted(false);
    }

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <>
      <Box component="form" onSubmit={handleSubmit}>
        <Box component="figure" mb={5} mx="auto" textAlign="center">
          <Link href="https://kienos.me" sx={{ cursor: 'pointer' }}>
            <Image src={logo} alt="kienos-logo" height={150} />
          </Link>          
          <Typography sx={{ fontSize: '1rem' }} textAlign="center" color="text.secondary">
            Điền email để đặt lại mật khẩu
          </Typography>
        </Box>

        <Paper
          sx={{
            py: 6,
            px: { xs: 5, sm: 7.5 },
            maxWidth: 500,
            mx: "auto"
          }}
        >
          <Stack justifyContent="center" gap={5}>
            {errMsg && (
              <Typography ref={errRef} color="error" aria-live="assertive">
                {errMsg}
              </Typography>
            )}

            <TextField
              variant="filled"
              label="Email"
              onChange={handleEmailChange}
              value={email}
              type="email"
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              disabled={isSubmitted}
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
              }}
            />
            <Button
              id='forgotBtn'
              type="submit"
              variant="contained"
              size='small'
              disabled={isSubmitted}
              onMouseEnter={changeBackground}
              onMouseLeave={changeBackground1}
              sx={{
                fontWeight: 'fontWeightRegular',
                backgroundColor: "#f36100",
                color: 'white',
                py: 1.5
              }}
            >
              {isSubmitted && countdown > 0 
                ? `Tạo liên kết xác nhận (${countdown})` 
                : 'Tạo liên kết xác nhận'}
            </Button>
            

            <Typography textAlign="center" variant="body2">
              <Link href={paths.login} underline="none">
                Quay lại đăng nhập
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Liên kết đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email của bạn!
          <br />
          (Kiểm tra mục spam nếu không thấy email)
        </Alert>
      </Snackbar>
    </>
  );
};

export default ForgotPassword;
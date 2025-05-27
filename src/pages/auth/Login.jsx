import {
  Box,
  Link,
  Paper,
  Stack,
  Button,
  Checkbox,
  FormGroup,
  TextField,
  Typography,
  FormControlLabel,
  InputAdornment,
  IconButton,

} from '@mui/material';
import IconifyIcon from '../../components/base/IconifyIcon';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Form } from 'react-router-dom';
import { rootPaths } from '../../routes/paths';
import Image from '../../components/base/Image';
import logo from '/kienos-logo1.png'
import React from 'react';
import axios from '../../services/axios';
import useAuth from '../../hooks/useAuth';
const LOGIN_URL = rootPaths.root + '/api/v1/users/log-in/'
import paths from '../../routes/paths';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, persist, setPersist } = useAuth();

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  
  const userRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errMsg, setErrMsg] = useState('');
  const [errors, setErrors] = useState({});


  useEffect(() => {
      userRef.current.focus();
  }, [])

  useEffect(() => {
      setErrMsg('');
  }, [email, password])

  const validateEmail = (email) => {
    const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return gmailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email); 
  
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
  
  const handleSubmit = async (e) => {
      e.preventDefault();
      let newErrors = {}; 

      if (!email) {
        newErrors.email = 'Email không được để trống!';
      }

      if (!password) {
        newErrors.password = 'Mật khẩu không được để trống!';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return; 
      }
      try {
        const response = await axios.post(LOGIN_URL,
            JSON.stringify({ email, password }),
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }
        );
        localStorage.setItem('isLoggedIn', 'true');
        const accessToken = response?.data?.accessToken;
        const role = response?.data?.role;
        const status = response?.data?.status;
        const avatar = response?.data?.avatar;
        const fullName = response?.data?.fullName;

        setAuth({ email, role, status, accessToken, avatar, fullName });

        setEmail('');
        setPassword('');
        
        navigate("/");
        
    } catch (err) {
      console.log(err);
      if (!err?.response) {
        setErrMsg("Không có phản hồi từ máy chủ!");
      } else if (err.response?.status === 400) {
        setErrMsg("Vui lòng điền email và mật khẩu!");
      } else if (err.response?.status === 401) {
        setErrMsg("Tài khoản hoặc mật khẩu không đúng!");
        console.log("401 Error: ", err.response);

      } else {
        setErrMsg("Đăng nhập thất bại!");
      }
      errRef.current.focus();
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const togglePersist = () => {
    setPersist(prev => !prev);
  }

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  function changeBackground(e) {
    document.getElementById('loginBtn').style.backgroundColor = '#F3976A';
    
  }

  function changeBackground1(e) {
    document.getElementById('loginBtn').style.backgroundColor = '#f36100';
  }

  return (
    <>
      <Form>
        <Box component="figure" mb={5} mx="auto" textAlign="center">
          <Link href={import.meta.env.VITE_HOMEPAGE_URL}>
            <Image src={logo} alt="kienos-logo" height={160} />
          </Link>
        </Box>
        <Paper
          sx={{
            py: 6,
            px: { xs: 5, sm: 7.5 },
          }}
        >
          <Stack justifyContent="center" gap={5}>
            <Typography variant="h3" textAlign="center" color="text.secondary">
              Đăng nhập
            </Typography>
            <Typography
              variant="h6"
              fontWeight={500}
              textAlign="center"
              color="text.primary"
            >
              Chưa có tài khoản?{" "}
              <Link href="/auth/sign-up" underline="none">
                Đăng ký
              </Link>
            </Typography>
            <p
              ref={errRef}
              className={errMsg ? "errmsg" : "offscreen"}
              aria-live="assertive"
            >
              {errMsg}
            </p>

          <TextField
            variant="filled"
            ref={userRef}
            onChange={handleEmailChange}
            value={email}
            label="Email"
            type="email"
            error={!!errors.email} 
            helperText={errors.email} 
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
          <TextField
            variant="filled"
            label="Mật khẩu"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={showPassword ? 'text' : 'password'}
            error={!!errors.password} 
            helperText={errors.password} 
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
          
          InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    size="small"
                    edge="end"
                    sx={{
                      mr: 2,
                    }}
                  >
                    {showPassword ? (
                      <IconifyIcon icon="el:eye-open" color="text.secondary" />
                    ) : (
                      <IconifyIcon icon="el:eye-close" color="text.primary" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            />
            {/* <FormGroup sx={{ ml: 1, width: "fit-content" }}>
              <FormControlLabel
                control={
                  <Checkbox checked={persist} onChange={togglePersist} />
                }
                label="Ghi nhớ đăng nhập"
                sx={{
                  color: "text.secondary",
                }}
              />
            </FormGroup> */}
            <Link
              href={paths.forgot_password}
              textAlign="right"
              underline="none"
              sx={{ color: "gray" }}
            >
              Quên mật khẩu?
            </Link>
            <Button
              id='loginBtn'
              onClick={handleSubmit}
              onMouseEnter={changeBackground}
              onMouseLeave={changeBackground1}
              sx={{
                fontWeight: "fontWeightRegular",
                backgroundColor: "#f36100"
              }}
            >
              Đăng nhập
            </Button>
            
            
          </Stack>
        </Paper>
      </Form>
    </>
  );
};

export default Login;
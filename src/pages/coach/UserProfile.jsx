import React, { useState, useEffect } from "react";
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
  Grid,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import KeyIcon from "@mui/icons-material/Key";
import IconifyIcon from '../../components/base/IconifyIcon';

import { rootPaths } from "../../routes/paths";
const COACH_PROFILE = rootPaths.root + "/api/v1/coach-profiles/";
const CUSTOMER_PROFILE = rootPaths.root + "/api/v1/customer-profiles/";

const UserProfile = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError("");
    
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    try {
      const response = await axiosPrivate.post(
        rootPaths.root + "/api/v1/users/change-password/",
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      );

      if (response.status === 200) {
        alert("Đổi mật khẩu thành công!");
        handleCloseChangePasswordModal();
        setCurrentPassword("");
        setNewPassword("");
        setShowPassword(false);
        setShowNewPassword(false);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = error.response.data.error;
        setPasswordError("Mật khẩu hiện tại không đúng!");
        console.log(errors);
      } else {
        console.error("Error changing password:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  };

  const handleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleShowNewPassword = () => {
    setShowNewPassword(prev => !prev);
  };

  const handleOpenChangePasswordModal = () => {
    setOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setOpen(false);
  };
  const [profile, setProfile] = useState({
    phone: "",
    email: "",
    email_verified: "",
    avatar: "",
    avatarPreview: "",

    id: "",
    first_name: "",
    last_name: "",
    address: "",
    gender: null,
    birthday: "",

    height: null,
    weight: null,
    experiences: null,
    body_fat: null,
    musle_mass: null,

    goal_weight: null,
    goal_muscle_mass: null,
    goal_body_fat: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + "/api/v1/users/info/");

        const profileData = response.data.profile || {};

        setProfile({
          avatar: response.data.avatar_url ?? null,
          phone: response.data.phone ?? null,
          email: response.data.email ?? null,
          email_verified: response.data.email_verified ?? false,

          id: profileData.id ?? null,
          first_name: profileData.first_name ?? "",
          last_name: profileData.last_name ?? "",
          address: profileData.address ?? "",
          gender: profileData.gender ?? null,
          birthday: profileData.birthday ? new Date(profileData.birthday) : null,
          height: profileData.height ?? null,
          weight: profileData.weight ?? null,
          body_fat: profileData.body_fat ?? null,
          muscle_mass: profileData.muscle_mass ?? null,
          average_rating: profileData.average_rating ?? 0,
          experiences: profileData.experiences ?? 0,

          goal_weight: profileData.workout_goal?.weight ?? null,
          goal_muscle_mass: profileData.workout_goal?.muscle_mass ?? null,
          goal_body_fat: profileData.workout_goal?.body_fat ?? null,
        });

      } catch (error) {
        console.error("Error fetching profile data:", error);
        console;
      }
    };

    fetchProfile();
  }, [axiosPrivate]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date) => {
    setProfile({
      ...profile,
      birthday: date,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({
        ...profile,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({
          ...prev,
          avatarPreview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyEmail = async () => {
    const email = profile.email;

    try {
      const response = await axiosPrivate.post(
        rootPaths.root + "/api/v1/users/send-verification-email/",
        {
          email: email,
        }
      );

      if (response.status === 200) {
        alert("Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư của bạn!");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert(
        "Có lỗi xảy ra trong quá trình gửi email xác minh. Vui lòng thử lại."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!profile.avatar) {
      setError("Vui lòng thêm ảnh đại diện!");
      return;
    }

    const namePattern = /^[A-Za-zÀ-ỹ\s]+$/;
    if (!namePattern.test(profile.first_name) || !namePattern.test(profile.last_name)) {
        setError("Họ và Tên không hợp lệ!");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(profile.email)) {
        setError("Email không hợp lệ!");
        return;
    }
    if (isNaN(profile.height) || profile.height <= 0) {
      setError("Chiều cao không hợp lệ!");
      return;
  }

    if (isNaN(profile.weight) || profile.weight <= 0) {
        setError("Cân nặng không hợp lệ!");
        return;
    }

    let phone = profile.phone;
    
    if (phone.length < 9 || phone.length > 10) {
      setError("Vui lòng điền số điện thoại hợp lệ!");
      return;
    }

    if (phone.length === 10 && phone.startsWith("0")) {
      phone = "+84" + phone.slice(1);
    } else if (phone.length === 9) {
      phone = "+84" + phone;
    }

    const formData = new FormData();

    formData.append("avatar_url", profile.avatar);
    formData.append("phone", profile.phone);
    formData.append("email", profile.email);
    formData.append("first_name", profile.first_name);
    formData.append("last_name", profile.last_name);
    formData.append("address", profile.address);
    formData.append("gender", profile.gender);
    formData.append("birthday", profile.birthday.toISOString().split("T")[0]);
    formData.append("height", profile.height);
    formData.append("weight", profile.weight);
    formData.append("experiences", profile.experiences);

    if (auth.role === "coach") {
      if (!profile.id) {
        try {
          const response = await axiosPrivate.post(COACH_PROFILE, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          alert("Thêm hồ sơ thành công!");
          setTimeout(() => {
            window.location.reload();
          }, 10);
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      } else {
        try {
          const response = await axiosPrivate.patch(
            `${COACH_PROFILE}${profile.id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          alert("Cập nhật hồ sơ thành công!");
          setTimeout(() => {
            // window.location.reload();
            const handleProfileClick = useCallback(() => {
              setIsOpen(false);
              navigate(paths.profile);
            }, [navigate]);
          }, 10);
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    } else {
      if (!profile.id) {
        formData.append("goal_weight", 55);
        formData.append("goal_muscle_mass", 15);
        formData.append("goal_body_fat", 25);

        try {
          const response = await axiosPrivate.post(CUSTOMER_PROFILE, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Profile updated:", response.data);
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      } else {
        try {
          const response = await axiosPrivate.patch(
            `${CUSTOMER_PROFILE}${profile.id}/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Profile updated:", response.data);
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ color: "white" }} gutterBottom>
        Hồ sơ cá nhân
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <Box sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={3} alignItems="center" mb={3}>
              <Avatar
                alt="User Avatar"
                src={profile.avatarPreview || profile.avatar}
                sx={{ width: 120, height: 120 }}
              />
              <label htmlFor="avatar-upload">
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                >
                  <PhotoCamera />
                </IconButton>
              </label>
              <Tooltip title="Đánh giá trung bình">
                <div>
                  <Rating value={profile?.average_rating || 0} readOnly />
                </div>
              </Tooltip>
            </Stack>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Họ"
                  name="first_name"
                  value={profile?.first_name || ""}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  name="last_name"
                  value={profile?.last_name || ""}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={profile?.address || ""}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile?.email || ""}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={
                            profile?.email_verified ? (
                              <div style={{ fontSize: "1rem" }}>
                                <span>Đã xác minh</span>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: "1rem" }}>
                                  <span>Hãy</span>
                                  <button
                                    style={{
                                      backgroundColor: "transparent",
                                      border: "none",
                                      color: "wheat",
                                      cursor: "pointer",
                                      padding: "0 5px",
                                      fontSize: "1.1rem",
                                      fontWeight: "bold",
                                    }}
                                    onClick={() => handleVerifyEmail()}
                                  >
                                    xác minh
                                  </button>
                                  <span>email của bạn</span>
                                </div>
                              </>
                            )
                          }
                        >
                          {profile?.email_verified ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CancelIcon color="error" />
                          )}
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <Tooltip
                  title={
                    <div style={{ fontSize: "1rem" }}>
                      <span>Đổi mật khẩu</span>
                    </div>
                  }
                >
                  <IconButton
                    onClick={handleOpenChangePasswordModal}
                    size="small"
                    sx={{ marginTop: 9 }}
                  >
                    <KeyIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={profile.phone ? profile.phone.replace("+84", "") : ""}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">+84</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày sinh"
                    value={profile?.birthday || null}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                    required
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    value={profile?.gender ?? ""}
                    onChange={handleChange}
                    name="gender"
                    required
                    sx={{
                      marginTop: 1,
                    }}
                  >
                    <MenuItem value={0}>Nữ</MenuItem>
                    <MenuItem value={1}>Nam</MenuItem>
                    <MenuItem value={2}>Giới tính khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Chiều cao"
                  name="height"
                  value={profile?.height || null}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">cm</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cân nặng"
                  name="weight"
                  value={profile?.weight || null}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kinh nghiệm"
                  name="experiences"
                  value={profile?.experiences || ''}
                  onChange={handleChange}
                  multiline
                  minRows={5}
                  placeholder="Thêm kinh nghiệm huấn luyện của bạn..."
                />
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ marginTop: 5, width: 300, alignSelf: "center" }}
            >
              Lưu
            </Button>
          </Stack>
        </Box>
      </form>
      <Dialog open={open} onClose={handleCloseChangePasswordModal}>
        <DialogTitle sx={{ color: "white", marginBottom: 5, marginTop: 5 }}>
          ĐỔI MẬT KHẨU
        </DialogTitle>
        <DialogContent>
          {passwordError && (
            <Typography color="error" variant="body2">
              {passwordError}
            </Typography>
          )}
          <Box
            display="flex"
            width="500px"
            flexDirection="column"
            gap={2}
            marginBottom={3}
          >
            <TextField
              label="Mật khẩu hiện tại"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              variant="outlined"
              autoComplete="new-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleShowPassword}
                      size="small"
                      edge="end"
                      sx={{
                        mr: 2,
                      }}
                    >
                      {showPassword ? (
                        <IconifyIcon
                          icon="el:eye-open"
                          color="text.secondary"
                        />
                      ) : (
                        <IconifyIcon icon="el:eye-close" color="text.primary" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Mật khẩu mới"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              variant="outlined"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleShowNewPassword}
                      size="small"
                      edge="end"
                      sx={{
                        mr: 2,
                      }}
                    >
                      {showNewPassword ? (
                        <IconifyIcon
                          icon="el:eye-open"
                          color="text.secondary"
                        />
                      ) : (
                        <IconifyIcon icon="el:eye-close" color="text.primary" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            width="100%"
            marginBottom={5}
          >
            <Button
              onClick={handleCloseChangePasswordModal}
              color="error"
              variant="contained"
              sx={{
                width: "30%",
                height: "40px",
                margin: "0 auto",
              }}
            >
              Hủy
            </Button>
            <Button
              color="success"
              variant="contained"
              onClick={handleChangePassword}
              sx={{
                width: "30%",
                height: "40px",
                margin: "0 auto",
              }}
            >
              Đổi mật khẩu
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;

import {
  Avatar,
  Button,
  Tooltip,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import IconifyIcon from "../../../components/base/IconifyIcon";
import { useState, MouseEvent, useCallback, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "../../../hooks/useLogout";
import React from "react";
import useAuth from "../../../hooks/useAuth";
import paths from "../../../routes/paths";

const UserDropdown = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const logout = useLogout();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const profile = auth?.avatar;

  const handleUserClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    localStorage.removeItem("isLoggedIn");
    setAuth(null);
    logout();
    navigate("/auth/login", { replace: true });
  }, [logout, navigate, setAuth]);

  const handleProfileClick = useCallback(() => {
    setIsOpen(false);
    navigate(paths.profile);
  }, [navigate]);

  return (
    <>
      <Button
        color="inherit"
        variant="text"
        id="account-dropdown-menu"
        aria-controls={menuOpen ? "account-dropdown-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        onClick={handleUserClick}
        disableRipple
        sx={{
          borderRadius: 2,
          gap: 3.75,
          px: { xs: 0, sm: 0.625 },
          py: 0.625,
          "&:hover": {
            bgcolor: "transparent",
          },
        }}
      >
        <Tooltip
          title={
            auth?.role === "admin"
              ? "Quản trị viên"
              : auth?.role === "coach"
              ? "Huấn luyện viên"
              : "Lễ tân"
          }
          arrow
          placement="bottom"
        >
          <Avatar src={profile} sx={{ width: 44, height: 44 }} />
        </Tooltip>

        <IconifyIcon
          color="common.white"
          icon="mingcute:down-fill"
          width={22.5}
          height={22.5}
          sx={(theme) => ({
            transform: menuOpen ? `rotate(180deg)` : `rotate(0deg)`,
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.short,
            }),
          })}
        />
      </Button>
      {isOpen && (
        <Stack
          sx={{
            position: "absolute",
            top: "90px",
            right: 30,
            backgroundColor: "#272836",
            padding: 5,
            borderRadius: 2,
            boxShadow: 3,
            width: "300px",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ marginBottom: 5 }}
          >
            <Avatar
              src={auth?.avatar}
              sx={{ width: 44, height: 44, marginRight: 3 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography
                variant="body1"
                sx={{ color: "white", fontWeight: "bold", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {auth?.email}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "white", fontSize: "0.875rem", opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                ({auth?.role === 'admin' ? "Quản trị viên" : "Lễ tân"})
              </Typography>
            </Box>
          </Stack>

          <Button
            onClick={handleLogout}
            fullWidth
            sx={{
              marginTop: 1,
              color: "white",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "#5e5e5e",
              },
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <IconButton sx={{ color: "red" }}>
              <ExitToAppIcon />
            </IconButton>
            <Typography sx={{ marginLeft: 1, color: "red", fontWeight: "bold" }}>Đăng xuất</Typography>
          </Button>
        </Stack>
      )}
    </>
  );
};

export default UserDropdown;

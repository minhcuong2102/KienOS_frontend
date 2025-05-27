import {
  Badge,
  Stack,
  AppBar,
  Toolbar,
  TextField,
  IconButton,
  InputAdornment,
  Box
} from '@mui/material';
import IconifyIcon from '../../../components/base/IconifyIcon';
import { ReactElement, useState } from 'react';
import { drawerCloseWidth, drawerOpenWidth } from '..';
import UserDropdown from './UserDropdown';
import { useBreakpoints } from '../../../providers/BreakpointsProvider';
import React from 'react';
import Notification from '../../../components/NotificationA&S';

const Topbar = ({
  open,
  handleDrawerToggle,
}: {
  open: boolean;
  handleDrawerToggle: () => void;
}): ReactElement => {
  const { down } = useBreakpoints();

  const isMobileScreen = down('sm');

  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev); 
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        left: 0,
        ml: isMobileScreen ? 0 : open ? 60 : 27.5,
        width: isMobileScreen
          ? 1
          : open
          ? `calc(100% - ${drawerOpenWidth}px)`
          : `calc(100% - ${drawerCloseWidth}px)`,
        paddingRight: '0 !important',
      }}
    >
      <Toolbar
        component={Stack}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          bgcolor: 'background.default',
          height: 116,
        }}
      >
        <Stack direction="row" gap={2} alignItems="center" ml={2.5} flex="1 1 52.5%">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <IconifyIcon
              icon={open ? 'ri:menu-unfold-4-line' : 'ri:menu-unfold-3-line'}
              color="common.white"
            />
          </IconButton>
        </Stack>
        <Stack
          direction="row"
          gap={3.75}
          alignItems="center"
          justifyContent="flex-end"
          mr={3.75}
          flex="1 1 20%"
        >
          <Badge  
            color="error"
            badgeContent=" "
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                top: 11,
                right: 11,
              },
            }}
          >
            <IconButton
              sx={{
                padding: 1,
              }}
              onClick={handleNotificationClick}
            >
              <IconifyIcon icon="ph:bell-bold" width={29} height={32} />
            </IconButton>
          </Badge>
          <UserDropdown />
        </Stack>
      </Toolbar>
      {showNotifications && (
        <Box
          sx={{
            position: 'absolute', 
            top: 85, 
            right: 430, 
            zIndex: 10, 
          }}
        >
          <Notification onClose={() => setShowNotifications(false)} />
        </Box>
      )}    </AppBar>
  );
};

export default Topbar;

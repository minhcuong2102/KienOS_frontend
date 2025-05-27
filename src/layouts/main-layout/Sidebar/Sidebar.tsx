import { ReactElement, useState } from 'react';
import { Link, List, Toolbar, Box  } from '@mui/material';
import SimpleBar from 'simplebar-react';
import NavItem from './NavItem';
import { NavItem as NavItemProps } from "../../../data/nav-items";
import { drawerCloseWidth, drawerOpenWidth } from '..';
import Image from '../../../components/base/Image';
// import logoWithText from '/kienos-logo1.png';
import logoWithText from '../../../../public/kienos-logo1.png';
import logo from '/kienos-logo1.png';
import { rootPaths } from '../../../routes/paths';
import navItems from '../../../data/nav-items'
import React from 'react';

const Sidebar = ({ open }: { open: boolean }): ReactElement => {

  const [items, setItems] = useState<NavItemProps[]>(navItems);

  const handleItemClick = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, active: true } : { ...item, active: false }
      )
    );
  };

  const mainItems = items.filter((item) => item.title !== 'Settings');
  const settingsItem = items.find((item) => item.title === 'Settings');

  return (
    <>
      <Toolbar
        sx={{
          position: 'fixed',
          height: 98,
          zIndex: 1,
          bgcolor: 'background.default',
          p: 0,
          justifyContent: 'center',
          width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
        }}
      >
        <Link
          // href={import.meta.env.VITE_HOMEPAGE_URL}
          sx={{
            mt: 3,
          }}
        >
          <Image
            src={open ? logoWithText : logo}
            alt={open ? 'logo with text' : 'logo'}
            height={70}
          />
        </Link>
      </Toolbar>
      <SimpleBar style={{ maxHeight: '100vh' }}>
        <List
          component="nav"
          sx={{
            mt: 24.5,
            py: 2.5,
            height: 'calc(100vh - 98px)',
            display: 'flex',
            justifyContent: 'space-between',

          }}
        >

          <Box>
            {mainItems.map((navItem) => (
              <NavItem 
                key={navItem.id} 
                navItem={navItem} 
                open={open} 
                onClick={() => handleItemClick(navItem.id)}
                sx={{ mb: 200 }}
              />
            ))}
          </Box>

          {settingsItem && (
            <Box sx={{ mt: 'auto' }}>
              <NavItem
                key={settingsItem.id}
                navItem={settingsItem}
                open={open}
                onClick={() => handleItemClick(settingsItem.id)}
              />
            </Box>
          )}
        </List>
      </SimpleBar>
    </>
  );
};

export default Sidebar;

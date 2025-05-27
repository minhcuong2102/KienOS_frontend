interface UserMenuItem {
  id: number;
  title: string;
  icon: string;
  color?: string;
}

const userMenuItems: UserMenuItem[] = [
  {
    id: 4,
    title: 'Service Center',
    icon: 'material-symbols:live-help',
    color: 'text.primary',
  },
  {
    id: 5,
    title: 'Logout',
    icon: 'material-symbols:logout',
    color: 'error.main',
  },
];

export default userMenuItems;

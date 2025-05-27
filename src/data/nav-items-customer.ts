export interface NavItem {
  id: number;
  path: string;
  title: string;
  icon: string;
  active: boolean;
}

const navItems: NavItem[] = [
  {
    id: 1,
    path: '/home/dashboard',
    title: 'Dashboard',
    icon: 'mingcute:home-1-fill',
    active: true,
  },
  {
    id: 2,
    path: '/home/workout-schedule',
    title: 'Workout Schedule',
    icon: 'material-symbols-light:leaderboard-outline',
    active: false,
  },
  {
    id: 3,
    path: '/home/product',
    title: 'Registered Services',
    icon: 'lets-icons:bag-alt-light',
    active: false,
  },
  {
    id: 4,
    path: '#!',
    title: 'Message',
    icon: 'bi:chat',
    active: false,
  },
  {
    id: 5,
    path: '#!',
    title: 'Payment History',
    icon: 'ic:round-history',
    active: false,
  },

  {
    id: 6,
    path: '/product',
    title: 'Settings',
    icon: 'mingcute:settings-3-line',
    active: false,
  },
  
];

export default navItems;

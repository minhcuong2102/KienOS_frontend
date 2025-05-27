import paths from "../routes/paths";

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
    path: paths.accounts,
    title: 'Quản lý tài khoản',
    icon: 'mdi:account-group-outline',
    active: true,
  },
  {
    id: 2,
    path: paths.statistics,
    title: 'Thống kê',
    icon: 'material-symbols-light:leaderboard-outline',
    active: false,
  },
  {
    id: 3,
    path: paths.services,
    title: 'Quản lý dịch vụ',
    icon: 'lets-icons:bag-alt-light',
    active: false,
  },
  {
    id: 4,
    path: paths.service_response,
    title: 'Phản hồi dịch vụ',
    icon: 'bi:chat',
    active: false,
  },
  {
    id: 5,
    path: paths.coachs,
    title: 'Quản lý HLV',
    icon: 'ic:outline-person',
    active: false,
  },
  {
    id: 6,
    path: paths.exercises,
    title: 'Quản lý bài tập',
    icon: 'bi:book',
    active: false,
  },
  
];

export default navItems;

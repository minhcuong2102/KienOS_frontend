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
    path: paths.customer,
    title: "Quản lý khách hàng",
    icon: "mdi:account-group-outline",
    active: false,
  },
  {
    id: 2,
    path: paths.schedule,
    title: "Lịch dạy",
    icon: "material-symbols:fitness-center",
    active: false,
  },
  {
    id: 3,
    path: paths.workout_history,
    title: "Lịch sử dạy",
    icon: "material-symbols:history",
    active: false,
  },
  {
    id: 4,
    path: paths.training_plans,
    title: "Quản lý giáo án",
    icon: "bi:book",
    active: false,
  },
  {
    id: 5,
    path: paths.chat,
    title: "Nhắn tin",
    icon: "bi:chat",
    active: false,
  },
  // {
  //   id: 6,
  //   path: paths.profile,
  //   title: "Hồ sơ cá nhân",
  //   icon: "iconoir:profile-circle",
  //   active: false,
  // },
];


export default navItems;

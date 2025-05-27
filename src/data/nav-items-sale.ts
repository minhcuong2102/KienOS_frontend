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
    id: 3,
    path: paths.sale_contracts,
    title: "Quản lý hợp đồng",
    icon: "material-symbols:contract-outline",
    active: false,
  },
  {
    id: 4,
    path: paths.service_response_for_sale,
    title: "Phản hồi dịch vụ",
    icon: "bi:chat",
    active: false,
  },
  {
    id: 5,
    path: paths.statistics_for_sale,
    title: 'Thống kê',
    icon: 'material-symbols-light:leaderboard-outline',
    active: false,
  },
];


export default navItems;

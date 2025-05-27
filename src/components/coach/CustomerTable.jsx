import { useMemo, useState } from "react";
import { useCustomerData } from "../../data/customer-data";
import IconifyIcon from "../base/IconifyIcon";
import CustomPagination from "../../components/common/CustomPagination";
import CustomNoResultsOverlay from "../../components/common/CustomNoResultsOverlay";
import {
  Stack,
  Avatar,
  Tooltip,
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Box,
  Drawer,
  Divider,
  Card,
  CardContent,
} from "@mui/material";

import { DataGrid, GridActionsCellItem, useGridApiRef } from "@mui/x-data-grid";

const CustomerTable = ({ searchText }) => {
  const apiRef = useGridApiRef();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useCustomerData(reloadTrigger);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleViewInfo = (userId) => {
    const user = rows.find((user) => user.id === userId);
    if (user) {
      setSelectedUser(user);
      console.log(user);
      setOpenDrawer(true);
    } else {
      console.error(`User with ID ${userId} not found`);
    }
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setActiveTab(0);
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      resizable: false,
      flex: 1,
      minWidth: 140,
      headerAlign: "center",
    },
    {
      field: "avatar",
      headerName: "Ảnh đại diện",
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Stack direction="row" gap={1} alignItems="center">
            <Tooltip
              title={`${params.row.customer_profile.first_name} ${params.row.customer_profile.last_name}`}
              placement="top"
              arrow
            >
              {params.row.customer_profile.avatar ? (
                <Avatar
                  src={params.row.customer_profile.avatar}
                  alt={`${params.row.customer_profile.first_name} ${params.row.customer_profile.last_name}`}
                />
              ) : (
                <Avatar>
                  {params.row.customer_profile.first_name?.charAt(0)}
                </Avatar>
              )}
            </Tooltip>
          </Stack>
        );
      },
    },
    {
      field: "fullname",
      headerName: "Họ và Tên",
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const fullName = `${params.row.customer_profile.first_name} ${params.row.customer_profile.last_name}`;
        return <Typography variant="body2">{fullName}</Typography>;
      },
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      resizable: false,
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Stack direction="row" gap={6} alignItems="center">
            <Typography variant="body2">
              {params.row.customer_profile.address}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      resizable: false,
      flex: 1,
      minWidth: 80,
      getActions: (params) => {
        return [
          <Tooltip title="Xem" key={params.id}>
            <GridActionsCellItem
              icon={<IconifyIcon icon="mdi:eye"/>}
              label="Xem"
              onClick={() => handleViewInfo(params.id)}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.field !== "id"),
    [columns]
  );

  return (
    <>
      <DataGrid
        columns={visibleColumns}
        rows={rows}
        loading={loading}
        checkboxSelection
        disableColumnMenu
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 4 } },
        }}
        slots={{
          loadingOverlay: CircularProgress,
          pagination: CustomPagination,
          noResultsOverlay: CustomNoResultsOverlay,
        }}
      />

      {/* Side Panel for Viewing User Info */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        sx={{ width: 650 }}
      >
        <Box sx={{ width: 650, padding: 5 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "center", color: "primary.main" }}
          >
            Thông tin tài khoản
          </Typography>
          <Divider sx={{ margin: 3, borderColor: "primary.main" }} />
          {selectedUser && selectedUser.customer_profile && (
            <Stack
              key={selectedUser.customer_profile.id}
              alignItems="center"
              sx={{ mb: 7 }}
            >
              <Avatar
                src={
                  selectedUser.customer_profile.avatar ||
                  "https://placehold.co/100x100"
                }
                sx={{ width: 100, height: 100 }}
              />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "white", mt: 1 }}
              >
                <strong>
                  {selectedUser.customer_profile.first_name}{" "}
                  {selectedUser.customer_profile.last_name}
                </strong>
              </Typography>
            </Stack>
          )}

          {/* Tabs for navigation */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tổng quan" />
            <Tab label="Gói PT" />
            <Tab label="Gói tháng" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 &&
              selectedUser &&
              selectedUser.customer_profile && (
                <Card
                  variant="outlined"
                  sx={{
                    minWidth: 275,
                    borderColor: "white",
                    minHeight: 350,
                    backgroundColor: "background.default",
                    borderRadius: 2,
                    mb: 10,
                  }}
                >
                  <CardContent sx={{ padding: "20px" }}>
                    <Stack spacing={3}>
                      {/* Địa chỉ */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Địa chỉ:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.address}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Giới tính */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Giới tính:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.gender === 1
                              ? "Nam"
                              : "Nữ"}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Ngày sinh */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Ngày sinh:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.birthday}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Chiều cao */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Chiều cao:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.height !== null &&
                            selectedUser.customer_profile.height !== undefined
                              ? `${selectedUser.customer_profile.height} cm`
                              : "Chưa cập nhật"}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Cân nặng */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Cân nặng:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.weight !== null &&
                            selectedUser.customer_profile.weight !== undefined
                              ? `${selectedUser.customer_profile.weight} kg`
                              : "Chưa cập nhật"}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Tình trạng sức khoẻ */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Tình trạng sức khoẻ:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.health_condition !==
                              null &&
                            selectedUser.customer_profile.health_condition !==
                              undefined
                              ? `${selectedUser.customer_profile.health_condition}`
                              : "Chưa cập nhật"}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Mục tiêu tập luyện */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            flexShrink: 0,
                            minWidth: "200px",
                          }}
                          noWrap
                        >
                          Mục tiêu tập luyện:
                        </Typography>
                        <Typography variant="body1">
                          <strong>
                            {selectedUser.customer_profile.workout_goal !==
                              null &&
                            selectedUser.customer_profile.workout_goal !==
                              undefined
                              ? `Cân nặng: ${selectedUser.customer_profile.workout_goal.weight} kg, Tỷ lệ mỡ cơ thể: ${selectedUser.customer_profile.workout_goal.body_fat}%, Khối lượng cơ: ${selectedUser.customer_profile.workout_goal.muscle_mass} kg`
                              : "Chưa cập nhật"}
                          </strong>
                        </Typography>
                      </Box>
                      {/* Số điện thoại */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Số điện thoại:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{selectedUser.customer_profile.phone}</strong>
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}

            {activeTab === 1 &&
              selectedUser &&
              selectedUser.registered_ptservices.map((service, index) => (
                <Card
                  key={index} // Unique key for each card
                  variant="outlined"
                  sx={{
                    minWidth: 275,
                    borderColor: "white",
                    minHeight: 350,
                    backgroundColor: "background.default",
                    borderRadius: 2,
                    mb: 10,
                    mt: 10,
                  }}
                >
                  <CardContent sx={{ padding: "20px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ color: "white" }}
                    >
                      {service.name}
                    </Typography>
                    <Divider sx={{ borderColor: "white" }} />
                    {/* Service Name */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Tên gói:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{service.name}</strong>
                      </Typography>
                    </Box>

                    {/* Service Cost */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Giá gói:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{service.cost_per_session} VNĐ</strong>
                      </Typography>
                    </Box>

                    {/* Start Date */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Ngày bắt đầu:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{selectedUser.start_date}</strong>
                      </Typography>
                    </Box>

                    {/* Number of Sessions */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Số buổi:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{service.session_duration}</strong>
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Số buổi còn lại:
                      </Typography>
                      <Typography variant="body1">
                        <strong>
                          {service.session_duration -
                            selectedUser.used_sessions}
                        </strong>
                      </Typography>
                    </Box>

                    {/* Session Duration */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Thời gian mỗi buổi:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{service.session_duration}p</strong>
                      </Typography>
                    </Box>

                    {/* Expire Date */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Ngày hết hạn:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{selectedUser.expire_date}</strong>
                      </Typography>
                    </Box>

                    {/* Validity Period */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ color: "white" }}>
                        Thời hạn gói:
                      </Typography>
                      <Typography variant="body1">
                        <strong>{service.validity_period} ngày</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

            {activeTab === 2 &&
            selectedUser &&
            selectedUser.registered_nonptservices.length > 0
              ? selectedUser.registered_nonptservices.map((service, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      minWidth: 275,
                      borderColor: "white",
                      minHeight: 350,
                      backgroundColor: "background.default",
                      borderRadius: 2,
                      mb: 10,
                      mt: 10,
                    }}
                  >
                    <CardContent sx={{ padding: "20px" }}>
                      {/* Service Name */}
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{ color: "white" }}
                      >
                        {service.name}
                      </Typography>
                      <Divider sx={{ borderColor: "white" }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Tên gói:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{service.name}</strong>
                        </Typography>
                      </Box>

                      {/* Service Cost per Month */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Giá theo tháng:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{service.cost_per_month}</strong>
                        </Typography>
                      </Box>

                      {/* Start Date */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Ngày bắt đầu:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{selectedUser.start_date}</strong>
                        </Typography>
                      </Box>

                      {/* Number of Months */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Số tháng:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{service.number_of_month}</strong>
                        </Typography>
                      </Box>

                      {/* Expire Date */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1" sx={{ color: "white" }}>
                          Ngày hết hạn:
                        </Typography>
                        <Typography variant="body1">
                          <strong>{selectedUser.expire_date}</strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              : activeTab === 2 && <Typography>Không có dữ liệu</Typography>}
          </Box>

          <Button
            onClick={handleCloseDrawer}
            color="error"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Đóng
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default CustomerTable;

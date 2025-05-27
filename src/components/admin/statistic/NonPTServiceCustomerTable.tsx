import { useMemo, useEffect, ReactElement, useState } from "react";
import { useNonPTServiceCustomerData } from "../../../data/nonptservice-customer-data";
import IconifyIcon from "../../base/IconifyIcon";
import React from "react";
import CustomPagination from "../../common/CustomPagination";
import CustomNoResultsOverlay from "../../common/CustomNoResultsOverlay";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { rootPaths } from "../../../routes/paths";
import {
  Stack,
  Avatar,
  Tooltip,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
  Box,
} from "@mui/material";

import {
  GridApi,
  DataGrid,
  GridSlots,
  GridColDef,
  useGridApiRef,
  GridActionsCellItem,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";

interface PTService {
  id: number;
  discount: string;
  name: string;
  session_duration: string;
  cost_per_session: string;
  validity_period: string;
}

interface NonPTService {
  id: number;
  discount: string;
  name: string;
  number_of_month: string;
  cost_per_month: string;
}

interface Coach {
  id: string;
  avatar: string;
  average_rating: number;
  first_name: string;
  last_name: string;
  address: string;
  gender: number;
  birthday: string;
  height: string;
  weight: string;
  start_date: string;
}

interface Contract {
  id: number;
  ptservice: PTService;
  nonptservice: NonPTService;
  address: string;
  start_date: string;
  expire_date: string;
  coach: Coach;
  is_purchased: boolean;
  used_sessions: number;
  number_of_session: string;
}

interface WorkoutGoal {
  general: string;
  weight: string;
  body_fat: string;
  muscle_mass: string;
}

interface Customer {
  id: string;
  avatar: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  address: string;
  gender: number;
  birthday: string;
  height: number;
  weight: number;
  health_condition: string;
  contracts: Contract[];
  workout_goal: WorkoutGoal;
}

const NonPTServiceCustomerTable = ({
  searchText,
}: {
  searchText: string;
}): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [dropdownData, setDropdownData] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState("");

  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useNonPTServiceCustomerData(
    reloadTrigger,
    selectedValue
  );
  const axiosPrivate = useAxiosPrivate();
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingUser);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await axiosPrivate.get(rootPaths.root + "/api/v1/nonpt-services/all/", {
        withCredentials: true,
      });
      setDropdownData(response.data);
    };
    fetchDropdownData();
  }, [axiosPrivate]);

  const handleDropdownChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedValue(event.target.value as string);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleViewDetail = (id: string) => {
    setEditMode(true);
    const customer = rows.find((row) => row.id === id);
    if (customer) {
      setEditingUser(customer);
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
  };

  const columns: GridColDef<any>[] = [
    {
      field: "id",
      headerName: "ID",
      resizable: false,
      minWidth: 60,
    },
    {
      field: "first_name",
      headerName: "Họ",
      valueGetter: (params: any) => {
        return params;
      },
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Stack direction="row" gap={6} alignItems="center">
            <Tooltip title={params.row.first_name} placement="top" arrow>
              {params.row.avatar ? (
                <Avatar src={params.row.avatar} alt={params.row.first_name} />
              ) : (
                <Avatar>{params.row.first_name?.charAt(0)}</Avatar>
              )}
            </Tooltip>
            <Typography variant="body2">{params.row.first_name}</Typography>
          </Stack>
        );
      },
      resizable: false,
      flex: 0.5,
      minWidth: 50,
      headerAlign: "center",
      align: "left",
    },
    {
      field: "last_name",
      headerName: "Tên",
      resizable: false,
      flex: 0,
      minWidth: 50,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      resizable: false,
      flex: 1,
      minWidth: 400,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "gender",
      headerName: "Giới tính",
      resizable: false,
      flex: 0.5,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Typography variant="body2">
            {params.row.gender === 1 ? "Nam" : "Nữ"}
          </Typography>
        );
      },
    },
    {
      field: "birthday",
      headerName: "Ngày sinh",
      resizable: false,
      flex: 0,
      minWidth: 145,
      headerAlign: "center",
      align: "center",
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
          <Tooltip title="Chi tiết">
            <GridActionsCellItem
              icon={
                <IconifyIcon
                  icon="mdi:eye"
                  color="text.secondary"
                  sx={{ fontSize: "body1.fontSize", pointerEvents: "none" }}
                />
              }
              label="Edit"
              size="small"
              onClick={() => handleViewDetail(params.id)}
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

  useEffect(() => {
    apiRef.current.setQuickFilterValues(
      searchText.split(/\b\W+\b/).filter((word: string) => word !== "")
    );
  }, [searchText]);

  useEffect(() => {
    const handleResize = () => {
      if (apiRef.current) {
        apiRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [apiRef]);

  return (
    <>
      <DataGrid
        apiRef={apiRef}
        density="standard"
        columns={visibleColumns}
        autoHeight={false}
        rowHeight={56}
        checkboxSelection
        disableColumnMenu
        disableRowSelectionOnClick
        rows={rows}
        loading={loading}
        onResize={() => {
          apiRef.current.autosizeColumns({
            includeOutliers: true,
            expand: true,
          });
        }}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 4 } },
        }}
        slots={{
          loadingOverlay: CircularProgress as GridSlots["loadingOverlay"],
          pagination: CustomPagination as GridSlots["pagination"],
          noResultsOverlay:
            CustomNoResultsOverlay as GridSlots["noResultsOverlay"],
        }}
        slotProps={{
          pagination: { labelRowsPerPage: rows.length },
        }}
        sx={{
          height: 1,
          width: 1,
          tableLayout: "fixed",
          scrollbarWidth: "thin",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "10px",
        }}
      >
        <Select
          value={selectedValue}
          onChange={handleDropdownChange}
          displayEmpty
          inputProps={{ "aria-label": "Select data" }}
          sx={{ width: "400px", height: "40px" }}
        >
          <MenuItem value="">
            <p>Chọn gói tháng</p>
          </MenuItem>
          {dropdownData.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: 10,
            padding: "30px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", color: "white" }}>
          CHI TIẾT
        </DialogTitle>
        <DialogContent>
          {editingUser && (
            <Stack direction="column" alignItems="center" spacing={2}>
              {editingUser.avatar ? (
                <Avatar
                  src={editingUser.avatar}
                  alt={editingUser.first_name}
                  sx={{ width: 80, height: 80 }}
                />
              ) : (
                <Avatar sx={{ width: 80, height: 80 }}>
                  {editingUser.first_name?.charAt(0)}
                </Avatar>
              )}

              <Typography variant="h6" color="white">
                {editingUser?.first_name && editingUser?.last_name
                  ? editingUser?.first_name + " " + editingUser?.last_name
                  : "Chưa điền"}
              </Typography>

              <Typography variant="body1" textAlign="center" color="white">
                Địa chỉ: {editingUser?.address ?? "Chưa điền"}
              </Typography>
              <Typography variant="body1" textAlign="center" color="white">
                Email: {editingUser?.email ?? "Chưa điền"}
              </Typography>

              <TextField
                margin="dense"
                label="Giới tính"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={
                  editingUser?.gender === 0
                    ? "Nữ"
                    : editingUser?.gender === 1
                    ? "Nam"
                    : editingUser?.gender === 2
                    ? "Khác"
                    : "Chưa điền"
                }
              />

              <TextField
                margin="dense"
                label="Ngày sinh"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.birthday ?? "Chưa điền"}
              />

              <TextField
                margin="dense"
                label="Chiều cao"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.height ?? "Chưa điền"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="dense"
                label="Cân nặng"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.weight ?? "Chưa điền"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="Tình trạng sức khoẻ"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.health_condition ?? "Chưa điền"}
              />

              <Typography variant="h6" color="white" marginTop={3}>
                Mục tiêu tập luyện
              </Typography>

              <TextField
                margin="dense"
                label="Mục tiêu chung"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.workout_goal?.general ?? "Chưa điền"}
              />

              <TextField
                margin="dense"
                label="Cân nặng"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.workout_goal?.weight ?? "Chưa điền"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="dense"
                label="Khối lượng cơ"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.workout_goal?.muscle_mass ?? "Chưa điền"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="dense"
                label="Tỉ lệ mỡ"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.workout_goal?.body_fat ?? "Chưa điền"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setServiceModalOpen(true)}
            variant="contained"
            sx={{
              width: "250px",
              height: "50px",
              fontSize: "20px",
              padding: "10px 20px",
              backgroundColor: "green",
              color: "white",
            }}
          >
            Thông tin dịch vụ
          </Button>
          <Button
            onClick={handleCloseEditModal}
            variant="contained"
            sx={{
              width: "100px",
              height: "50px",
              fontSize: "20px",
              padding: "10px 20px",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        PaperProps={{
          style: {
            width: "100%",
            height: "600px",
            borderRadius: 10,
            padding: "30px",
            cursor: "pointer",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", color: "white" }}>
          DỊCH VỤ ĐÃ ĐĂNG KÝ
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ borderRight: "1px solid white" }}>
              <Typography
                variant="h6"
                color="white"
                sx={{ marginBottom: 5 }}
                textAlign="center"
              >
                Gói tháng
              </Typography>
              {editingUser?.contracts?.some(
                (contract) => contract.nonptservice
              ) ? (
                editingUser?.contracts
                  ?.filter((contract) => contract.nonptservice)
                  .map((contract, index) => {
                    const isExpired =
                      new Date() > new Date(contract.expire_date);
                    return (
                      <Box
                        key={index}
                        sx={{
                          border: "1px solid white",
                          padding: "1rem",
                          borderRadius: "10px",
                          marginBottom: "0.5rem",
                          marginRight: "1rem",
                          marginLeft: "0.5rem",
                          height: "200px",
                          backgroundColor: "#3c3c3c",
                        }}
                      >
                        <Stack spacing={2} sx={{ padding: "5px" }}>
                          <Typography variant="body1" color="white">
                            {contract.nonptservice.name}
                            {isExpired && (
                              <span style={{ color: "red" }}>
                                {" "}
                                (Đã hết hạn)
                              </span>
                            )}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: 5 }}
                            color="white"
                          >
                            Tình trạng:{" "}
                            {contract.is_purchased === true
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </Typography>
                          <Typography
                            variant="body2"
                            marginLeft={5}
                            color="white"
                          >
                            Thời gian tập:{" "}
                            {contract.nonptservice.number_of_month} tháng
                          </Typography>
                          <Typography
                            variant="body2"
                            marginLeft={5}
                            color="white"
                          >
                            Giá mỗi tháng:{" "}
                            {contract.nonptservice.cost_per_month} VNĐ
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })
              ) : (
                <Typography
                  variant="body1"
                  color="red"
                  marginTop={50}
                  textAlign="center"
                >
                  Chưa từng đăng ký
                </Typography>
              )}
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="h6"
                color="white"
                textAlign="center"
                sx={{ marginBottom: 5 }}
              >
                Gói HLV
              </Typography>
              {editingUser?.contracts?.some(
                (contract) => contract.ptservice
              ) ? (
                editingUser?.contracts
                  ?.filter((contract) => contract.ptservice)
                  .map((contract, index) => {
                    const isExpired =
                      new Date() > new Date(contract.expire_date);
                    return (
                      <Box
                        key={index}
                        sx={{
                          border: "1px solid white",
                          padding: "1rem",
                          borderRadius: "10px",
                          marginBottom: "0.5rem",
                          marginRight: "0.5rem",
                          marginLeft: "0.5rem",
                          height: "200px",
                          backgroundColor: "#4d4d4d",
                        }}
                      >
                        <Stack spacing={2} sx={{ padding: "5px" }}>
                          <Typography variant="body1" color="white">
                            {contract.ptservice.name}
                            {isExpired && (
                              <span style={{ color: "red" }}>
                                {" "}
                                (Đã hết hạn)
                              </span>
                            )}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: 5 }}
                            color="white"
                          >
                            Tình trạng:{" "}
                            {contract.is_purchased === true
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ marginLeft: 5 }}
                            color="white"
                          >
                            Thời hạn: {contract.start_date} đến{" "}
                            {contract.expire_date}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ marginLeft: 5 }}
                            color="white"
                          >
                            Đã tập: {contract.used_sessions} /{" "}
                            {contract.number_of_session}
                          </Typography>

                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="subtitle2">
                                  {contract.coach.first_name}{" "}
                                  {contract.coach.last_name}
                                </Typography>
                                <Typography variant="body2">
                                  Giới tính:{" "}
                                  {contract.coach.gender === 1 ? "Nam" : "Nữ"}
                                </Typography>
                                <Typography variant="body2">
                                  Ngày sinh: {contract.coach.birthday}
                                </Typography>
                                <Typography variant="body2">
                                  Địa chỉ: {contract.coach.address}
                                </Typography>
                                <Typography variant="body2">
                                  Chiều cao: {contract.coach.height} cm
                                </Typography>
                                <Typography variant="body2">
                                  Cân nặng: {contract.coach.weight} kg
                                </Typography>
                              </Box>
                            }
                          >
                            <Typography
                              variant="body2"
                              sx={{ marginLeft: 5 }}
                              color="white"
                            >
                              HLV: {contract.coach.first_name}{" "}
                              {contract.coach.last_name}
                            </Typography>
                          </Tooltip>
                        </Stack>
                      </Box>
                    );
                  })
              ) : (
                <Typography
                  variant="body1"
                  color="red"
                  marginTop={50}
                  textAlign="center"
                >
                  Chưa từng đăng ký
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setServiceModalOpen(false)}
            variant="contained"
            sx={{
              width: "100px",
              height: "50px",
              fontSize: "20px",
              padding: "10px 20px",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NonPTServiceCustomerTable;

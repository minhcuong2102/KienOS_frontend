import { useMemo, useEffect, ReactElement, useState } from "react";
import { useCoachsData } from "../../../data/coach-data";
import IconifyIcon from "../../base/IconifyIcon";
import React from "react";
import CustomPagination from "../../common/CustomPagination";
import CustomNoResultsOverlay from "../../common/CustomNoResultsOverlay";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
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
  TextField,
  Rating,
  IconButton,
  Box,
  InputAdornment,
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

interface WorkoutGoal {
  general: string;
}
interface Customer {
  id: number;
  avatar: string;
  address: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  gender: number;
  birthday: string;
  height: number | null;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
  workout_goal: WorkoutGoal;
}

interface PTService {
  id: number;
  discount: string;
  name: string;
  session_duration: string;
  cost_per_session: string;
  validity_period: string;
}

interface Contract {
  id: number;
  ptservice: PTService;
  address: string;
  start_date: string;
  expire_date: string;
  customer: Customer;
  is_purchased: boolean;
  used_sessions: number;
  number_of_session: string;
}

interface Coach {
  id: string;
  avatar: string;
  email: string;
  phone: string;
  average_rating: number;
  first_name: string;
  last_name: string;
  address: string;
  gender: number;
  birthday: string;
  height: string;
  weight: string;
  start_date: string;
  experiences: string;
  
  contracts: Contract[];
}

const CoachTable = ({ searchText }: { searchText: string }): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const { rows, loading, error } = useCoachsData();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Coach | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingUser);
  const [customerDetailOpen, setCustomerDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  const handleViewDetail = (id: string) => {
    setEditMode(true);
    const coach = rows.find((row) => row.id === id);
    if (coach) {
      setEditingUser(coach);
      console.log(coach);
      setEditModalOpen(true);
    }
  };

  const handleViewCustomerDetails = (customerId: number) => {
    const contract = editingUser?.contracts.find((c) => c.customer.id === customerId);
    if (contract) {
      setSelectedContract(contract);
      setCustomerDetailOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
  };

  const handleCloseCustomerDetailModal = () => {
    setCustomerDetailOpen(false);
    setSelectedContract(null);
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
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: "last_name",
      headerName: "Tên",
      resizable: false,
      flex: 0.5,
      minWidth: 50,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "gender",
      headerName: "Giới tính",
      resizable: false,
      flex: 0.5,
      minWidth: 50,
      headerAlign: 'center',
      align: 'center',
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Typography variant="body2">
            {params.row.gender === 0
              ? "Nữ"
              : params.row.gender === 1
              ? "Nam"
              : "Khác"}
          </Typography>
        );
      },
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      resizable: false,
      flex: 1.5,
      minWidth: 300,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: "birthday",
      headerName: "Ngày sinh",
      resizable: false,
      flex: 0.5,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
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

      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
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

              <Rating value={editingUser?.average_rating} readOnly />

              <Typography variant="h6" color="white">
                {editingUser?.first_name ?? ""} {editingUser?.last_name ?? ""}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                {editingUser?.email ?? ""}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                {editingUser?.phone ?? ""}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                Địa chỉ: {editingUser?.address ?? ""}
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
                    : "Khác"
                }
              />

              <TextField
                margin="dense"
                label="Ngày sinh"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.birthday ?? ""}
              />

              <TextField
                margin="dense"
                label="Chiều cao"
                sx={{ color: "white" }}
                fullWidth
                variant="standard"
                value={editingUser?.height ?? ""}
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
                value={editingUser?.weight ?? ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="dense"
                label="Ngày bắt đầu"
                fullWidth
                sx={{ color: "white" }}
                variant="standard"
                value={editingUser?.start_date ?? ""}
              />

              <TextField
                fullWidth
                label="Kinh nghiệm"
                name="experiences"
                value={editingUser?.experiences || 'Chưa điền'}
                multiline
                minRows={5}
              />

              <Typography
                variant="h6"
                sx={{
                  marginTop: 2,
                  alignSelf: "flex-start",
                  color: "white",
                  marginBottom: 2,
                }}
              >
                Danh sách khách hàng:
              </Typography>
              
              {editingUser.contracts.length > 0 ? (
                <Stack
                  direction="column"
                  spacing={1}
                  alignSelf="flex-start"
                  width="100%"
                >
                  {editingUser.contracts.map((contract) => (
                    <Box
                      key={contract.customer.id}
                      sx={{
                        border: "1px solid wheat",
                        borderRadius: 1,
                        padding: 1,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ marginLeft: 4, color: "white", width: '200px' }}
                      >
                        {contract.customer.first_name} {contract.customer.last_name}
                      </Typography>

                      <IconButton
                        onClick={() => handleViewCustomerDetails(contract.customer.id)}
                      >
                        <IconifyIcon icon="mdi:eye" color="white" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1">Chưa có khách hàng.</Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
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
        open={customerDetailOpen}
        onClose={handleCloseCustomerDetailModal}
        maxWidth="sm"
        
      >
        <DialogTitle sx={{ textAlign: "center", color: "white", marginTop: 4 }}>
          THÔNG TIN KHÁCH HÀNG
        </DialogTitle>
        <DialogContent sx={{ color: "white", padding: 10 }}>
          {selectedContract && (
            <Stack spacing={2}>
              <Avatar
                src={selectedContract.customer.avatar}
                alt={`${selectedContract.customer.first_name} ${selectedContract.customer.last_name}`}
                sx={{ width: 80, height: 80, border: "2px solid white", alignSelf: 'center' }}
              />
              
              <Typography variant="h6" sx={{ alignSelf: 'center' }}>
                {selectedContract.customer?.first_name ?? ''} {selectedContract.customer?.last_name ?? ''}
              </Typography>

              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                {selectedContract.customer?.email ?? 'Chưa có email'}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                {selectedContract.customer?.phone ?? 'Chưa có SĐT'}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center' }}>
                {selectedContract.customer?.address ?? 'Chưa có địa chỉ'}
              </Typography>
              
              <Typography variant="h6" sx={{ fontSize: '0.7rem',  color: 'rgba(128, 128, 128, 0.8)', alignSelf: 'center', marginBottom: 10 }}>
                Tình trạng hợp đồng: <span style={{ color: 'white', fontStyle: 'italic'  }}>
                 {selectedContract.is_purchased === true ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', alignSelf: 'left'}}>
                Thông tin cá nhân <span style={{ color: 'white', fontStyle: 'italic'  }}>
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Giới tính: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.gender != null ? 
                  `${selectedContract.customer.gender === 0 ? "Nữ" : (selectedContract.customer.gender === 1 ? "Nam" : "Khác")}` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Ngày sinh: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.birthday != null ? `${selectedContract.customer.birthday}` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Chiều cao: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.height != null ? `${selectedContract.customer.height} cm` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Cân nặng: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.weight != null ? `${selectedContract.customer.weight} kg` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Tỷ lệ mỡ: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.body_fat != null ? `${selectedContract.customer.body_fat} %` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Khối lượng cơ: <span style={{ color: 'wheat' }}>
                  {selectedContract.customer.muscle_mass != null ? `${selectedContract.customer.muscle_mass} kg` : "Chưa điền"}
                </span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', alignSelf: 'left', marginTop: 5}}>
                Thông tin gói tập<span style={{ color: 'white', fontStyle: 'italic'  }}>
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7}}>
                Gói tập: <span style={{ color: 'wheat', fontStyle: 'italic'  }}>
                  {selectedContract?.ptservice.name ?? 'Không xác định'}
                </span>
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Thời hạn dịch vụ PT: <span style={{ color: 'wheat' }}>
                  {selectedContract?.start_date ?? ''} {' - '} {selectedContract?.expire_date ?? '0'}
                </span>
              </Typography>
      
              <Typography variant="body1" sx={{ color: 'white', marginLeft: 7 }}>
                Số buổi đã tập: <span style={{ color: 'wheat'}}>
                  {selectedContract?.used_sessions ?? '0'} / {selectedContract?.number_of_session ?? '0'}
                </span>
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCustomerDetailModal} sx={{ alignSelf: 'center', width: '100px', height: '40px', margin: 4 }}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CoachTable;

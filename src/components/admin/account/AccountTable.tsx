import { useMemo, useEffect, ReactElement, useState } from "react";
import { useUsersData } from "../../../data/user-data";
import { stringAvatar } from "../../../helpers/string-avatar";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
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

interface User {
  id: string;
  email: string;
  status: number;
  email_verified: boolean;
  password: string;
  role: string;
}

const AccountTable = ({ searchText }: { searchText: string }): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useUsersData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingUser);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);


  const handleEdit = (id: string) => {
    setEditMode(true);
    const user = rows.find((row) => row.id === id);
    if (user) {
      setEditingUser(user);
      setEditModalOpen(true);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingUser({
      id: "",
      email: "",
      status: 1,
      email_verified: false,
      password: "12345678",
      role: "customer",
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEmailError("");
    setPasswordError("");
  };

  const handleSave = async () => {
    setEmailError("");
    setPasswordError("");

    if (!editingUser) return;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(editingUser.email)) {
      setEmailError("Email phải có dạng: email_name@provider_name.domain");
      return;
    }

    if (editingUser.password && editingUser.password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 kí tự!");
      return;
    }

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    console.log(editingUser);
    try {
      const response = await axiosPrivate.patch(
        `/api/v1/users/${editingUser.id}/`,
        {
          email: editingUser.email,
          status: editingUser.status,
          email_verified: editingUser.email_verified,
          "role": {
            name: editingUser.role,
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setReloadTrigger((prev) => prev + 1);
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        setEmailError("Tài khoản với email này đã tồn tại!");
        return;
      }
    }
  };

  const handleSaveAdd = async () => {
    if (!editingUser) return;

    try {
      const response = await axiosPrivate.post(
        `/api/v1/users/`,
        {
          email: editingUser.email,
          status: editingUser.status,
          email_verified: editingUser.email_verified,
          password: editingUser.password,
          "role": {
            name: editingUser.role,
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Đã thêm người dùng:", editingUser);
      setReloadTrigger((prev) => prev + 1);
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        setEmailError("Tài khoản với email này đã tồn tại!");
        return;
      }
    }
  };

  const handleDelete = async (id?: number) => {
    const idsToDelete = rowSelectionModel.length > 0 ? rowSelectionModel : [id];
    console.log(idsToDelete);

    if (
      idsToDelete.length > 0 &&
      window.confirm("Bạn có muốn xoá (những) tài khoản này không?")
    ) {
      try {
        const response = await axiosPrivate.post('/api/v1/users/delete-multiple/', {
          ids: idsToDelete,
        });
        alert('Xoá thành công!');
        
        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting users:", error);
        alert(error.response?.data?.error || "An error occurred while deleting users.");
      }
    }
  };

  const columns: GridColDef<any>[] = [
    {
      field: "id",
      headerName: "ID",
      resizable: false,
      minWidth: 60,
    },
    {
      field: "email",
      headerName: "Email",
      valueGetter: (params: any) => {
        return params;
      },
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Stack direction="row" gap={6} alignItems="center">
            <Tooltip title={params.row.email} placement="top" arrow>
              <Avatar {...stringAvatar(params.row.email)} />
            </Tooltip>
            <Typography variant="body2">{params.row.email}</Typography>
          </Stack>
        );
      },
      resizable: false,
      flex: 1,
      minWidth: 155,
      headerAlign: 'center',
      align: 'left',
    },
    {
      field: "role",
      headerName: "Vai trò",
      resizable: false,
      flex: 0.5,
      minWidth: 145,
      headerAlign: 'center',
      align: 'center',
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Typography variant="body2">
            {params.row.role === 'admin'
              ? "Quản trị viên"
              : params.row.role === 'customer'
              ? "Khách hàng"
              : params.row.role === 'sale'
              ? "Lễ tân"
              : "HLV"}
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      resizable: false,
      flex: 0.5,
      minWidth: 145,
      headerAlign: 'center',
      align: 'center',
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Typography variant="body2">
            {params.row.status === 1 ? "Đã kích hoạt" : "Đã bị chặn"}
          </Typography>
        );
      },
    },
    {
      field: "email_verified",
      headerName: "Trạng thái email",
      resizable: false,
      flex: 0.5,
      minWidth: 145,
      headerAlign: 'center',
      align: 'center',
      renderCell: (
        params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>
      ) => {
        return (
          <Typography variant="body2">
            {params.row.email_verified === true ? "Đã xác nhận" : "Chưa xác nhận"}
          </Typography>
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
      headerAlign: 'center',
      getActions: (params) => {
        return [
          <Tooltip title="Sửa">
            <GridActionsCellItem
              icon={
                <IconifyIcon
                  icon="fluent:edit-32-filled"
                  color="text.secondary"
                  sx={{ fontSize: "body1.fontSize", pointerEvents: "none" }}
                />
              }
              label="Sửa"
              size="small"
              onClick={() => handleEdit(params.id)}
            />
          </Tooltip>,
          <Tooltip title="Xoá">
            <GridActionsCellItem
              icon={
                <IconifyIcon
                  icon="mingcute:delete-3-fill"
                  color="error.main"
                  sx={{ fontSize: "body1.fontSize", pointerEvents: "none" }}
                />
              }
              label="Xoá"
              size="small"
              onClick={() => handleDelete(params.id)}
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
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
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
        <Button
          onClick={handleAdd}
          sx={{
            width: "40px",
            height: "40px",
            fontSize: "20px",
            padding: "0px 0px",
          }}
        >
          +
        </Button>
      </div>
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 10,
            padding: "30px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          {isEditMode ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        </DialogTitle>
        <DialogContent>
          {editingUser && (
            <>
              {emailError && <Alert severity="error">{emailError}</Alert>}
              {passwordError && <Alert severity="error">{passwordError}</Alert>}
              
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="standard"
                  value={editingUser ? editingUser.email : ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
                <TextField
                  autoFocus
                  margin="dense"
                  label="Mật khẩu"
                  type="text"
                  fullWidth
                  variant="standard"
                  disabled={isEditMode}
                  value={editingUser.password ?? "*********"}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                  sx={{ marginLeft: 3}}
                />
              </Box>
              
              <FormControl fullWidth margin="dense">
                <InputLabel
                  id="role-label"
                  sx={{ marginBottom: 3, marginTop: 3 }}
                >
                  Vai trò
                </InputLabel>
                <Select
                  labelId="role-label"
                  id="role-select"
                  value={editingUser?.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                  <MenuItem value="sale">Lễ tân</MenuItem>
                  <MenuItem value="customer">Khách hàng</MenuItem>
                  <MenuItem value="coach">HLV</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel
                    id="status-label"
                    sx={{ marginBottom: 3, marginTop: 3 }}
                  >
                    Trạng thái tài khoản
                  </InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select"
                    value={editingUser?.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                  >
                    <MenuItem value="1">Kích hoạt</MenuItem>
                    <MenuItem value="2">Bị chặn</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="dense" sx={{ marginLeft: 3 }}>
                  <InputLabel
                    id="email-verified-label"
                    sx={{ marginBottom: 3, marginTop: 3 }}
                  >
                    Trạng thái Email
                  </InputLabel>
                  <Select
                    labelId="email-verified-label"
                    id="email-verified-select"
                    value={editingUser?.email_verified ?? false}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email_verified: Boolean(e.target.value),
                      })
                    }
                  >
                    <MenuItem value={false}>Chưa xác nhận</MenuItem>
                    <MenuItem value={true}>Đã xác nhận</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseEditModal}
            color="error"
            variant="contained"
            sx={{
              width: "100px",
              height: "50px",
              fontSize: "16px",
              padding: "10px 20px",
            }}
          >
            Hủy
          </Button>

          <Button
            onClick={handleSave}
            sx={{
              width: "150px",
              height: "50px",
              fontSize: "16px",
              padding: "10px 20px",
              color: "white",
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
            {isEditMode ? "Lưu" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountTable;

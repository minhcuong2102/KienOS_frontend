import { useMemo, useEffect, ReactElement, useState } from "react";
import { usePTServicesData } from "../../../data/ptservice-data";
import IconifyIcon from "../../base/IconifyIcon";
import React from "react";
import CustomPagination from "../../common/CustomPagination";
import CustomNoResultsOverlay from "../../common/CustomNoResultsOverlay";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import {
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
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

interface CustomerStatistic {
  id: string;
  name: string;
  start_date: string;
  expire_date: string;
  discount: string;
  discount_start: string;
  discount_end: string;
  session_duration: string;
  cost_per_session: string;
  validity_period: string;
  details: string;
}

const PTServiceTable = ({
  searchText,
}: {
  searchText: string;
}): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = usePTServicesData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPTService, setEditingPTService] =
    useState<CustomerStatistic | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingPTService);
  const [emailError, setEmailError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleEdit = (id: string) => {
    setEditMode(true);
    const ptservice = rows.find((row) => row.id === id);
    if (ptservice) {
      setEditingPTService(ptservice);
      setEditModalOpen(true);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingPTService({
      id: "",
      name: "",
      start_date: "",
      expire_date: "",
      discount: "0",
      discount_start: "",
      discount_end: "",
      session_duration: "0",
      cost_per_session: "0",
      validity_period: "0",
      details: "",
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingPTService(null);
    setEmailError("");
  };

  const handleSave = async () => {
    setEmailError("");

    if (!editingPTService) return;

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  function validateFields(editingPTService) {
    const { session_duration, cost_per_session, validity_period, discount, details } = editingPTService;
    
    if (details === "") {
      alert("Vui lòng nhập chi tiết gói tập!");
      return false;
    }

    if (isNaN(session_duration) || session_duration === "") {
      alert("Thời lượng mỗi buổi tập phải có giá trị số hợp lệ!");
      return false;
    }
    
    if (isNaN(cost_per_session) || cost_per_session === "") {
      alert("Giá mỗi buổi tập phải có giá trị số hợp lệ!");
      return false;
    }
  
    if (isNaN(validity_period) || validity_period === "") {
      alert("Thời gian sử dụng phải có giá trị số hợp lệ!");
      return false;
    }
  
    if (isNaN(discount)) {
      alert("Khuyến mãi phải có giá trị số hợp lệ!");
      return false;
    }
  
    return true;
  }

  const handleSaveEdit = async () => {
    if (!editingPTService) return;
    
    if (!validateFields(editingPTService)) {
      return; 
    }

    const payload = {
      ...editingPTService,
      discount_start: editingPTService.discount_start
        ? `${editingPTService.discount_start}T00:00:00`
        : null,
      discount_end: editingPTService.discount_end
        ? `${editingPTService.discount_end}T00:00:00`
        : null,
    };

    try {
      const response = await axiosPrivate.put(
        `/api/v1/pt-services/${editingPTService.id}/`,
        {
          discount: payload.discount,
          discount_start: payload.discount_start,
          discount_end: payload.discount_end,
          name: payload.name,
          session_duration: payload.session_duration,
          cost_per_session: payload.cost_per_session,
          validity_period: payload.validity_period,
          details: payload.details,
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
        setEmailError("Gói tập với tên này đã tồn tại!");
        return;
      }
    }
  };

  const handleSaveAdd = async () => {
    if (!editingPTService) return;
    
    if (!validateFields(editingPTService)) {
      return; 
    }
    
    const payload = {
      ...editingPTService,
      discount_start: editingPTService.discount_start
        ? `${editingPTService.discount_start}T00:00:00`
        : null,
      discount_end: editingPTService.discount_end
        ? `${editingPTService.discount_end}T00:00:00`
        : null,
    };

    try {
      const response = await axiosPrivate.post(
        `/api/v1/pt-services/`,
        {
          discount: payload.discount,
          discount_start: payload.discount_start,
          discount_end: payload.discount_end,
          name: payload.name,
          session_duration: payload.session_duration,
          cost_per_session: payload.cost_per_session,
          validity_period: payload.validity_period,
          details: payload.details,
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
        setEmailError("Gói tập với tên này đã tồn tại!");
        return;
      }
    }
  };

  const handleDelete = async (id: number) => {
    const idsToDelete = rowSelectionModel.length > 0 ? rowSelectionModel : [id];
    console.log(idsToDelete);

    if (
      idsToDelete.length > 0 &&
      window.confirm("Bạn có muốn xoá (những) gói tập này không?")
    ) {
      try {
        const response = await axiosPrivate.post(
          "/api/v1/pt-services/delete-multiple/",
          {
            ids: idsToDelete,
          }
        );
        alert("Xoá thành công!");

        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting ptservices:", error);
        alert(
          error.response?.data?.error ||
            "Đã xảy ra lỗi khi xoá gói tập."
        );
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
      field: "name",
      headerName: "Tên gói tập",
      resizable: false,
      flex: 0.5,
      minWidth: 280,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "discount",
      headerName: "Khuyến mãi (%)",
      resizable: false,
      flex: 0.5,
      minWidth: 145,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "session_duration",
      headerName: "Thời gian tập (phút / buổi)",
      resizable: false,
      flex: 1,
      minWidth: 160,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "cost_per_session",
      headerName: "Giá / buổi (VNĐ)",
      resizable: false,
      flex: 0.8,
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
          <Tooltip title="Edit">
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
          <Tooltip title="Delete">
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
          {isEditMode ? "CẬP NHẬT GÓI TẬP" : "THÊM GÓI TẬP"}
        </DialogTitle>
        <DialogContent>
          {editingPTService && (
            <>
              {emailError && <Alert severity="error">{emailError}</Alert>}

              <TextField
                autoFocus
                margin="dense"
                label="Tên gói tập"
                type="text"
                fullWidth
                variant="standard"
                value={editingPTService ? editingPTService.name : ""}
                onChange={(e) =>
                  setEditingPTService({
                    ...editingPTService,
                    name: e.target.value,
                  })
                }
                InputProps={{
                  sx: {
                    color: "yellow",
                  },
                }}
              />

              <Grid container spacing={2} marginTop={2}>
                <Grid item xs={4}>
                  <TextField
                    margin="dense"
                    label="Thời lượng mỗi buổi tập"
                    type="text"
                    variant="standard"
                    value={editingPTService.session_duration ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        session_duration: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">phút</InputAdornment>
                      ),
                      sx: {
                        color: "yellow",
                      },
                    }}
                    sx={{ width: "90%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    margin="dense"
                    label="Giá mỗi buổi tập"
                    type="text"
                    variant="standard"
                    value={editingPTService.cost_per_session ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        cost_per_session: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">VNĐ</InputAdornment>
                      ),
                      sx: {
                        color: "yellow",
                      },
                    }}
                    sx={{ width: "90%" }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    margin="dense"
                    label="Thời gian sử dụng"
                    type="text"
                    variant="standard"
                    value={editingPTService.validity_period ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        validity_period: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">ngày</InputAdornment>
                      ),
                      sx: {
                        color: "yellow",
                      },
                    }}
                    sx={{ width: "80%" }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginTop={2}>
                <Grid item xs={2}>
                  <TextField
                    margin="dense"
                    label="Khuyến mãi"
                    type="text"
                    variant="standard"
                    value={editingPTService.discount ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        discount: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                      sx: {
                        color: "yellow",
                        width: "100px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    margin="dense"
                    label="Ngày bắt đầu khuyến mãi"
                    type="date"
                    fullWidth
                    variant="standard"
                    value={editingPTService.discount_start || ""}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        discount_start: e.target.value,
                      })
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      sx: { color: "yellow", width: "90%" },
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    margin="dense"
                    label="Ngày kết thúc khuyến mãi"
                    type="date"
                    fullWidth
                    variant="standard"
                    value={editingPTService.discount_end || ""}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        discount_end: e.target.value,
                      })
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      sx: { color: "yellow" },
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} xs={12} marginTop={2}>
                <TextField
                    fullWidth
                    label="Chi tiết gói tập"
                    name="details"
                    value={editingPTService?.details || ''}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        details: e.target.value,
                      })
                    }
                    multiline
                    minRows={5}
                    placeholder="Thêm các quyền lợi, ưu đãi... của gói tập"
                  />
              </Grid>
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

export default PTServiceTable;

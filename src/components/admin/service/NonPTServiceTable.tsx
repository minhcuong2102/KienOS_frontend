import { useMemo, useEffect, ReactElement, useState } from "react";
import { useNonPTServicesData } from "../../../data/nonptservice-data";
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

interface NonPTService {
  id: string;
  name: string;
  discount: string;
  discount_start: string;
  discount_end: string;
  number_of_month: string;
  cost_per_month: string;
  details: string;
}

const NonPTServiceTable = ({
  searchText,
}: {
  searchText: string;
}): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useNonPTServicesData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPTService, setEditingPTService] = useState<NonPTService | null>(
    null
  );
  const [isEditMode, setEditMode] = useState(!!editingPTService);
  const [emailError, setEmailError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const handleEdit = (id: string) => {
    setEditMode(true);
    const nonptservice = rows.find((row) => row.id === id);
    if (nonptservice) {
      setEditingPTService(nonptservice);
      setEditModalOpen(true);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingPTService({
      id: "",
      name: "",
      discount: "0",
      discount_start: "",
      discount_end: "",
      number_of_month: "0",
      cost_per_month: "0",
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

  function validateFields(editingNonPTService) {
    const { number_of_month, cost_per_month, discount, details } = editingNonPTService;
  
    if (details === "") {
      alert("Vui lòng nhập chi tiết gói tập!");
      return false;
    }

    if (isNaN(number_of_month) || number_of_month === "") {
      alert("Thời lượng mỗi buổi tập phải có giá trị số hợp lệ!");
      return false;
    }
    
    if (isNaN(cost_per_month) || cost_per_month === "") {
      alert("Giá mỗi buổi tập phải có giá trị số hợp lệ!");
      return false;
    }
  
    if (isNaN(discount)) {
      alert("Khuyến mãi là giá trị số hợp lệ!");
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
        `/api/v1/nonpt-services/${editingPTService.id}/`,
        {
          discount: payload.discount,
          discount_start: payload.discount_start,
          discount_end: payload.discount_end,
          name: payload.name,
          number_of_month: payload.number_of_month,
          cost_per_month: payload.cost_per_month,
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
        `/api/v1/nonpt-services/`,
        {
          discount: payload.discount,
          discount_start: payload.discount_start,
          discount_end: payload.discount_end,
          name: payload.name,
          number_of_month: payload.number_of_month,
          cost_per_month: payload.cost_per_month,
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
          "/api/v1/nonpt-services/delete-multiple/",
          {
            ids: idsToDelete,
          }
        );
        alert("Xoá thành công!");

        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting nonptservices:", error);
        alert(
          error.response?.data?.error ||
            "An error occurred while deleting nonptservices."
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
      minWidth: 300,
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
      field: "number_of_month",
      headerName: "Số tháng tập",
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "cost_per_month",
      headerName: "Giá / tháng (VNĐ)",
      resizable: false,
      flex: 0.5,
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

              <Grid container xs={12} spacing={2} marginTop={2}>
                <Grid item xs={5} sx={{ marginRight: 30 }}>
                  <TextField
                    margin="dense"
                    label="Số tháng tập"
                    type="text"
                    variant="standard"
                    fullWidth
                    value={editingPTService.number_of_month ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        number_of_month: e.target.value,
                      })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">tháng</InputAdornment>
                      ),
                      sx: {
                        color: "yellow",
                      },
                    }}
                    sx={{ width: "90%" }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    margin="dense"
                    label="Giá mỗi tháng tập"
                    fullWidth
                    type="text"
                    variant="standard"
                    value={editingPTService.cost_per_month ?? "0"}
                    onChange={(e) =>
                      setEditingPTService({
                        ...editingPTService,
                        cost_per_month: e.target.value,
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
              </Grid>

              <Grid container spacing={2} xs={12} marginTop={2}>
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

export default NonPTServiceTable;

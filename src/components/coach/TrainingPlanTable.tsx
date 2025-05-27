import { useMemo, useEffect, ReactElement, useState } from "react";
import { useTrainingPlanData } from "../../data/trainingplan-data";
import IconifyIcon from "../base/IconifyIcon";
import React from "react";
import CustomPagination from "../common/CustomPagination";
import CustomNoResultsOverlay from "../common/CustomNoResultsOverlay";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { rootPaths } from "../../routes/paths";
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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

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
  body_fat: string;
  muscle_mass: string;
  weight: string;
}

interface Customer {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  gender: number;
  birthday: string;
  height: number;
  weight: number;
  health_condition: string;
  used_sessions: string;
  total_sessions: string;
  workout_goal: WorkoutGoal;
}

interface Category {
  id: string;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
  rest_period: string;
  duration: string;
  repetitions: string;
  image_url: string;
  categories: Category[];
}

interface TraningPlan {
  id: string;
  exercises: Exercise[];
  note: string;
  overview: string;
  estimated_duration: string;
  customer: Customer;
}

const TrainingPlanTable = ({
  searchText,
}: {
  searchText: string;
}): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [dropdownData, setDropdownData] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState("");

  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useTrainingPlanData(
    reloadTrigger,
    selectedValue
  );
  const axiosPrivate = useAxiosPrivate();
  const [editingTP, setEditingTP] = useState<TraningPlan | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingTP);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer | null>([]);
  const [openAddExerciseDialog, setOpenAddExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(""); // Selected exercise for adding to workout schedule
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]); // All distinct categories from all exercises
  const [exercises, setExercises] = useState([]); // All exercises in system
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);

  
  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await axiosPrivate.get(
        rootPaths.root + "/api/v1/coach-profiles/get-customers/",
        {
          withCredentials: true,
        }
      );

      const formattedRows = response.data.customers.map((customer) => ({
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        address: customer.address,
        gender: customer.gender,
        birthday: customer.birthday,
        avatar: customer.avatar,
        used_sessions: customer.used_sessions,
        total_sessions: customer.total_sessions,
      }));

      setDropdownData(formattedRows);
      setCustomers(formattedRows);
    };
    fetchDropdownData();
    fetchAllExercises();
  }, [axiosPrivate]);

  const fetchAllExercises = async () => {
    try {
      const response = await axiosPrivate.get(rootPaths.root + "/api/v1/exercises/", {
        withCredentials: true,
      });

      const formattedRows = response.data.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        duration: exercise.duration,
        repetitions: exercise.repetitions,
        image_url: exercise.image_url,
        rest_period: exercise.rest_period,
        categories: exercise.categories,
      }));

      setExercises(formattedRows);

      const distinctCategories = [
        ...new Map(
          response.data.flatMap((exercise) =>
            exercise.categories.map((category) => [category.id, category])
          )
        ).values(),
      ];
      setCategories(distinctCategories);
    } catch (err) {
      console.log("Error fetching exercises: ", err);
    }
  };

  const handleAddExercise = () => {
    if (selectedExercise) {
      const exerciseToAdd = exercises.find((ex) => ex.id === selectedExercise);

      const isExerciseAlreadyAdded = editingTP?.exercises?.some(
        (ex) => ex.id === selectedExercise
      );

      if (isExerciseAlreadyAdded) {
        alert("Bài tập này đã có trong danh sách.");
      } else {
        setEditingTP({
          ...editingTP,
          exercises: [...(editingTP.exercises || []), exerciseToAdd],
        });
        setSelectedExercise("");
        setOpenAddExerciseDialog(false);
        setSelectedCategories([]);
      }
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (editingTP) {
      const updatedExercises = editingTP.exercises.filter(
        (ex) => ex.id !== exerciseId
      );
      setEditingTP({
        ...editingTP,
        exercises: updatedExercises,
      });
    }
  };

  const handleDropdownChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedValue(event.target.value as string);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleEdit = (id: string) => {
    setEditMode(true);
    const tp = rows.find((row) => row.id === id);
    if (tp) {
      setEditingTP(tp);
      setEditModalOpen(true);
      setSessionInfo(tp.customer.used_sessions + " / " + tp.customer.total_sessions);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingTP({
      id: "",
      exercises: [],
      note: "",
      overview: "",
      estimated_duration: "",
      customer: "",
    });
    setSessionInfo(null);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTP(null);
    setSessionInfo(null);
  };

  const handleSave = async () => {
    if (!editingTP) return;

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleSaveEdit = async () => {
    if (editingTP) {
      if (!editingTP.customer) {
        alert("Vui lòng chọn khách hàng!");
        return;
      }
      if (!editingTP.overview) {
        alert("Vui lòng nhập tổng quan buổi tập!");
        return;
      }
      if (!editingTP.estimated_duration) {
        alert("Vui lòng nhập thời lượng ước tính của buổi tập!");
        return;
      }
      if (editingTP.exercises.length === 0) {
        alert("Vui lòng thêm bài tập!");
        return;
      }
    }
    else return;

    try {
      const response = await axiosPrivate.put(
        rootPaths.root + `/api/v1/training-plans/${editingTP.id}/`,
        {
          customer: editingTP.customer.id,
          overview: editingTP.overview,
          note: editingTP.note,
          estimated_duration: editingTP.estimated_duration,
          exercises: editingTP.exercises.map((ex) => ex.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setReloadTrigger((prev) => prev + 1);
      setEditModalOpen(false);
      setEditingTP(null);
      setSessionInfo(null);
      alert("Lưu thành công!");
    } catch (error) {
      console.error("Error saving training plan:", error);
      alert("Có lỗi xảy ra khi lưu thông tin!");
    }
  };

  const handleSaveAdd = async () => {
    if (editingTP) {
      if (!editingTP.customer) {
        alert("Vui lòng chọn khách hàng!");
        return;
      }
      if(editingTP?.customer?.used_sessions && editingTP?.customer?.total_sessions) {
        if (editingTP?.customer?.used_sessions === editingTP?.customer?.total_sessions) {
          alert("Khách hàng này đã hết số buổi tập luyện!");
          return;
        }
      }
      
      if (!editingTP.overview) {
        alert("Vui lòng nhập tổng quan buổi tập!");
        return;
      }
      if (!editingTP.estimated_duration) {
        alert("Vui lòng nhập thời lượng ước tính của buổi tập!");
        return;
      }
      if (editingTP.exercises.length === 0) {
        alert("Vui lòng thêm bài tập!");
        return;
      }
    }
    else return;
    
    try {
      const response = await axiosPrivate.post(
        rootPaths.root + `/api/v1/training-plans/`,
        {
          customer: editingTP.customer.id,
          overview: editingTP.overview,
          note: editingTP.note,
          estimated_duration: editingTP.estimated_duration,
          exercises: editingTP.exercises.map((ex) => ex.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Đã thêm giáo án:", editingTP);
      alert('Thêm giáo án thành công!')
      setReloadTrigger((prev) => prev + 1);
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        alert('Giáo án này đã tồn tại!');
        return;
      }
    }
  };

  const handleDelete = async (id: number) => {
    const idsToDelete = rowSelectionModel.length > 0 ? rowSelectionModel : [id];
    console.log(idsToDelete);

    if (
      idsToDelete.length > 0 &&
      window.confirm("Bạn có muốn xoá (những) giáo án này không?")
    ) {
      try {
        const response = await axiosPrivate.post(
          rootPaths.root + "/api/v1/training-plans/delete-multiple/",
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

  const filteredExercises = exercises.filter((exercise) => {
    if (selectedCategories.length === 0) {
      return true;
    }

    return selectedCategories.every((selectedCategoryId) =>
      exercise.categories.some(
        (exerciseCategory) => exerciseCategory.id === selectedCategoryId
      )
    );
  });

  const columns: GridColDef<any>[] = [
    {
      field: "id",
      headerName: "ID",
      resizable: false,
      minWidth: 60,
    },
    {
      field: "overview",
      headerName: "Tổng quan",
      resizable: false,
      flex: 0.5,
      minWidth: 500,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "estimated_duration",
      headerName: "Thời lượng ước tính (phút)",
      resizable: false,
      flex: 1,
      minWidth: 200,
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
            <p>Chọn khách hàng</p>
          </MenuItem>
          {dropdownData.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.first_name} {item.last_name}
            </MenuItem>
          ))}
        </Select>
      </div>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle sx={{ mb: "10px", alignSelf: "center" }}>
          {editingTP?.id !== "" ? "CẬP NHẬT GIÁO ÁN" : "THÊM GIÁO ÁN MỚI"}
          <IconButton
            aria-label="close"
            onClick={() => setEditModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editingTP && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel sx={{ marginBottom: 2 }}>Khách hàng</InputLabel>
                <Select
                  value={editingTP?.customer?.id || ""}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(
                      (customer: Customer) => customer.id === e.target.value
                    );
                    if (selectedCustomer) {
                      setEditingTP({
                        ...editingTP,
                        customer: selectedCustomer,
                      });
                      console.log(selectedCustomer);
                      if(selectedCustomer?.used_sessions === selectedCustomer?.total_sessions) {
                        alert("Khách hàng này đã hết số buổi tập luyện!");
                        setSessionInfo(selectedCustomer.used_sessions + " / " + selectedCustomer.total_sessions);
                      } else {
                        setSessionInfo(selectedCustomer.used_sessions + " / " + selectedCustomer.total_sessions);
                      }
                    }
                  }}
                  label="Khách hàng"
                >
                  {customers.map((customer: Customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Số buổi đã tập"
                value={ sessionInfo || "Không có dữ liệu"}
                disabled
                fullWidth
                margin="normal"
              />
              <TextField
                label="Tổng quan buổi tập"
                value={editingTP?.overview || ""}
                onChange={(e) =>
                  setEditingTP({ ...editingTP, overview: e.target.value })
                }
                fullWidth
                margin="normal"
              />

              <TextField
                label="Thời gian ước lượng của buổi tập"
                value={editingTP?.estimated_duration || ""}
                onChange={(e) =>
                  setEditingTP({
                    ...editingTP,
                    estimated_duration: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">phút</InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Ghi chú"
                type="text"
                value={editingTP?.note}
                onChange={(e) =>
                  setEditingTP({ ...editingTP, note: e.target.value })
                }
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                placeholder={
                  editingTP?.note ? "" : "Thêm ghi chú cho buổi tập này..."
                }
                multiline
                rows={4}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    height: "auto",
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    marginTop: 2,
                    alignSelf: "flex-start",
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  Danh sách bài tập: {editingTP?.exercises?.length} bài
                </Typography>
                <IconButton onClick={() => setOpenAddExerciseDialog(true)}>
                  <AddIcon />
                </IconButton>
              </Box>

              {editingTP?.exercises?.length > 0 ? (
                <Stack
                  direction="column"
                  spacing={1}
                  alignSelf="flex-start"
                  width="100%"
                >
                  {editingTP.exercises.map((currentExercise) => (
                    <Box
                      key={currentExercise.id}
                      sx={{
                        border: "1px solid wheat",
                        borderRadius: 1,
                        padding: 1,
                        width: "100%",
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          marginLeft: 2,
                          color: "white",
                          width: "350px",
                        }}
                      >
                        <Tooltip title="Tên bài tập" arrow>
                          <span>{currentExercise.name}</span>
                        </Tooltip>
                      </Typography>

                      <Typography
                        sx={{
                          marginLeft: 2,
                          color: "white",
                          width: "120px",
                          fontSize: "12px",
                        }}
                      >
                        <Tooltip title="Thời lượng bài tập" arrow>
                          <span>{currentExercise.duration} giây</span>
                        </Tooltip>
                      </Typography>

                      <Typography
                        sx={{
                          marginLeft: 4,
                          color: "white",
                          width: "170px",
                          fontSize: "12px",
                        }}
                      >
                        <Tooltip
                          title="Số lần lặp lại (số hiệp tập x số lần mỗi hiệp)"
                          arrow
                        >
                          <span>{currentExercise.repetitions}</span>
                        </Tooltip>
                      </Typography>

                      <Typography
                        sx={{
                          marginLeft: 4,
                          color: "white",
                          width: "100px",
                          fontSize: "12px",
                        }}
                      >
                        <Tooltip title="Thời gian nghỉ" arrow>
                          <span>{currentExercise.rest_period} giây</span>
                        </Tooltip>
                      </Typography>

                      <Typography
                        sx={{
                          marginLeft: 4,
                          color: "white",
                          width: "500px",
                          fontSize: "12px",
                          marginRight: 2,
                        }}
                      >
                        <Tooltip title="Tác động tới" arrow>
                          <span>
                            {currentExercise.categories
                              .map((category) => category.name)
                              .join(", ")}
                          </span>
                        </Tooltip>
                      </Typography>

                      <IconButton
                        onClick={() => handleDeleteExercise(currentExercise.id)}
                      >
                        <IconifyIcon icon="mdi:minus" color="white" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1">Chưa có bài tập.</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {editingTP?.id && (
            <Button onClick={() => handleDelete(editingTP.id)} color="error">
              Xóa
            </Button>
          )}
          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAddExerciseDialog}
        onClose={() => {
          setOpenAddExerciseDialog(false);
          setSelectedCategories([]);
          setSelectedExercise("");
        }}
      >
        <DialogTitle>Thêm bài tập</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl
              sx={{
                width: "300px",
                alignSelf: "left",
                marginLeft: 3,
                marginRight: 3,
              }}
              margin="dense"
            >
              <InputLabel sx={{ marginBottom: 2 }}>
                Mục tiêu tác động
              </InputLabel>
              <Select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              margin="dense"
              sx={{
                width: "300px",
                alignSelf: "left",
                marginLeft: 3,
                marginRight: 3,
              }}
            >
              <InputLabel sx={{ marginBottom: 2 }}>Tên bài tập</InputLabel>
              <Select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                label="Tên bài tập"
                sx={{ marginBottom: 5 }}
              >
                {filteredExercises && filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {selectedCategories.length > 0
                      ? "Không có bài tập phù hợp"
                      : "Vui lòng chọn mục tiêu tác động"}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddExerciseDialog(false)}>Hủy</Button>
          <Button onClick={handleAddExercise}>Thêm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TrainingPlanTable;

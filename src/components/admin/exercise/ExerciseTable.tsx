import { useMemo, useEffect, ReactElement, useState } from "react";
import { useExercisesData } from "../../../data/exercise-data";
import IconifyIcon from "../../base/IconifyIcon";
import React from "react";
import CustomPagination from "../../common/CustomPagination";
import CustomNoResultsOverlay from "../../common/CustomNoResultsOverlay";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { rootPaths } from '../../../routes/paths';
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
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  GridApi,
  DataGrid,
  GridSlots,
  GridColDef,
  useGridApiRef,
  GridActionsCellItem,
} from "@mui/x-data-grid";

interface Category {
  id: string;
  name: string;
}
interface Exercise {
  id: string;
  name: string;
  duration: string;
  repetitions: string;
  image_url: string;
  image_preview: string;
  rest_period: string;
  embedded_video_url: string;
  categories: Category[];
}

const ExerciseTable = ({
  searchText,
}: {
  searchText: string;
}): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useExercisesData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingExercise);
  const [emailError, setEmailError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState<Category | null>(null);
  const [exerciseNames, setExerciseNames] = useState([]);
  const [filteredNames, setFilteredNames] = useState(exerciseNames);
  const [originalName, setOriginalName] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setEditingExercise({ ...editingExercise, name: inputValue });

    const filtered = exerciseNames.filter((name) =>
      name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredNames(filtered);
  };

  const handleEdit = (id: string) => {
    setEditMode(true);
    const exercise = rows.find((row) => row.id === id);
    if (exercise) {
      setEditingExercise(exercise);
      const categoryIds = exercise.categories.map((category) => category.id);

      setSelectedCategories(categoryIds);
      setExerciseNames((prevNames) =>
        prevNames.filter((name) => name !== exercise.name)
      );
      const ExerciseNames = rows.map((exercise) => exercise.name);
      setExerciseNames(ExerciseNames);
      setOriginalName(exercise.name);
      setIsAvailable(true);
      setEditModalOpen(true);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await axiosPrivate.get(rootPaths.root + "/api/v1/categories/", {
        withCredentials: true,
      });

      const formattedRows = response.data.map((category) => ({
        id: category.id,
        name: category.name,
      }));

      setCategories(formattedRows);
    } catch (err) {
      console.log("Error fetching exercises: ", err);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleAdd = () => {
    setEditMode(false);
    setEditingExercise({
      id: "",
      name: "",
      duration: "",
      categories: [],
      repetitions: "",
      image_url: "",
      image_preview: "",
      rest_period: "",
      embedded_video_url: "",
    });
    const ExerciseNames = rows.map((exercise) => exercise.name);
    setExerciseNames(ExerciseNames);
    setEditModalOpen(true);
    setIsAvailable(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingExercise(null);
    setSelectedCategories([]);
    setEmailError("");
    setFilteredNames([]);
    setIsAvailable(false);
    setOriginalName(null);
    setExerciseNames([]);
  };

  const handleSave = async () => {
    setEmailError("");

    if (!editingExercise) return;

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleSaveEdit = async () => {
    if (editingExercise) {
      if (!editingExercise.duration) {
        alert("Vui lòng nhập thời lượng bài tập!");
        return;
      }
      if (!editingExercise.name) {
        alert("Vui lòng nhập tên bài tập!");
        return;
      }
      if (!editingExercise.repetitions) {
        alert("Vui lòng nhập số lần lặp lại của bài tập!");
        return;
      }
      if (!editingExercise.repetitions) {
        alert("Vui lòng nhập thời gian nghỉ của bài tập!");
        return;
      }
      if (editingExercise.categories.length < 0) {
        alert("Vui lòng chọn mục tiêu tác động của bài tập!");
        return;
      }

      const duration = Number(editingExercise.duration);
      const rest_period = Number(editingExercise.rest_period);

      if (isNaN(duration) || duration <= 0) {
        alert("Vui lòng nhập thời lượng bài tập với giá trị số dương hợp lệ!");
        return;
      }
      if (isNaN(rest_period) || rest_period <= 0) {
        alert("Vui lòng nhập thời gian nghỉ với giá trị số dương hợp lệ!");
        return;
      }
    } else return;

    const formData = new FormData();

    formData.append("name", editingExercise.name);
    formData.append("duration", editingExercise.duration);
    formData.append("repetitions", editingExercise.repetitions);
    formData.append("rest_period", editingExercise.rest_period);
    
    if (editingExercise.embedded_video_url) {
      const updatedEmbeddedVideoUrl = editingExercise.embedded_video_url
        .replace(/width="\d+"/, 'width="100%"')
        .replace(/height="\d+"/, 'height="100%"');
      formData.append("embedded_video_url", updatedEmbeddedVideoUrl);
    } else {
      formData.append("embedded_video_url", editingExercise.embedded_video_url);
    }

    if (editingExercise.image_url) {
      formData.append("image_url", editingExercise.image_url);
    }

    formData.append("categories", selectedCategories);
    try {
      const response = await axiosPrivate.put(
        rootPaths.root + `/api/v1/exercises/${editingExercise.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setReloadTrigger((prev) => prev + 1);
      alert("Cập nhật bài tập thành công!");
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        setEmailError("Bài tập với tên này đã tồn tại!");
        return;
      }
    }
  };

  const handleSaveAdd = async () => {
    if (editingExercise) {
      if (!editingExercise.name) {
        alert("Vui lòng nhập tên bài tập!");
        return;
      }
      if (filteredNames.length > 0) {
        alert(
          "Tên bài tập đã tồn tại, hãy kiểm tra lại để tránh thêm các bài tập giống nhau!"
        );
        return;
      }
      if (!editingExercise.duration) {
        alert("Vui lòng nhập thời lượng bài tập!");
        return;
      }
      if (!editingExercise.repetitions) {
        alert("Vui lòng nhập số lần lặp lại của bài tập!");
        return;
      }
      if (!editingExercise.repetitions) {
        alert("Vui lòng nhập thời gian nghỉ của bài tập!");
        return;
      }
      if (editingExercise.categories.length < 0) {
        alert("Vui lòng chọn mục tiêu tác động của bài tập!");
        return;
      }

      const duration = Number(editingExercise.duration);
      const rest_period = Number(editingExercise.rest_period);

      if (isNaN(duration) || duration <= 0) {
        alert("Vui lòng nhập thời lượng bài tập với giá trị số dương hợp lệ!");
        return;
      }
      if (isNaN(rest_period) || rest_period <= 0) {
        alert("Vui lòng nhập thời gian nghỉ với giá trị số dương hợp lệ!");
        return;
      }
    } else return;

    const formData = new FormData();
    formData.append("name", editingExercise.name);
    formData.append("duration", editingExercise.duration);
    formData.append("repetitions", editingExercise.repetitions);
    formData.append("rest_period", editingExercise.rest_period);
    formData.append("embedded_video_url", editingExercise.embedded_video_url);
    formData.append("categories", selectedCategories);

    if (editingExercise.image_url) {
      formData.append("image_url", editingExercise.image_url);
    }

    try {
      const response = await axiosPrivate.post(rootPaths.root + `/api/v1/exercises/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Đã thêm bài tập:", editingExercise);
      setReloadTrigger((prev) => prev + 1);
      alert("Thêm bài tập thành công!");
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        setEmailError("Bài tập với tên này đã tồn tại!");
        return;
      }
    }
  };

  const handleDelete = async (id: string) => {
    const idsToDelete = rowSelectionModel.length > 0 ? rowSelectionModel : [id];
    console.log(idsToDelete);

    if (
      idsToDelete.length > 0 &&
      window.confirm("Bạn có muốn xoá (những) bài tập này không?")
    ) {
      try {
        const response = await axiosPrivate.post(
          rootPaths.root + "/api/v1/exercises/delete-multiple/",
          {
            ids: idsToDelete,
          }
        );
        alert("Xoá thành công!");

        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting exercises:", error);
        alert(
          error.response?.data?.error ||
            "An error occurred while deleting exercises."
        );
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingExercise((prev) => ({
        ...prev,
        image_url: file,
        image_preview: URL.createObjectURL(file),
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingExercise((prev) => ({
          ...prev,
          image_preview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
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
      headerName: "Tên bài tập",
      resizable: false,
      flex: 0.5,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "duration",
      headerName: "Thời lượng (phút)",
      resizable: false,
      flex: 0.5,
      minWidth: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "repetitions",
      headerName: "Số lần tập",
      resizable: false,
      flex: 0.5,
      minWidth: 80,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "rest_period",
      headerName: "Thời gian nghỉ mỗi hiệp (giây)",
      resizable: false,
      flex: 0.5,
      minWidth: 250,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Thao tác",
      resizable: false,
      flex: 0.5,
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
        PaperProps={{
          style: {
            minWidth: "400px",
            maxWidth: "700px",
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ mb: "10px", alignSelf: "center" }}>
          {editingExercise?.id !== "" ? "CẬP NHẬT BÀI TẬP" : "THÊM BÀI TẬP MỚI"}
          <IconButton
            aria-label="close"
            onClick={() => setEditModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editingExercise && (
            <Grid
              container
              direction="column"
              spacing={2}
              sx={{ alignItems: "center" }}
            >
              <Stack spacing={3} alignItems="center" mb={3}>
                <Avatar
                  alt="Exercise Image"
                  src={editingExercise?.image_preview}
                  sx={{ width: 120, height: 120 }}
                />
                <label htmlFor="image-upload">
                  <input
                    accept="image/*"
                    id="image-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  <Tooltip title="Thêm ảnh bài tập">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                </label>
              </Stack>
              <Grid item xs={12}>
                <TextField
                  label="Tên bài tập"
                  value={editingExercise?.name || ""}
                  onChange={(e) => handleInputChange(e)}
                  fullWidth
                  margin="normal"
                />
                {editingExercise?.name && filteredNames?.length > 0 ? (
                  isAvailable && editingExercise?.name === originalName ? (
                    <Typography
                    variant="body2"
                    color="textSecondary"
                    display="flex"
                    alignItems="center"
                    sx={{ marginLeft: 3 }}
                  >
                        Hợp lệ
                        <CheckCircleIcon
                          style={{
                            marginRight: 8,
                            color: "green",
                            marginLeft: 5,
                            height: "18px",
                          }}
                        />
                    
                  </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ marginLeft: 3}}>
                      Các bài tập đã có: {filteredNames.slice(0, 3).join(", ")}
                      {filteredNames.length > 3 && "..."}
                    </Typography>
                  )
                ) : editingExercise?.name === "" ? null : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    display="flex"
                    alignItems="center"
                    sx={{ marginLeft: 3 }}
                  >
                    {isAvailable ? (
                      <>
                        Hợp lệ
                        <CheckCircleIcon
                          style={{
                            marginRight: 8,
                            color: "green",
                            marginLeft: 5,
                            height: "18px",
                          }}
                        />
                      </>
                    ) : null}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Thời lượng bài tập"
                  value={editingExercise?.duration || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      duration: e.target.value,
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Số lần lặp lại"
                  value={editingExercise?.repetitions || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      repetitions: e.target.value,
                    })
                  }
                  fullWidth
                  margin="normal"
                />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  display="flex"
                  alignItems="center"
                  sx={{ marginLeft: 3 }}
                >
                  Có dạng *số hiệp x số lần mỗi hiệp* (vd: 4x12, 3x5m, 5x10 each leg, ...)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Thời gian nghỉ giữa mỗi hiệp"
                  value={editingExercise?.rest_period || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      rest_period: e.target.value,
                    })
                  }
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">giây</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  sx={{
                    width: "100%",
                  }}
                  margin="dense"
                >
                  <InputLabel sx={{ marginBottom: 2 }}>
                    Mục tiêu tác động
                  </InputLabel>
                  <Select
                    multiple
                    value={selectedCategories || null}
                    onChange={(e) => setSelectedCategories(e.target.value)}
                    label="Category"
                    fullWidth
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Liên kết nhúng của video hướng dẫn (tuỳ chọn)"
                  value={editingExercise?.embedded_video_url || ""}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      embedded_video_url: e.target.value,
                    })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {editingExercise?.id && (
            <Button
              onClick={() => handleDelete(editingExercise.id)}
              color="error"
            >
              Xóa
            </Button>
          )}
          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExerciseTable;

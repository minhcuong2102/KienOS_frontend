import React, { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Rating } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import SearchIcon from "@mui/icons-material/Search"; // Biểu tượng kính lúp
import NotificationService from "../../services/notification";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { rootPaths } from "../../routes/paths";

const ServiceResponse = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const axiosPrivate = useAxiosPrivate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");

  const fetchResponses = async (url) => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(url);
      setResponses(response.data.results);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(rootPaths.root + "/api/v1/coach-profiles/all/");
      setCoaches(response.data);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses(rootPaths.root + "/api/v1/service-responses/?page=1");
    fetchCoaches();
  }, [axiosPrivate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={100} />
      </Box>
    );
  }

  const filteredResponses = responses.filter(
    (response) =>
      response.customer.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      response.customer.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (response.coach &&
        (response.coach.first_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          response.coach.last_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))) ||
      response.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (response) => {
    setSelectedResponse(response);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedResponse(null);
  };

  const handleCoachChange = (event) => {
    setSelectedCoach(event.target.value);
  };

  const handleConfirm = async () => {
    const coachId = coaches.find(
      (coach) => `${coach.first_name} ${coach.last_name}` === selectedCoach
    )?.id;

    const coachUserId = coaches.find(
      (coach) => `${coach.first_name} ${coach.last_name}` === selectedCoach
    )?.coach_user_id;

    if (coachId && selectedResponse) {
      const selectedResponseId = selectedResponse.id;

      try {
        
        const customerData = {
          coachId,
          ...selectedResponse.customer,
          selectedResponseId,
        };

        await NotificationService.createNotification(
          axiosPrivate,
          coachUserId,
          `Bạn được giao nhiệm vụ đảm nhận một khách hàng mới (${selectedResponse.customer.first_name} ${selectedResponse.customer.last_name}). 
            Hãy kiểm tra lịch dạy, điều kiện hiện tại để phản hồi sớm nhất có thể!`,
          customerData
        );

        
        
        fetchResponses(rootPaths.root + `/api/v1/service-responses/?page=${currentPage + 1}`);
      } catch (error) {
        console.error("Error updating coach:", error);
        alert("Có lỗi xảy ra");
      }
    }
    handleCloseModal();
  };

  return (
    <>
      <Box sx={{ maxWidth: 1300, margin: "auto" }}>
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}
        >
          <TextField
            variant="outlined"
            size="small"
            value={searchTerm}
            placeholder="Tìm kiếm..."
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "250px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ margin: 2 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer
          component={Paper}
          sx={{ maxWidth: 1300, margin: "auto" }}
        >
          <Table sx={{ minWidth: 900 }} aria-label="review table">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                ></TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>KHÁCH HÀNG</strong>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>LỜI ĐÁNH GIÁ</strong>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>ĐÁNH GIÁ</strong>
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>TỚI</strong>
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>LÚC</strong>
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontSize: "small",
                    backgroundColor: "#2C2F38",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  <strong>PHẢN HỒI</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResponses.map((response) => (
                <TableRow
                  key={response.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">
                    <Avatar
                      src={response.customer.avatar}
                      alt="customer avatar"
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    {`${response.customer.first_name} ${response.customer.last_name}`}
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    {response.comment}
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    <Rating value={response.score} readOnly />
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    {response.coach
                      ? `HLV ${response.coach.first_name} ${response.coach.last_name}`
                      : "Dịch vụ"}
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    {response.create_date}
                  </TableCell>

                  <TableCell align="center" sx={{ fontSize: "small" }}>
                    {response.coach &&
                      !response.responded && ( // Kiểm tra có coach và chưa phản hồi
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ width: 10, height: 40 }}
                          onClick={() => handleOpenModal(response)}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <Button
            onClick={() => {
              if (prevPageUrl) {
                fetchResponses(prevPageUrl);
                setCurrentPage((prev) => prev - 1);
              }
            }}
            disabled={!prevPageUrl}
          >
            <ArrowBackIcon />
          </Button>
          <Typography sx={{ margin: "0 20px", alignSelf: "center" }}>
            Trang {currentPage + 1} /{" "}
            {nextPageUrl ? currentPage + 2 : currentPage + 1}
          </Typography>
          <Button
            onClick={() => {
              if (nextPageUrl) {
                fetchResponses(nextPageUrl);
                setCurrentPage((prev) => prev + 1);
              }
            }}
            disabled={!nextPageUrl}
          >
            <ArrowForwardIcon />
          </Button>
        </Box>
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle
            sx={{ color: "white", alignSelf: "center", marginBottom: 3 }}
          >
            THÔNG TIN
          </DialogTitle>
          <DialogContent>
            {selectedResponse && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={selectedResponse.customer.avatar}
                  alt="customer avatar"
                  sx={{ width: 100, height: 100, marginBottom: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: "white", marginBottom: 1 }}
                >{`${selectedResponse.customer.first_name} ${selectedResponse.customer.last_name}`}</Typography>
                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                  <Box component="span" sx={{ color: "white" }}>
                    Địa chỉ:{" "}
                  </Box>
                  {selectedResponse.customer.address}
                </Typography>
                <Typography variant="body1">
                  Giới tính:{" "}
                  {selectedResponse.customer.gender === "1" ? "Nam" : "Nữ"}
                </Typography>
                <FormControl variant="outlined" fullWidth sx={{ marginTop: 3 }}>
                  <InputLabel id="coach-select-label" sx={{ marginBottom: 2 }}>
                    Huấn luyện viên
                  </InputLabel>
                  <Select
                    labelId="coach-select-label"
                    defaultValue={
                      selectedResponse.coach
                        ? `${selectedResponse.coach.first_name} ${selectedResponse.coach.last_name}`
                        : ""
                    }
                    onChange={handleCoachChange}
                  >
                    {coaches.map((coach) => (
                      <MenuItem
                        key={coach.id}
                        value={`${coach.first_name} ${coach.last_name}`}
                      >
                        {`${coach.first_name} ${coach.last_name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{ justifyContent: "space-between", paddingX: "16px" }}
          >
            <Button
              onClick={handleCloseModal}
              sx={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "8px 24px",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
                margin: 2,
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              sx={{
                backgroundColor: "#4caf50",
                color: "white",
                padding: "8px 24px",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
                margin: 2,
              }}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ServiceResponse;

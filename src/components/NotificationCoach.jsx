import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
// import { rootPaths } from "../routes/paths";
import {
  Box,
  Typography,
  List,
  ListItem,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Stack,
  Avatar,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Visibility } from "@mui/icons-material";
import NotificationService from "../services/notification";
import useAuth from "../hooks/useAuth";
import { rootPaths } from "../routes/paths";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogReasonOpen, setIsDialogReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + "/api/v1/notifications/");
        setNotifications(response.data.results);
        setNextUrl(response.data.next);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosPrivate.patch(rootPaths.root + `/api/v1/notifications/${notificationId}/`, {
        is_read: true,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleAcceptCustomer = async () => {
    if (!selectedNotification) return;

    const confirmAccept = window.confirm(
      "Bạn có chắc chắn muốn chấp nhận khách hàng này?"
    );
    if (!confirmAccept) return;

    const customerContracts = selectedNotification.customer_contracts_pt;
    if (customerContracts?.length === 0) {
      console.error("Không có thông tin hợp đồng cho khách hàng.");
      return;
    }

    const contractToUpdate = customerContracts?.[0];

    try {
      const response = await axiosPrivate.patch(
        rootPaths.root + `/api/v1/contracts/${contractToUpdate.id}/`,
        {
          coach: selectedNotification.coachId,
        }
      );

      if (response.status === 200) {
        await NotificationService.createNotification(
          axiosPrivate,
          selectedNotification.customer_user_id,
          `Dựa vào phản hồi của bạn, huấn luyện viên của bạn đã được đổi thành ${auth.fullName}, vui lòng kiểm tra huấn luyện viên mới. ` +
            `Nếu có vấn đề gì xảy ra, hãy liên hệ với chúng tôi để được tư vấn và giúp đỡ.`
        );

        await NotificationService.createNotification(
          axiosPrivate,
          null,
          `Huấn luyện viên ${auth.fullName} đã chấp nhận khách hàng ` +
            `${selectedNotification.first_name} ${selectedNotification.last_name}.`,
          null,
          `admin,sale`
        );
        if(selectedNotification?.selectedResponseId){
          await axiosPrivate.patch(
            `/api/v1/service-responses/${selectedNotification.selectedResponseId}/`,
            {
              responded: true,
            }
          );
        }
      }

      handleMarkAsRead(selectedNotificationId);
      handleCloseDialog();
    } catch (error) {
      console.error("Lỗi khi cập nhật hợp đồng:", error);
    }
  };

  const handleDenyCustomer = async () => {
    if (!selectedNotification) return;

    if (!reason) {
      alert("Vui lòng điền lý do từ chối!");
      return;
    }

    const confirmAccept = window.confirm(
      "Bạn có chắc chắn từ chối khách hàng này?"
    );
    if (!confirmAccept) return;

    try {
      await NotificationService.createNotification(
        axiosPrivate,
        null,
        `Huấn luyện viên ${auth.fullName} đã từ chối khách hàng ` +
          `${selectedNotification.first_name} ${selectedNotification.last_name} vì lí do ${reason}. ` +
          `Hãy bố trí lại HLV cho khách hàng này.`,
        null,
        `admin,sale`
      );

      handleMarkAsRead(selectedNotificationId);
      handleCloseDialog();
      handleCloseDialogReason();
    } catch (error) {
      console.error("Lỗi khi cập nhật hợp đồng:", error);
    }
  };

  const handleViewDetail = (notification) => {
    if (notification.notification.extra_data === null) {
      handleMarkAsRead(notification.id);
    } else {
      setSelectedNotification(notification.notification.extra_data);
      setSelectedNotificationId(notification.id);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedNotification(null);
    setSelectedNotificationId(null);
  };

  const handleCloseDialogReason = () => {
    setIsDialogReasonOpen(false);
    setReason("");
  };

  const handleLoadMore = async () => {
    if (nextUrl) {
      try {
        const response = await axiosPrivate.get(nextUrl);

        if (tab === 1) {
          const newNotifications = response.data.results.filter(
            (notification) => !notification.is_read
          );
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications((prev) => [...prev, ...response.data.results]);
        }

        setNextUrl(response.data.next);
      } catch (error) {
        console.error("Error loading more notifications:", error);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const filteredNotifications =
    tab === 1
      ? notifications.filter((notification) => !notification.is_read)
      : notifications;

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} năm trước`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} tháng trước`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ngày trước`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} giờ trước`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} phút trước`;

    return `${seconds} giây trước`;
  };

  return (
    <Box>
      <Box
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: 1,
          maxHeight: "400px",
          overflowY: "auto",
          width: "300px",
          zIndex: 10,
          backgroundColor: "#272836",
          borderColor: "#272836",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            textAlign: "left",
            marginLeft: 3,
            marginTop: 1,
            fontWeight: "bold",
          }}
        >
          Thông báo
        </Typography>

        <Tabs value={tab} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
          <Tab label="Tất cả" sx={{ color: "#fff", textTransform: "none" }} />
          <Tab label="Chưa đọc" sx={{ color: "#fff", textTransform: "none" }} />
        </Tabs>

        <Typography
          variant="body2"
          sx={{
            color: "white",
            fontSize: "1rem",
            marginLeft: 2,
            marginBottom: 1,
          }}
        >
          Trước đó
        </Typography>

        <List sx={{ padding: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                color: "#bbb", 
                textAlign: "center",
                padding: 2,
              }}
            >
              Không có thông báo
            </Typography>
          ) : (
            filteredNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginRight: 1,
                    marginLeft: 1,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: "230px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={notification.notification.message} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          color: notification.is_read ? "#bbb" : "#fff",
                          marginLeft: 3,
                          marginTop: 2,
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notification.notification.message}
                      </Typography>
                    </Tooltip>

                    <Typography
                      variant="body2"
                      sx={{ color: "#bbb", marginLeft: 3, marginTop: 1 }}
                    >
                      {timeAgo(notification.create_date)}
                    </Typography>
                  </Box>
                  {notification.is_read ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#bbb",
                        marginLeft: 2,
                        marginTop: 2,
                      }}
                    >
                      Đã xem
                    </Typography>
                  ) : (
                    <Button
                      onClick={() => handleViewDetail(notification)}
                      sx={{
                        marginLeft: 2,
                        minWidth: "auto",
                        padding: 0,
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Visibility sx={{ color: "#fff" }} />
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))
          )}
        </List>

        {nextUrl && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              onClick={handleLoadMore}
              fullWidth
              sx={{
                color: "#fff",
                backgroundColor: "#4a4a65",
                textTransform: "none",
                fontSize: "0.8rem",
                marginTop: 2,
              }}
            >
              Xem các thông báo trước đó
            </Button>
          </Box>
        )}
      </Box>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm">
        <DialogTitle sx={{ textAlign: "center", color: "white", marginTop: 4 }}>
          THÔNG TIN KHÁCH HÀNG
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: "white", padding: 10 }}>
          {selectedNotification && (
            <Stack spacing={2}>
              <Avatar
                src={selectedNotification?.avatar ?? ""}
                alt={`${selectedNotification?.first_name ?? ""} ${
                  selectedNotification?.last_name ?? ""
                }`}
                sx={{
                  width: 80,
                  height: 80,
                  border: "2px solid white",
                  alignSelf: "center",
                }}
              />

              <Typography variant="h6" sx={{ alignSelf: "center" }}>
                {selectedNotification?.first_name ?? ""}{" "}
                {selectedNotification?.last_name ?? ""}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: "0.875rem",
                  color: "rgba(128, 128, 128, 0.8)",
                  alignSelf: "center",
                }}
              >
                {selectedNotification?.email ?? "Chưa có email"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "0.875rem",
                  color: "rgba(128, 128, 128, 0.8)",
                  alignSelf: "center",
                }}
              >
                {selectedNotification?.phone ?? "Chưa có SĐT"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "0.875rem",
                  color: "rgba(128, 128, 128, 0.8)",
                  alignSelf: "center",
                }}
              >
                {selectedNotification?.address ?? "Chưa có địa chỉ"}
              </Typography>

              <Typography
                variant="h6"
                sx={{ color: "white", alignSelf: "left" }}
              >
                Thông tin cá nhân
                <span style={{ color: "white", fontStyle: "italic" }}></span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Giới tính:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.gender != null
                    ? `${
                        selectedNotification.gender === 0
                          ? "Nữ"
                          : selectedNotification.gender === 1
                          ? "Nam"
                          : "Khác"
                      }`
                    : "Chưa điền"}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Ngày sinh:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.birthday ?? "Chưa điền"}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Chiều cao:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.height != null
                    ? `${selectedNotification.height} cm`
                    : "Chưa điền"}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Cân nặng:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.weight != null
                    ? `${selectedNotification.weight} kg`
                    : "Chưa điền"}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Tỷ lệ mỡ:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.body_fat != null
                    ? `${selectedNotification.body_fat} %`
                    : "Chưa điền"}
                </span>
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Tình trạng sức khoẻ:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.health_condition != null
                    ? `${selectedNotification.health_condition}`
                    : "Chưa điền"}
                </span>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", marginLeft: 7 }}
              >
                Mục tiêu tập luyện:{" "}
                <span style={{ color: "wheat" }}>
                  {selectedNotification?.workout_goal?.general != null
                    ? `${selectedNotification.workout_goal.general}`
                    : "Chưa điền"}
                </span>
              </Typography>

              <Typography
                variant="h6"
                sx={{ color: "white", alignSelf: "left", marginTop: 5 }}
              >
                Thông tin gói tập
              </Typography>

              {selectedNotification?.customer_contracts_pt?.length > 0 ? (
                selectedNotification.customer_contracts_pt.map((contract) => (
                  <Stack key={contract.id} spacing={1} sx={{ marginLeft: 7 }}>
                    <Typography variant="body1" sx={{ color: "white" }}>
                      Tên gói:{" "}
                      <span style={{ color: "wheat" }}>
                        {contract.ptservice.name}
                      </span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: "white" }}>
                      Thời hạn:{" "}
                      <span style={{ color: "wheat" }}>
                        {contract.start_date} - {contract.expire_date}
                      </span>
                    </Typography>

                    <Typography variant="body1" sx={{ color: "white" }}>
                      Đã sử dụng:{" "}
                      <span style={{ color: "wheat" }}>
                        {contract.used_sessions} / {contract.number_of_session}{" "}
                        buổi
                      </span>
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: "white", marginLeft: 2 }}
                >
                  Không có thông tin gói tập.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setIsDialogReasonOpen(true)}
            color="error"
            sx={{
              alignSelf: "left",
              width: "150px",
              height: "40px",
              margin: 4,
            }}
          >
            Từ chối
          </Button>
          <Button
            onClick={() => handleAcceptCustomer(selectedNotification)}
            color="success"
            sx={{
              alignSelf: "right",
              width: "150px",
              height: "40px",
              margin: 4,
            }}
          >
            Chấp nhận
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDialogReasonOpen}
        onClose={handleCloseDialogReason}
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "center", color: "white", marginTop: 4 }}>
          LÝ DO TỪ CHỐI
        </DialogTitle>
        <DialogContent sx={{ color: "white", padding: 10 }}>
          <TextField
            label="Lý do"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDialogReason}
            color="error"
            sx={{
              alignSelf: "left",
              width: "150px",
              height: "40px",
            }}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleDenyCustomer}
            color="success"
            sx={{
              alignSelf: "right",
              width: "150px",
              height: "40px",
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notification;

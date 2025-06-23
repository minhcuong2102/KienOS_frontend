import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { rootPaths } from '../../routes/paths';
import { formatInTimeZone } from "date-fns-tz";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from "@mui/material";
import IconifyIcon from "./IconifyIcon";
import { useScheduleData } from "../../data/schedule-data";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import "./Calender.css";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import NotificationService from "../../services/notification";

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const { rows, loading, error } = useScheduleData(0);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventNote, setEventNote] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [coachId, setCoachId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [sessionInfo, setSessionInfo] = useState("");
  const [completed, setCompleted] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [repeatDays, setRepeatDays] = useState(0);

  const [exercises, setExercises] = useState([]); // All exercises in system
  const [customers, setCustomers] = useState([]); // All customers of current coach
  const [currentExercises, setCurrentExercises] = useState([]); // Exercise list for each workout schedule
  const [categories, setCategories] = useState([]); // All distinct categories from all exercises
  const [selectedExercise, setSelectedExercise] = useState(""); // Selected exercise for adding to workout schedule
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [openAddExerciseDialog, setOpenAddExerciseDialog] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState([]); // Training plans of a specific customer
  const [selectedTrainingPlan, setSelectedTrainingPlan] = useState(null);
  
  const axiosPrivate = useAxiosPrivate();
  const timeZone = "Asia/Ho_Chi_Minh";

  useEffect(() => {
    if (!loading && !error) {
      const events = rows.map((row) => ({
        id: row.id,
        title: `${row.training_plan.overview}`,
        start: `${row.start_time}`,
        end: `${row.end_time}`,
        allDay: false,
        classNames: ["fc-event"],
        backgroundColor: row.customer_color,
        borderColor: row.customer_color,
        extendedProps: {
          customerId: row.customer_id,
          customerName: `${row.customer_name}`,
          trainingPlan: row.training_plan,
          customerSessionInfo: row.customer_session_info,
          completed: row.completed,
          attendance: row.attendance,
        },
      }));
      setCurrentEvents(events);
      console.log(events);
    }
  }, [rows, loading, error]);

  const getContractIdByCustomerId = (customers, customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.contract_id : null;
  };

  const fetchAllExercises = async () => {
    try {
      const response = await axiosPrivate.get(rootPaths.root + "/api/v1/exercises/");

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

  const fetchAllCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.get(
        rootPaths.root + "/api/v1/coach-profiles/get-customers/"
      );

      const formattedRows = response.data.customers.map((customer) => ({
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        address: customer.address,
        gender: customer.gender,
        birthday: customer.birthday,
        avatar: customer.avatar,
        customer_user_id: customer.customer_user_id,
        used_sessions: customer.used_sessions,
        total_sessions: customer.total_sessions,
        contract_id: customer.contract_id,
      }));

      setCoachId(response.data.coach_id);
      setCustomers(formattedRows);
    } catch (err) {
      console.log("Error fetching exercises: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainingPlansByCustomer = async (customerId) => {
    try {
      setIsLoading(true);
      const url = rootPaths.root + `/api/v1/training-plans/get-by-customers/?customer=${customerId}`;

      const response = await axiosPrivate.get(url);

      const formattedRows = response.data.training_plans.map((tp) => ({
        id: tp.id,
        note: tp.note,
        overview: tp.overview,
        estimated_duration: tp.estimated_duration,
        customer_id: tp.customer.id,
        exercises: tp.exercises,
      }));

      setTrainingPlans(formattedRows);
    } catch (err) {
      console.log("Error fetching exercises: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomers();
  }, []);

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

  const handleDateClick = (selected) => {
    const event = {
      id: null,
      title: "",
      start: selected.startStr,
      end: selected.endStr,
      allDay: false,
      backgroundColor: "", 
      borderColor: "", 
      extendedProps: {
        customerId: null,
        customerName: "",
        trainingPlan: {},
      },
    };

    setSelectedEvent(event);

    const selectedDate = new Date(selected.start);

    selectedDate.setHours(7, 0, 0, 0);
    const start = formatInTimeZone(
      selectedDate,
      timeZone,
      "yyyy-MM-dd'T'HH:mm"
    );
    setEventStart(start);

    const endDate = new Date(selected.start);
    endDate.setHours(10, 0, 0, 0);
    const end = formatInTimeZone(endDate, timeZone, "yyyy-MM-dd'T'HH:mm");
    setEventEnd(end);
    setIsEditMode(false);
    fetchAllExercises();
    setOpenEventDialog(true);
  };

  const handleEventClick = (selected) => {
    const event = selected.event;

    setSelectedEvent(event);

    setCustomerId(event.extendedProps?.customerId || "");
    fetchTrainingPlansByCustomer(event.extendedProps?.customerId);
    const startTime = event.start
      ? formatInTimeZone(event.start, timeZone, "yyyy-MM-dd'T'HH:mm")
      : "";
    const endTime = event.end
      ? formatInTimeZone(event.end, timeZone, "yyyy-MM-dd'T'HH:mm")
      : "";

    setEventStart(startTime);
    setEventEnd(endTime);

    setEventNote(event.extendedProps?.trainingPlan?.note || "");
    setEstimatedDuration(event.extendedProps?.trainingPlan?.estimated_duration || "")
    setCurrentExercises(event.extendedProps?.trainingPlan?.exercises || []);
    setSelectedTrainingPlan(event.extendedProps?.trainingPlan || null);
    setSessionInfo(event.extendedProps?.customerSessionInfo || null);
    setCompleted(event.extendedProps?.completed || false);
    setAttendance(event.extendedProps?.attendance || false);
    setIsEditMode(true);
    fetchAllExercises();
    setOpenEventDialog(true);
  };

  function getCustomerColor(events, customerId) {
    const event = events.find((e) => e.extendedProps.customerId === customerId);
    return event ? event.backgroundColor : null;
  }

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('vi-VN', options).format(new Date(date));
  };
  
  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('vi-VN', options).format(new Date(date));
  };

  const isTimeOverlappingInSameDay = (start, end) => {
    const eventDay = new Date(start);
    eventDay.setHours(0, 0, 0, 0); 
  
    const filteredEvents = currentEvents.filter(event => {
      const existingEventDate = new Date(event.start);
      existingEventDate.setHours(0, 0, 0, 0); 
      return existingEventDate.getTime() === eventDay.getTime();
    });
    
    return filteredEvents.some((event) => {
      const existingStart = new Date(event.start);
      const existingEnd = new Date(event.end);
  
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();
  
      const existingStartHour = existingStart.getHours();
      const existingStartMinute = existingStart.getMinutes();
      const existingEndHour = existingEnd.getHours();
      const existingEndMinute = existingEnd.getMinutes();
  
      const isOverlapping =
        (startHour > existingStartHour || (startHour === existingStartHour && startMinute >= existingStartMinute)) &&
        (startHour < existingEndHour || (startHour === existingEndHour && startMinute < existingEndMinute)) ||
        (endHour > existingStartHour || (endHour === existingStartHour && endMinute >= existingStartMinute)) &&
        (endHour < existingEndHour || (endHour === existingEndHour && endMinute < existingEndMinute)) ||
        (startHour < existingStartHour || (startHour === existingStartHour && startMinute <= existingStartMinute)) &&
        (endHour > existingEndHour || (endHour === existingEndHour && endMinute >= existingEndMinute));
  
      return isOverlapping;
    });
  };
  
  const isOverlapping = (start, end, currentEvent) => {
    const filteredEvents = currentEvents.filter(event => Number(event.id) !== Number(currentEvent.id));
    return filteredEvents.some((event) => {
      const existingStart = new Date(event.start);
      const existingEnd = new Date(event.end);

      const isOverlapping =
        (start >= existingStart && start < existingEnd) ||
        (end > existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd);

      return isOverlapping;
    });
  };

  const handleSaveEvent = async () => {
    if (!customerId || !eventStart || !eventEnd || !selectedTrainingPlan) {
      alert("Vui lòng điền đầy đủ thông tin buổi tập!");
      return;
    }

    const startTime = new Date(eventStart);
    const endTime = new Date(eventEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startTime < today) {
      alert("Chỉ có thể tạo buổi tập từ ngày hiện tại về sau!");
      return;
    }

    if (startTime >= endTime) {
      alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc!");
      return;
    }

    if (isOverlapping(startTime, endTime, selectedEvent)) {
      alert("Buổi tập trùng giờ với một buổi tập khác. Vui lòng chọn thời gian khác.");
      return;
    }
    setIsLoading(true);
    try {
      const eventData = {
        customer: customerId,
        coach: coachId,
        start_time: eventStart,
        end_time: eventEnd,
        completed: completed,
        attendance: attendance,
        training_plan: {
          id: selectedTrainingPlan.id,
          estimated_duration: estimatedDuration,
          note: eventNote,
          customer: customerId,
          overview: selectedTrainingPlan.overview,
          exercises: currentExercises,
        },
        repeat_days: repeatDays
      };

      console.log("updated", eventData);
      let usedSessions = parseInt(sessionInfo.split(" / ")[0], 10);

      let response;
      if (selectedEvent?.id) {
        const originalCompleted = selectedEvent.extendedProps?.completed;

        response = await axiosPrivate.patch(
          rootPaths.root + `/api/v1/workout-schedules/${selectedEvent.id}/`,
          eventData,
        );

        const contractId = getContractIdByCustomerId(customers, customerId);
        
        if (contractId && originalCompleted !== completed) {
          if (completed) {
            usedSessions = usedSessions + 1;
          } else {
            usedSessions = usedSessions - 1;
          }
      
          await axiosPrivate.patch(
            rootPaths.root + `/api/v1/contracts/${contractId}/`,
            {
              used_sessions: usedSessions,
            },
          );
        }

      } else {
        response = await axiosPrivate.post(
          rootPaths.root + "/api/v1/workout-schedules/",
          eventData,
        );
        setOpenEventDialog(false); 
      }

      if (response.data) {
        const bgColor = getCustomerColor(currentEvents, customerId);
        console.log(usedSessions);
        // console.log(total_sessions);
        const firstSchedule = response.data[0];
        console.log(response.data);
        console.log(firstSchedule);
        // const updatedEvent = {
        //   id: response.data.id,
        //   title: `${selectedTrainingPlan.overview}`,
        //   start: `${response.data.start_time}`,
        //   end: `${response.data.end_time}`,
        //   allDay: false,
        //   backgroundColor: bgColor,
        //   borderColor: bgColor,
        //   extendedProps: {
        //     customerId: customerId,
        //     customerName:
        //       customers.find((c) => c.id === customerId)?.first_name +
        //       " " +
        //       customers.find((c) => c.id === customerId)?.last_name,
        //     trainingPlan: response.data.training_plan,
        //     customerSessionInfo: usedSessions.toString() + " / " + response.data.customer.total_sessions,
        //     completed: response.data.completed,
        //   },
        // };
        const updatedEvent = {
          id: firstSchedule.id,
          title: `${selectedTrainingPlan.overview}`,
          start: `${firstSchedule.start_time}`,
          end: `${firstSchedule.end_time}`,
          allDay: false,
          backgroundColor: bgColor,
          borderColor: bgColor,
          extendedProps: {
            customerId: customerId,
            customerName:
              customers.find((c) => c.id === customerId)?.first_name +
              " " +
              customers.find((c) => c.id === customerId)?.last_name,
            trainingPlan: firstSchedule.training_plan,
            customerSessionInfo:
              usedSessions.toString() +
              " / " +
              firstSchedule.customer?.total_sessions,
            completed: firstSchedule.completed,
            attendance: firstSchedule.attendance,
          },
        };

        if (selectedEvent?.id) {
          selectedEvent.setProp("title", updatedEvent.title);
          selectedEvent.setStart(updatedEvent.start);
          selectedEvent.setEnd(updatedEvent.end);
          selectedEvent.setExtendedProp(
            "customerId",
            updatedEvent.extendedProps.customerId
          );
          selectedEvent.setExtendedProp(
            "customerName",
            updatedEvent.extendedProps.customerName
          );
          selectedEvent.setExtendedProp(
            "customerSessionInfo",
            updatedEvent.extendedProps.customerSessionInfo
          );
          selectedEvent.setExtendedProp(
            "completed",
            updatedEvent.extendedProps.completed
          );
          selectedEvent.setExtendedProp(
            "attendance",
            updatedEvent.extendedProps.attendance
          );
          selectedEvent.setExtendedProp(
            "trainingPlan",
            updatedEvent.extendedProps.trainingPlan
          );
        } else {
          setCurrentEvents((prevEvents) => [...prevEvents, updatedEvent]);
        }

        const customer = customers.find((customer) => customer.id === customerId);
        const customer_user_id = customer?.customer_user_id;

        if (customer_user_id) {

          const eventStartDate = formatDate(eventStart);
          const eventStartTime = formatTime(eventStart);
          const eventEndTime = formatTime(eventEnd);

          let notificationMessage;

          if (!selectedEvent?.id) {
            notificationMessage = `Bạn có buổi tập mới từ ${eventStartTime} đến ${eventEndTime} ngày ${eventStartDate}. ` + 
                              `Tổng quan buổi tập: ${response.data[0].training_plan.overview}. ` +
                              `Hãy kiểm tra lịch tập của bạn để xem chi tiết hơn.`;
          } else {
            notificationMessage = `Lịch tập của bạn đã được thay đổi. ` +  
                              `Thời gian mới: từ ${eventStartTime} đến ${eventEndTime} ngày ${eventStartDate}. ` +
                              `Tổng quan buổi tập: ${response.data[0].training_plan.overview}. ` +
                              `Hãy kiểm tra lịch tập của bạn để xem chi tiết hơn.`;
          }

          await NotificationService.createNotification(
            axiosPrivate,
            customer_user_id,
            notificationMessage,
          );
        }
        
        setOpenEventDialog(false);
        setCustomerId("");
        setEventStart("");
        setEventEnd("");
        setEventNote("");
        setIsEditMode(false);
        setCompleted(false);
        setAttendance(false);
        setSelectedTrainingPlan(null);
        setTrainingPlans(null);
        setEstimatedDuration(null);
        setCurrentExercises([]);
        setSelectedEvent(null);
        setSessionInfo(null);
      }
    } catch (err) {
      console.error("Error saving workout schedule:", err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDeleteEvent = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa buổi tập này không?`)) {
      setIsLoading(true);
      try {
        await axiosPrivate.delete(
          rootPaths.root + `/api/v1/workout-schedules/${selectedEvent.id}/`,
          { withCredentials: true }
        );

        const updatedEvents = currentEvents.filter(event => Number(event.id) !== Number(selectedEvent.id));
        setCurrentEvents(updatedEvents);

        console.log("Cập nhật danh sách sự kiện:", updatedEvents);

        setOpenEventDialog(false);
        setSelectedTrainingPlan(null);
        setEstimatedDuration(null)
        setCustomerId(null);
        setEventStart(null);
        setEventEnd(null);
        setEventNote(null);
        setCurrentExercises([]);
        setSelectedEvent(null);
        setCompleted(false);
        setAttendance(false);
      } catch (err) {
        console.error("Error deleting workout schedule:", err);
      } finally {
        alert("Xoá buổi tập thành công!");
        setIsLoading(false);
      }
    }
  };

  const handleAddExercise = () => {
    if (selectedExercise) {
      const exerciseToAdd = exercises.find((ex) => ex.id === selectedExercise);

      const isExerciseAlreadyAdded = currentExercises.some(
        (ex) => ex.id === selectedExercise
      );

      if (isExerciseAlreadyAdded) {
        alert("Bài tập này đã có trong danh sách.");
      } else {
        setCurrentExercises([...currentExercises, exerciseToAdd]);
        setSelectedExercise("");
        setOpenAddExerciseDialog(false);
        setSelectedCategories([]);
      }
    }
  };

  const renderEventContent = (eventInfo) => {
    const { title, extendedProps } = eventInfo.event;
    const startTime = eventInfo.event.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const endTime = eventInfo.event.end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return (
      <Tooltip
        arrow
        placement="right-start"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 0],
                },
              },
            ],
          },
        }}
        title={
          <div className="event-tooltip">
            <Typography variant="body2">
              Khách hàng: {extendedProps.customerName}
            </Typography>
            <Typography variant="body2" color="inherit">
              Giáo án: {title}
            </Typography>
            <Typography variant="body2">
              Bài tập:{" "}
              {extendedProps.trainingPlan.exercises &&
              extendedProps.trainingPlan.exercises.length > 0
                ? extendedProps.trainingPlan.exercises.map((exercise) => (
                    <div key={exercise.id}> - {exercise.name}</div>
                  ))
                : "Chưa có bài tập nào."}
            </Typography>
          </div>
        }
        PopperProps={{
          modifiers: [
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                padding: 8,
              },
            },
            {
              name: "flip",
              enabled: true,
            },
          ],
          sx: {
            zIndex: 1000,
            "& .MuiTooltip-tooltip": {
              zIndex: 1000,
            },
          },
        }}
      >
        <span
          className="fc-event"
          style={{
            backgroundColor: eventInfo.event.backgroundColor,
            borderColor: eventInfo.event.borderColor,
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            display: "block",
            margin: "0 5px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          {`${startTime} - ${endTime}`}
        </span>
      </Tooltip>
    );
  };

  const handleDeleteExercise = (id) => {
    setCurrentExercises((prevExercises) =>
      prevExercises.filter((exercise) => exercise.id !== id)
    );
  };

  const handleEventDrop = async (info) => {
    setIsLoading(true);
    const e_start = formatInTimeZone(
      info.event.start.toISOString(),
      timeZone,
      "yyyy-MM-dd'T'HH:mm"
    );
    const e_end = formatInTimeZone(
      info.event.end.toISOString(),
      timeZone,
      "yyyy-MM-dd'T'HH:mm"
    );
    
    const updatedEvent = {
      id: info.event.id,
      title: `${info.event.extendedProps.trainingPlan.overview}`,
      start: `${info.event.startStr}`,
      end: `${info.event.endStr}`,
      allDay: false,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      extendedProps: {
        customerId: info.event.extendedProps.customerId,
        customerName:
          customers.find((c) => c.id === info.event.extendedProps.customerId)?.first_name +
          " " +
          customers.find((c) => c.id === info.event.extendedProps.customerId)?.last_name,
        trainingPlan: info.event.extendedProps.trainingPlan,
        customerSessionInfo: info.event.extendedProps.customerSessionInfo,
        completed: info.event.extendedProps.completed,
        attendance: info.event.extendedProps.attendance,
      },
    };
    console.log(updatedEvent);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    const eventStartDate = new Date(updatedEvent.start);
    const eventEndDate = new Date(updatedEvent.end);
    if (eventStartDate < today) {
      info.revert();
      alert("Không thể chuyển buổi tập về trước ngày hôm nay!");
      setIsLoading(false);
      return;
    }
    
    if (isTimeOverlappingInSameDay(eventStartDate, eventEndDate)) {
      info.revert();
      alert("Buổi tập trùng giờ với một buổi tập khác trong ngày này! Vui lòng chọn ngày khác hoặc thay đổi thời gian.");
      setIsLoading(false);
      return;
    }

    let notificationMessage;
    const customer = customers.find((customer) => customer.id === info.event.extendedProps.customerId);
    const customer_user_id = customer?.customer_user_id;

    if (customer_user_id) {
      const eventStartDate = formatDate(info.event.startStr);
      const eventStartTime = formatTime(info.event.startStr);
      const eventEndTime = formatTime(info.event.endStr);


      notificationMessage = `Lịch tập của bạn đã được thay đổi. ` + 
                        `Thời gian mới: từ ${eventStartTime} đến ${eventEndTime} ngày ${eventStartDate}. ` + 
                        `Tổng quan buổi tập: ${info.event.extendedProps.trainingPlan.overview}. ` +
                        `Hãy kiểm tra lịch tập của bạn để xem chi tiết hơn.`;
      
    }
    console.log(customer_user_id, notificationMessage);
    try {
      await axiosPrivate.patch(
        `/api/v1/workout-schedules/${updatedEvent.id}/`,
        {
          start_time: updatedEvent.start,
          end_time: updatedEvent.end,
        },
      );

      setCurrentEvents((prevEvents) => prevEvents.filter((event) => Number(event.id) !== Number(info.oldEvent.id)));
      setCurrentEvents((prevEvents) => [...prevEvents, updatedEvent]);

      await NotificationService.createNotification(
        axiosPrivate,
        customer_user_id,
        notificationMessage,
      );
    } catch (err) {
      console.error('Error updating event:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetDialogState = () => {
    setSelectedEvent(null);
    setCustomerId(null);
    setSessionInfo(null);
    setEventStart(null);
    setEventEnd(null);
    setEventNote(null);
    setCurrentExercises([]);
    setSelectedTrainingPlan(null);
    setEstimatedDuration(null);
    setTrainingPlans(null);
    setCompleted(false);
    setAttendance(false);
    setIsEditMode(false);
    setOpenEventDialog(false);
  };
  
  const now = new Date();
  const timezoneOffset = 7 * 60;
  const localDate = new Date(now.getTime() + timezoneOffset * 60 * 1000);
  const startDate = localDate.toISOString().split("T")[0];

  return (
    <Box m="20px" sx={{ position: 'relative' }}>
      {(loading || isLoading) && (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={100} sx={{}} />
      </Box>
    )}

      <Box flex="1 1 100%" ml="15px">
        <FullCalendar
          locale="vi"
          height="100vh"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          validRange={{
            start: startDate,
          }}
          initialView="dayGridMonth"
          editable
          droppable={true} 
          eventDrop={handleEventDrop}
          selectable
          selectMirror
          dayMaxEvents
          select={handleDateClick}
          eventClick={handleEventClick}
          events={currentEvents}
          eventContent={renderEventContent}
          buttonText={{
            today: "Hôm nay",
            list: "Tuần",
            month: "Tháng",
          }}
        />
      </Box>

      <Dialog open={openEventDialog} onClose={resetDialogState}>
        <DialogTitle sx={{ mb: "10px", alignSelf: "center" }}>
          CHI TIẾT BUỔI TẬP
          <IconButton
            aria-label="close"
            onClick={() => setOpenEventDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ marginBottom: 2 }}>Khách hàng</InputLabel>
            <Select
              value={customerId}
              onChange={(e) => {
                const selectedCustomer = customers.find(
                  (customer) => customer.id === e.target.value
                );
                
                
                setCustomerId(selectedCustomer.id);
                fetchTrainingPlansByCustomer(selectedCustomer.id);
                setSelectedTrainingPlan(null);
                setEstimatedDuration("");
                setEventNote("");
                setCurrentExercises(null);
                if(selectedCustomer?.used_sessions === selectedCustomer?.total_sessions) {
                  alert("Khách hàng này đã hết số buổi tập luyện!");
                  setSessionInfo(selectedCustomer.used_sessions + " / " + selectedCustomer.total_sessions);
                } else {
                  setSessionInfo(selectedCustomer.used_sessions + " / " + selectedCustomer.total_sessions);
                }
              }}
              label="Khách hàng"
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            disabled={!isEditMode}
            control={
              <Checkbox
                checked={attendance}
                onChange={(e) => setAttendance(e.target.checked)}
                color="primary"
              />
            }
            label="Xác nhận tham gia"
            sx={{ marginTop: 2 }}
          />
          <FormControlLabel
            disabled={!isEditMode}
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                color="primary"
              />
            }
            label="Đã hoàn thành buổi tập"
            sx={{ marginTop: 2 }}
          />
          <TextField
            label="Số buổi đã tập"
            type="text"
            value={sessionInfo}
            disabled
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ marginBottom: 2 }}>Giáo án buổi tập</InputLabel>
            <Select
              value={selectedTrainingPlan?.id ?? ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedPlan = trainingPlans.find(
                  (tp) => tp.id === selectedId
                );
                setSelectedTrainingPlan(selectedPlan);
                setEstimatedDuration(selectedPlan.estimated_duration);
                setEventNote(selectedPlan.note);
                setCurrentExercises(selectedPlan.exercises)
              }}
              label="Giáo án buổi tập"
            >
              {isLoading ? (
                <MenuItem disabled>Đang tải...</MenuItem>
              ) : trainingPlans?.length > 0 ? (
                trainingPlans.map((tp) => (
                  <MenuItem key={tp.id} value={tp.id}>
                    {tp.overview}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  {selectedTrainingPlan?.id || "Chưa có giáo án"}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Thời lượng ước tính của giáo án"
            type="text"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            fullWidth
            disabled={!selectedTrainingPlan}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">phút</InputAdornment>
              ),
            }}
          />

          <TextField
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={eventStart}
            onChange={(e) => setEventStart(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Thời gian kết thúc"
            type="datetime-local"
            value={eventEnd}
            onChange={(e) => setEventEnd(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ghi chú"
            type="text"
            value={eventNote}
            onChange={(e) => setEventNote(e.target.value)}
            fullWidth
            disabled={!selectedTrainingPlan}
            margin="normal"
            placeholder={eventNote ? "" : "Thêm ghi chú cho buổi tập này..."}
            multiline
            rows={4}
            variant="outlined"
            sx={{
              "& .MuiInputBase-root": {
                height: "auto",
              },
            }}
          />
          <TextField
              label="Số ngày lặp lại"
              type="number"
              value={repeatDays}
              onChange={(e) => setRepeatDays(Number(e.target.value))}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
              helperText="0 nghĩa là không lặp lại, 1 là thêm thêm 1 ngày sau..."
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
              Danh sách bài tập:{" "}
              {currentExercises?.length ?? "0"} bài
            </Typography>
            
            {selectedTrainingPlan && (
              <IconButton onClick={() => setOpenAddExerciseDialog(true)}>
                <AddIcon />
              </IconButton>
            )}
          </Box>

          {currentExercises?.length > 0 ? (
            <Stack
              direction="column"
              spacing={1}
              alignSelf="flex-start"
              width="100%"
            >
              {currentExercises?.map((currentExercise) => (
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
        </DialogContent>
        <DialogActions>
          {isEditMode && (
            <Button onClick={handleDeleteEvent} color="error">
              Xóa
            </Button>
          )}
          <Button
            onClick={handleSaveEvent}
            color="primary"
            disabled={
              !selectedTrainingPlan || !customerId || !eventStart || !eventEnd
            }
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding an exercise */}
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
    </Box>
  );
};

export default Calendar;

import { useState, useEffect } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { rootPaths } from "../routes/paths";

export const useScheduleData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  
  const customerColors = {};

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 8)];
    }
    return color;
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + "/api/v1/workout-schedules/", {
          withCredentials: true,
        });

        const formattedRows = response.data.map((ws) => {
          const customerId = ws.customer.id;
          const now = new Date(); 
          let customerColor;

          if (new Date(ws.end_time) < now) {
            customerColor = "black";
            
          } 
          else {
            if (!customerColors[customerId]) {
              customerColor = getRandomColor();
              customerColors[customerId] = customerColor;
            } else {
              customerColor = customerColors[customerId];
            }
          }

          return {
            id: ws.id,
            
            customer_id: customerId,
            customer_name: `${ws.customer.first_name} ${ws.customer.last_name}`,
            customer_address: ws.customer.address,
            customer_gender: ws.customer.gender,
            customer_birthday: ws.customer.birthday,
            customer_avatar: ws.customer.avatar,
            customer_session_info: ws.customer.used_sessions + " / " + ws.customer.total_sessions,
            customer_used_sessions: ws.customer.used_sessions,
            customer_total_sessions: ws.customer.total_sessions,
            customer_color: customerColors[customerId], 
            
            coach_id: ws.coach,
            coach_name: `${ws.coach.first_name} ${ws.coach.last_name}`,
            coach_avatar: ws.coach.avatar,
            coach_address: ws.coach.address,
            coach_gender: ws.coach.gender,
            coach_birthday: ws.coach.birthday,
            coach_height: ws.coach.height,
            coach_weight: ws.coach.weight,
            coach_start_date: ws.coach.start_date,
          
            start_time: ws.start_time,
            end_time: ws.end_time,
            completed: ws.completed,
            
            training_plan: {
              id: ws.training_plan.id,
              estimated_duration: ws.training_plan.estimated_duration,
              overview: ws.training_plan.overview,
              note: ws.training_plan.note,
              exercises: ws.training_plan.exercises.map((e) => ({
                id: e.id,
                name: e.name,
                duration: e.duration,
                repetitions: e.repetitions,
                image_url: e.image_url,
                rest_period: e.rest_period,
                categories: e.categories
              })),
            }
            
          };
        });
        
        setRows(formattedRows);

      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [reloadTrigger]);

  return { rows, loading, error };
};

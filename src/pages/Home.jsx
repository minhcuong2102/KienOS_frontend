import Calender from "../components/base/Calender";
import PieChart from "../components/base/PieChart";
import { Box } from "@mui/material";

const Home = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" height="75vh">
        <Box flex={1} m={1}>
          <PieChart />
        </Box>
        <Box flex={1} m={1}>
          <PieChart />
        </Box>
        <Box flex={1} m={1}>
          <PieChart />
        </Box>
      </Box>
      <Calender />
    </Box>
  );
};

export default Home;

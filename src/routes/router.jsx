import { lazy, Suspense } from "react";
import { Outlet, createBrowserRouter, Navigate } from "react-router-dom";
import { rootPaths } from "./paths";
import paths from "./paths";

const App = lazy(() => import("../App"));

// Layouts
const AuthLayout = lazy(() => import("../layouts/auth-layout"));
const MainLayoutAdmin = lazy(() => import("../layouts/main-layout-admin"))
const MainLayoutCoach = lazy(() => import("../layouts/main-layout"));

// Auth pages
const Login = lazy(() => import("../pages/auth/Login"));
const SignUp = lazy(() => import("../pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

// Error pages
const NotFound = lazy(() => import("../pages/error/NotFound"));
const Unauthorized = lazy(() => import("../pages/error/Unauthorized")); 
const Banned = lazy(() => import("../pages/error/Banned"));
const Forbidden = lazy(() => import("../pages/error/Forbidden"));
const NoCustomer = lazy(() => import("../pages/error/NoCustomer"));

// Admin pages
const AccountManagement = lazy(() => import("../pages/admin/AccountManagement"));
const Statistic = lazy(() => import("../pages/admin/Statistic"));
const ServiceResponse = lazy(() => import("../pages/admin/ServiceResponse"));
const CoachManagement = lazy(() => import("../pages/admin/CoachManagement"));
const ExerciseManagement = lazy(() => import("../pages/admin/ExerciseManagement"));
import ServiceManagement from "../pages/admin/ServiceManagement";

// Coach pages
const UserProfile = lazy(() => import("../pages/coach/UserProfile"));
const ProductList = lazy(() => import("../pages/ProductList"));
const CoachDashboard = lazy(() => import("../pages/coach/CoachDashboard"));
const CoachSchedule = lazy(() => import("../pages/coach/CoachSchedule"));
const CoachHomePage = lazy(() => import("../pages/coach/CoachHomePage"));
const CoachChat = lazy(() => import("../pages/coach/CoachChat"));
const TrainingPlanManagement = lazy(() => import("../pages/coach/TrainingPlanManagement"))
const WorkoutHistoryManagement = lazy(() => import("../pages/coach/WorkoutHistoryManagement"))

//Sale pages
import SaleContracts from "../components/sale/SaleContracts";
const MainLayoutSale = lazy(() => import("../layouts/main-layout-sale"));
const SaleHomePage = lazy(() => import("../components/sale/SaleHomePage"));

// Other components
import PrivateRoute from "../components/PrivateRoute";
import HomeRedirect from "../components/HomeRedirect";
import IsLoggedIn from "../components/IsLoggedIn";
import PageLoader from "../components/loading/PageLoader";
import Splash from "../components/loading/Splash";
const PersistLogin = lazy(() => import("../components/PersistLogin"));



const createMainLayoutAdminRoutes = () => (
  <MainLayoutAdmin>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </MainLayoutAdmin>
);

const createMainLayoutCoachRoutes = () => (
  <MainLayoutCoach>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </MainLayoutCoach>
);

const createMainLayoutSaleRoutes = () => (
  <MainLayoutSale>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </MainLayoutSale>
);

const createAuthLayoutRoutes = () => (
  <AuthLayout>
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </AuthLayout>
);
const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <PersistLogin>
            <HomeRedirect />
          </PersistLogin>
          
        ),
      },
      {
        path: rootPaths.adminRoot,
        element: (
          <PersistLogin>
            {createMainLayoutAdminRoutes()}
          </PersistLogin>
        ),
        children: [

          {
            path: paths.accounts,
            element: (
              <PrivateRoute allowedRoles={['admin']}>
                <AccountManagement />
              </PrivateRoute>      
            ),

          },
          {
            path: paths.services,
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ServiceManagement />
              </PrivateRoute>
            ),
          },
          {
            path: paths.statistics,
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <Statistic />
              </PrivateRoute>
            ),
          },
          {
            path: paths.service_response,
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ServiceResponse />
              </PrivateRoute>
            ),
          },
          {
            path: paths.coachs,
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <CoachManagement />
              </PrivateRoute>
            ),
          },
          {
            path: paths.exercises,
            element: (
              <PrivateRoute allowedRoles={["admin"]}>
                <ExerciseManagement />
              </PrivateRoute>
            ),
          },
          
       
        ]
      },
      {
        paths: rootPaths.coachRoot,
        element: <PersistLogin>{createMainLayoutCoachRoutes()}</PersistLogin>,
        children:[
          {
            path: paths.profile,
            element: (
              <PrivateRoute allowedRoles={["coach"]}>
              <UserProfile />
            </PrivateRoute>
          )
        },
        {
          path: paths.product,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <ProductList />
            </PrivateRoute>
          )
        },
        {
          path: paths.customer,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <CoachDashboard />
            </PrivateRoute>
          )
        },
        {
          path: paths.schedule,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <CoachSchedule />
            </PrivateRoute>
          )
        },
        {
          path: paths.training_plans,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <TrainingPlanManagement />
            </PrivateRoute>
          )
        },
        {
          path: paths.chat,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <CoachChat />
            </PrivateRoute>
          )
        },
        {
          path: paths.workout_history,
          element: (
            <PrivateRoute allowedRoles={["coach"]}>
              <WorkoutHistoryManagement />
            </PrivateRoute>
          )
        },
        // {
        //   path: '*',
        //   element: 
        //   <PrivateRoute allowedRoles={["coach"]}>
        //      <CoachHomePage />
        //     </PrivateRoute>,
        // },
           
      ]
      },
      {
      path: rootPaths.saleRoot,
      element: <PersistLogin>{createMainLayoutSaleRoutes()}</PersistLogin>,
      children: [
        {
          path: paths.sale_home,
          element: (
            <PrivateRoute allowedRoles={["sale"]}>
              <SaleHomePage />
            </PrivateRoute>
          ), 
        },
        {
          path: paths.sale_contracts,
          element: (
            <PrivateRoute allowedRoles={["sale"]}>
              <SaleContracts />
            </PrivateRoute>
          ), 
        },
        {
          path: paths.service_response_for_sale,
          element: (
            <PrivateRoute allowedRoles={["sale"]}>
              <ServiceResponse />
            </PrivateRoute>
          ),
        },
        {
          path: paths.statistics_for_sale,
          element: (
            <PrivateRoute allowedRoles={["sale"]}>
              <Statistic />
            </PrivateRoute>
          ),
        },
        // {
        //   path: '*',
        //   element: (
        //     <PrivateRoute allowedRoles={["sale"]}>
        //       <SaleHomePage />,
        //     </PrivateRoute>
        //   ),
          
        // },
      ],
      },
      
      {
        path: rootPaths.authRoot,
        element: createAuthLayoutRoutes(),
        children: [
          {
            path: paths.login,
            element: (
              <IsLoggedIn>
                <Login />
              </IsLoggedIn>
            )
          },
          {
            path: paths.signup,
            element: (
              <IsLoggedIn>
                <SignUp />
              </IsLoggedIn>
            )
          },
          {
            path: paths.forgot_password,
            element: (
              <IsLoggedIn>
                <ForgotPassword />
              </IsLoggedIn>
            )
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  
  {
    path: paths.unauthorized,
    element: <Unauthorized />,
  },
  {
    path: paths.forbidden,
    element: <Forbidden />,
  },
  {
    path: paths.banned,
    element: <Banned />,
  },
  {
    path: paths.not_for_customer,
    element: <NoCustomer />,
  },
];

const options = {
  basename: "",
};

const router = createBrowserRouter(routes, options);

export default router;

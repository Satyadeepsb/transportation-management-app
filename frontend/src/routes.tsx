import type { RouteType } from './types';
import { UserRole } from './types';

// Icons
import {
  MdHome,
  MdLocalShipping,
  MdPeople,
  MdPerson,
  MdSettings,
  MdAssessment,
  MdDriveEta,
} from 'react-icons/md';

// Pages
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import MyShipments from './pages/MyShipments';
import CreateShipment from './pages/CreateShipment';
import EditShipment from './pages/EditShipment';
import ShipmentDetail from './pages/ShipmentDetail';
import TrackShipment from './pages/TrackShipment';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import Drivers from './pages/Drivers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const routes: RouteType[] = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: 'default',
    icon: <MdHome className="h-6 w-6" />,
    component: <Dashboard />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER, UserRole.CUSTOMER],
    showInMenu: true,
  },
  {
    name: 'Shipments',
    layout: '/admin',
    path: 'shipments',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <Shipments />,
    secondary: true,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    showInMenu: true,
  },
  {
    name: 'My Shipments',
    layout: '/admin',
    path: 'my-shipments',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <MyShipments />,
    allowedRoles: [UserRole.DRIVER, UserRole.CUSTOMER],
    showInMenu: true,
  },
  {
    name: 'Create Shipment',
    layout: '/admin',
    path: 'shipments/create',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <CreateShipment />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.CUSTOMER],
    showInMenu: false, // Hidden from menu, accessible via button
  },
  {
    name: 'Edit Shipment',
    layout: '/admin',
    path: 'shipments/:id/edit',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <EditShipment />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    showInMenu: false,
  },
  {
    name: 'Shipment Detail',
    layout: '/admin',
    path: 'shipments/:id',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <ShipmentDetail />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER, UserRole.CUSTOMER],
    showInMenu: false,
  },
  {
    name: 'Track Shipment',
    layout: '/admin',
    path: 'track',
    icon: <MdLocalShipping className="h-6 w-6" />,
    component: <TrackShipment />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER, UserRole.CUSTOMER],
    showInMenu: true,
  },
  {
    name: 'Users',
    layout: '/admin',
    path: 'users',
    icon: <MdPeople className="h-6 w-6" />,
    component: <Users />,
    allowedRoles: [UserRole.ADMIN],
    showInMenu: true,
  },
  {
    name: 'Create User',
    layout: '/admin',
    path: 'users/create',
    icon: <MdPeople className="h-6 w-6" />,
    component: <CreateUser />,
    allowedRoles: [UserRole.ADMIN],
    showInMenu: false,
  },
  {
    name: 'Edit User',
    layout: '/admin',
    path: 'users/:id/edit',
    icon: <MdPeople className="h-6 w-6" />,
    component: <EditUser />,
    allowedRoles: [UserRole.ADMIN],
    showInMenu: false,
  },
  {
    name: 'Drivers',
    layout: '/admin',
    path: 'drivers',
    icon: <MdDriveEta className="h-6 w-6" />,
    component: <Drivers />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    showInMenu: true,
  },
  {
    name: 'Reports',
    layout: '/admin',
    path: 'reports',
    icon: <MdAssessment className="h-6 w-6" />,
    component: <Reports />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    showInMenu: true,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: 'profile',
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.DRIVER, UserRole.CUSTOMER],
    showInMenu: true,
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: 'settings',
    icon: <MdSettings className="h-6 w-6" />,
    component: <Settings />,
    allowedRoles: [UserRole.ADMIN],
    showInMenu: true,
  },
];

export default routes;

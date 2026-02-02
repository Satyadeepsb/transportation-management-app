import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const pathToTitle: { [key: string]: string } = {
      '/admin/default': 'Dashboard',
      '/admin/dashboard': 'Dashboard',
      '/admin/shipments': 'Shipments',
      '/admin/shipments/create': 'Create Shipment',
      '/admin/my-shipments': 'My Shipments',
      '/admin/track': 'Track Shipment',
      '/admin/drivers': 'Drivers',
      '/admin/users': 'Users',
      '/admin/users/create': 'Create User',
      '/admin/reports': 'Reports',
      '/admin/settings': 'Settings',
      '/admin/profile': 'Profile',
      '/auth/sign-in': 'Sign In',
      '/auth/sign-up': 'Sign Up',
    };

    // Check for exact match
    let title = pathToTitle[location.pathname];

    // If no exact match, check for partial matches (for dynamic routes)
    if (!title) {
      if (location.pathname.includes('/shipments/') && location.pathname.includes('/edit')) {
        title = 'Edit Shipment';
      } else if (location.pathname.includes('/shipments/')) {
        title = 'Shipment Details';
      } else if (location.pathname.includes('/users/') && location.pathname.includes('/edit')) {
        title = 'Edit User';
      } else if (location.pathname.includes('/users/')) {
        title = 'User Details';
      }
    }

    // Set the document title
    document.title = title ? `${title} - TMS` : 'TMS - Transport Management System';
  }, [location]);

  return null;
};

export default PageTitle;

import type { RouteType } from '../types';
import type { UserRole } from '../types';

/**
 * Check if a user has access to a specific route based on their role
 */
export const hasRouteAccess = (route: RouteType, userRole: UserRole): boolean => {
  // If no role restrictions, allow access to all
  if (!route.allowedRoles || route.allowedRoles.length === 0) {
    return true;
  }

  // Check if user's role is in allowed roles
  return route.allowedRoles.includes(userRole);
};

/**
 * Filter routes based on user role
 */
export const filterRoutesByRole = (routes: RouteType[], userRole?: UserRole): RouteType[] => {
  if (!userRole) return [];

  return routes.filter(route => hasRouteAccess(route, userRole));
};

/**
 * Get visible menu routes for a user
 */
export const getMenuRoutes = (routes: RouteType[], userRole?: UserRole): RouteType[] => {
  if (!userRole) return [];

  return routes.filter(route => {
    // Hide routes that shouldn't be in menu
    if (route.showInMenu === false) return false;

    // Check role access
    return hasRouteAccess(route, userRole);
  });
};

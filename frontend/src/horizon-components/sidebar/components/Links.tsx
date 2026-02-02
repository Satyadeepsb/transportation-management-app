/* eslint-disable */
import { Link, useLocation } from "react-router-dom";
import DashIcon from "../../icons/DashIcon";
import type { RouteType } from "../../../types";
// chakra imports

export const SidebarLinks = (props: { routes: RouteType[]; collapsed?: boolean }): JSX.Element => {
  // Chakra color mode
  let location = useLocation();

  const { routes, collapsed = false } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes: RouteType[]) => {
    return routes.map((route, index) => {
      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        if (collapsed) {
          // Collapsed view - icon only with tooltip
          return (
            <Link key={index} to={route.layout + "/" + route.path}>
              <div className="relative mb-3 flex hover:cursor-pointer group">
                <li
                  className="my-[3px] flex cursor-pointer items-center justify-center w-full"
                  key={index}
                  title={route.name}
                >
                  <span
                    className={`text-xl ${
                      activeRoute(route.path) === true
                        ? "font-bold text-brand-500 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}
                  </span>
                </li>
                {activeRoute(route.path) ? (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                ) : null}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-0 hidden group-hover:block bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap z-50 dark:bg-white dark:text-gray-900">
                  {route.name}
                </div>
              </div>
            </Link>
          );
        } else {
          // Expanded view - icon and text
          return (
            <Link key={index} to={route.layout + "/" + route.path}>
              <div className="relative mb-3 flex hover:cursor-pointer">
                <li
                  className="my-[3px] flex cursor-pointer items-center px-8"
                  key={index}
                >
                  <span
                    className={`${
                      activeRoute(route.path) === true
                        ? "font-bold text-brand-500 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}{" "}
                  </span>
                  <p
                    className={`leading-1 ml-4 flex ${
                      activeRoute(route.path) === true
                        ? "font-bold text-navy-700 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.name}
                  </p>
                </li>
                {activeRoute(route.path) ? (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                ) : null}
              </div>
            </Link>
          );
        }
      }
    });
  };
  // BRAND
  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;

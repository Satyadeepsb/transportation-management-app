/* eslint-disable */

import { HiX } from "react-icons/hi";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import Links from "./components/Links";
import Logo from "../../components/Logo";
// import SidebarCard from "./componentsrtl/SidebarCard";
import routes from "../../routes";
import { useAuth } from "../../contexts/AuthContext";
import { getMenuRoutes } from "../../utils/routeUtils";

const Sidebar = (props: {
  open: boolean;
  collapsed: boolean;
  onClose: React.MouseEventHandler<HTMLSpanElement>;
  onToggleCollapse: () => void;
}) => {
  const { open, collapsed, onClose, onToggleCollapse } = props;
  const { user } = useAuth();

  // Filter routes based on user role and showInMenu flag
  const filteredRoutes = getMenuRoutes(routes, user?.role);

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        collapsed ? "w-[80px]" : "w-[290px]"
      } ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      {/* Collapse/Expand Button - Desktop Only */}
      <button
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg dark:bg-navy-700 xl:flex hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors z-50"
        onClick={onToggleCollapse}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <FiChevronsRight className="h-4 w-4 text-gray-600 dark:text-white" />
        ) : (
          <FiChevronsLeft className="h-4 w-4 text-gray-600 dark:text-white" />
        )}
      </button>

      <div className={`mt-[50px] flex items-center justify-center ${collapsed ? "mx-4" : "mx-8"}`}>
        <Logo collapsed={collapsed} variant="truck" />
      </div>
      <div className="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      {/* Nav item */}

      <ul className="mb-auto pt-1">
        <Links routes={filteredRoutes} collapsed={collapsed} />
      </ul>

      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;

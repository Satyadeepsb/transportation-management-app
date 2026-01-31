import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export default function Header() {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.DISPATCHER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.DRIVER:
        return 'bg-green-100 text-green-800';
      case UserRole.CUSTOMER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Transportation Management
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{user?.fullName}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role!)}`}>
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

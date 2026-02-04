import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_USERS_QUERY, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from '../graphql/users';
import ConfirmDialog from '../components/ConfirmDialog';
import { UserRole } from '../types';
import type { User } from '../types';

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Only ADMIN can access this page
  if (currentUser?.role !== UserRole.ADMIN) {
    navigate('/admin/default');
    return null;
  }

  const { data, loading, error, refetch } = useQuery<{ users: { data: User[]; meta: any } }>(GET_USERS_QUERY);

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION);
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER_MUTATION);

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await updateUser({
        variables: {
          input: {
            id: userId,
            isActive: !isActive,
          },
        },
      });
      refetch();
    } catch (err: any) {
      console.error('Toggle active error:', err);
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser({ variables: { id: deleteUserId } });
      setDeleteUserId(null);
      refetch();
    } catch (err: any) {
      console.error('Delete user error:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-mesh">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-blue-600 border-b-blue-200 border-l-blue-200"></div>
          <div className="absolute inset-0 rounded-full animate-pulse-glow"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 glass border-red-300 rounded-xl animate-scaleIn">
        <p className="text-sm text-red-800 font-medium">Error: {error.message}</p>
      </div>
    );
  }

  // Apply filters client-side
  const allUsers = data?.users.data || [];
  const roleFilteredUsers = roleFilter
    ? allUsers.filter((u) => u.role === roleFilter)
    : allUsers;
  const users =
    statusFilter === 'all'
      ? roleFilteredUsers
      : roleFilteredUsers.filter((u) => u.isActive === (statusFilter === 'active'));

  const userToDelete = users.find((u) => u.id === deleteUserId);

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900">
              User Management
            </h2>
            <p className="mt-2 text-slate-600 text-lg">
              Manage system users and their roles
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/users/create')}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl
                     hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105
                     shadow-lg shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/50
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
            <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 glass p-4 rounded-xl shadow-md animate-fadeInUp delay-100 relative z-10 border-slate-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="px-4 py-2 glass border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium transition-all duration-200"
            >
              <option value="">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.DISPATCHER}>Dispatcher</option>
              <option value={UserRole.DRIVER}>Driver</option>
              <option value={UserRole.CUSTOMER}>Customer</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 glass border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium transition-all duration-200"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-slate-600">
              Total: <span className="font-bold text-slate-900">{users.length}</span> users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center shadow-xl border-slate-200 animate-scaleIn relative z-10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-slate-500 font-medium text-lg">No users found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden shadow-xl border-slate-200 animate-fadeInUp delay-200 relative z-10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="glass-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/50 transition-all duration-200 group animate-fadeInUp"
                    style={{ animationDelay: `${300 + index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 font-medium">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-medium">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                        user.role === UserRole.ADMIN
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                          : user.role === UserRole.DISPATCHER
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : user.role === UserRole.DRIVER
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                        user.isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:scale-110 transform"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          disabled={updateLoading || user.id === currentUser.id}
                          className="text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 hover:scale-110 transform"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          disabled={user.id === currentUser.id}
                          className="text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200 hover:scale-110 transform"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteUserId(null)}
        loading={deleteLoading}
        danger
      />
    </div>
  );
}

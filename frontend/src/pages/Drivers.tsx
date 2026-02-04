import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { GET_USERS_QUERY } from '../graphql/users';
import { UserRole } from '../types';
import type { User } from '../types';

export default function Drivers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Only ADMIN and DISPATCHER can access this page
  if (currentUser && !([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(currentUser.role)) {
    navigate('/admin/default');
    return null;
  }

  const { data, loading, error } = useQuery<{ users: { data: User[]; meta: any } }>(GET_USERS_QUERY);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-mesh">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-emerald-600 border-r-emerald-600 border-b-emerald-200 border-l-emerald-200"></div>
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

  // Filter drivers and apply status filter
  const allDrivers = (data?.users.data || []).filter((u) => u.role === UserRole.DRIVER);
  const statusFilteredDrivers =
    statusFilter === 'all'
      ? allDrivers
      : allDrivers.filter((d) => d.isActive === (statusFilter === 'active'));

  // Client-side search filter
  const filteredDrivers = searchTerm
    ? statusFilteredDrivers.filter(
        (driver) =>
          driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : statusFilteredDrivers;

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-40 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900">
              Drivers
            </h2>
            <p className="mt-2 text-slate-600 text-lg">
              View and manage driver information
            </p>
          </div>
          {currentUser?.role === UserRole.ADMIN && (
            <button
              onClick={() => navigate('/admin/users/create')}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl
                       hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105
                       shadow-lg shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/50
                       flex items-center gap-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Driver
              <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 glass p-4 rounded-xl shadow-md animate-fadeInUp delay-100 relative z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] group relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-medium transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-medium transition-all duration-200"
            >
              <option value="all">All Drivers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-slate-600">
              Total: <span className="font-bold text-slate-900">{filteredDrivers.length}</span> drivers
            </span>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      {filteredDrivers.length === 0 ? (
        <div className="glass border-slate-200 rounded-2xl p-12 text-center shadow-xl animate-scaleIn relative z-10">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-slate-500 font-medium text-lg">
            {searchTerm ? 'No drivers found matching your search' : 'No drivers found'}
          </p>
        </div>
      ) : (
        <div className="glass border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-fadeInUp delay-200 relative z-10">
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((driver, index) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-white/50 transition-all duration-200 group animate-fadeInUp"
                    style={{ animationDelay: `${300 + index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {driver.firstName[0]}{driver.lastName[0]}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{driver.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 font-medium">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-medium">{driver.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                        driver.isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/users/${driver.id}/edit`)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:scale-110 transform"
                        >
                          View Details
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

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-300 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Active Drivers</p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800 mt-1">
                {allDrivers.filter((d) => d.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-400 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Inactive Drivers</p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 mt-1">
                {allDrivers.filter((d) => !d.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass border-slate-200 rounded-2xl p-6 card-3d shadow-xl animate-fadeInUp delay-500 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Drivers</p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-800 mt-1">
                {allDrivers.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

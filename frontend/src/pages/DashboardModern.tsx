import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GET_SHIPMENTS_QUERY, GET_DRIVERS_QUERY } from '../graphql/shipments';
import StatusBadge from '../components/StatusBadge';
import { ShipmentStatus, UserRole } from '../types';
import type { PaginatedShipments, User } from '../types';
import { useMemo } from 'react';

export default function DashboardModern() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewAnalytics = user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role);

  const { data, loading, error } = useQuery<{ shipments: PaginatedShipments }>(
    GET_SHIPMENTS_QUERY,
    {
      variables: {
        pagination: { page: 1, limit: 10 },
      },
    }
  );

  const { data: allShipmentsData } = useQuery<{ shipments: PaginatedShipments }>(
    GET_SHIPMENTS_QUERY,
    {
      variables: {
        pagination: { page: 1, limit: 1000 },
      },
      skip: !canViewAnalytics,
    }
  );

  const { data: driversData } = useQuery<{ getDrivers: User[] }>(
    GET_DRIVERS_QUERY,
    {
      skip: !canViewAnalytics,
    }
  );

  const shipments = data?.shipments.data || [];
  const recentShipments = shipments.slice(0, 5);

  const stats = useMemo(() => {
    const allShipments = allShipmentsData?.shipments.data || [];
    const allDrivers = driversData?.getDrivers || [];

    return {
      total: allShipments.length,
      pending: allShipments.filter(s => s.status === ShipmentStatus.PENDING).length,
      assigned: allShipments.filter(s => s.status === ShipmentStatus.ASSIGNED).length,
      pickedUp: allShipments.filter(s => s.status === ShipmentStatus.PICKED_UP).length,
      inTransit: allShipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length,
      delivered: allShipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
      cancelled: allShipments.filter(s => s.status === ShipmentStatus.CANCELLED).length,
      totalRevenue: allShipments.reduce((sum, s) => sum + (s.actualRate || s.estimatedRate), 0),
      activeDrivers: allDrivers.filter(d => d.isActive).length,
      totalDrivers: allDrivers.length,
    };
  }, [allShipmentsData, driversData]);

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

  const completionRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="mb-8 animate-fadeInUp relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/shipments/create')}
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl
                     hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105
                     shadow-lg shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/50
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Shipment
            <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {canViewAnalytics && (
        <>
          {/* Key Metrics - 3D Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 perspective-container relative z-10">
            {/* Total Shipments Card */}
            <div className="glass rounded-2xl p-6 card-3d shadow-xl border-slate-200 animate-fadeInUp delay-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">+12%</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Shipments</h3>
              <p className="text-3xl font-display font-bold text-slate-900 font-mono">{stats.total}</p>
            </div>

            {/* Delivered Card */}
            <div className="glass rounded-2xl p-6 card-3d shadow-xl border-slate-200 animate-fadeInUp delay-200 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">+8%</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Delivered</h3>
              <p className="text-3xl font-display font-bold text-slate-900 font-mono">{stats.delivered}</p>
            </div>

            {/* In Transit Card */}
            <div className="glass rounded-2xl p-6 card-3d shadow-xl border-slate-200 animate-fadeInUp delay-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">Live</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">In Transit</h3>
              <p className="text-3xl font-display font-bold text-slate-900 font-mono">{stats.inTransit}</p>
            </div>

            {/* Revenue Card */}
            <div className="glass rounded-2xl p-6 card-3d shadow-xl border-slate-200 animate-fadeInUp delay-400 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">+15%</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-display font-bold text-slate-900 font-mono">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Status Distribution & Driver Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
            {/* Status Distribution Chart */}
            <div className="glass rounded-2xl p-6 shadow-xl border-slate-200 animate-fadeInUp delay-500">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Status Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', total: stats.total },
                  { label: 'Assigned', value: stats.assigned, color: 'bg-blue-500', total: stats.total },
                  { label: 'Picked Up', value: stats.pickedUp, color: 'bg-indigo-500', total: stats.total },
                  { label: 'In Transit', value: stats.inTransit, color: 'bg-purple-500', total: stats.total },
                  { label: 'Delivered', value: stats.delivered, color: 'bg-emerald-500', total: stats.total },
                  { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500', total: stats.total },
                ].map((item, index) => {
                  const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  return (
                    <div key={item.label} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">{item.value}</span>
                      </div>
                      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${item.color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                          style={{ width: `${percentage}%`, animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute inset-0 shimmer opacity-30"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Driver Overview */}
            <div className="glass rounded-2xl p-6 shadow-xl border-slate-200 animate-fadeInUp delay-600">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-slate-900">Driver Overview</h3>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full">
                  {stats.activeDrivers} Active
                </div>
              </div>
              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Active Drivers</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{stats.activeDrivers} / {stats.totalDrivers}</span>
                  </div>
                  <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${stats.totalDrivers > 0 ? (stats.activeDrivers / stats.totalDrivers) * 100 : 0}%` }}
                    >
                      <div className="absolute inset-0 shimmer opacity-30"></div>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Completion Rate</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{completionRate}%</span>
                  </div>
                  <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${completionRate}%` }}
                    >
                      <div className="absolute inset-0 shimmer opacity-30"></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                      <span className="text-slate-600">Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Shipments */}
      <div className="glass rounded-2xl p-6 shadow-xl border-slate-200 animate-fadeInUp delay-700 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-slate-900">Recent Shipments</h3>
          <button
            onClick={() => navigate('/admin/shipments')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group"
          >
            View All
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {recentShipments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-500 font-medium">No shipments available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Tracking #</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Route</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment, index) => (
                  <tr
                    key={shipment.id}
                    onClick={() => navigate(`/admin/shipments/${shipment.id}`)}
                    className="border-b border-slate-100 hover:bg-white/50 cursor-pointer transition-all duration-200 group animate-fadeInUp"
                    style={{ animationDelay: `${800 + index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
                        {shipment.trackingNumber.substring(0, 12)}...
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{shipment.shipperCity}, {shipment.shipperState}</div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {shipment.consigneeCity}, {shipment.consigneeState}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 font-medium">
                      {new Date(shipment.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-mono font-bold text-slate-900">
                        ${shipment.estimatedRate.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export default function Settings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      push: false,
      shipmentUpdates: true,
      assignments: true,
    },
    dashboard: {
      showStats: true,
      defaultView: 'table',
    },
  });

  const handleSavePreferences = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Preferences saved successfully!');
  };

  const handleExportData = () => {
    // In a real app, this would trigger data export
    alert('Data export will be available soon');
  };

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 animate-fadeInUp">
          <h2 className="text-4xl font-display font-bold text-slate-900">
            Settings
          </h2>
          <p className="mt-2 text-slate-600 text-lg">
            Manage your application preferences and settings
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-100 card-3d">
            <div className="px-6 py-4 glass-dark">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                General Settings
              </h3>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label htmlFor="language" className="block text-sm font-semibold text-slate-700 mb-2">
                  Language
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full max-w-xs px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all duration-200"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-slate-700 mb-2">
                  Default Currency
                </label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full max-w-xs px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all duration-200"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-200 card-3d">
            <div className="px-6 py-4 glass-dark">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notification Preferences
              </h3>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                <div>
                  <label htmlFor="emailNotif" className="text-sm font-semibold text-slate-900 cursor-pointer">
                    Email Notifications
                  </label>
                  <p className="text-sm text-slate-600">Receive updates via email</p>
                </div>
                <input
                  type="checkbox"
                  id="emailNotif"
                  checked={preferences.notifications.email}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: e.target.checked },
                    })
                  }
                  className="h-5 w-5 text-orange-600 focus:ring-2 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                <div>
                  <label htmlFor="pushNotif" className="text-sm font-semibold text-slate-900 cursor-pointer">
                    Push Notifications
                  </label>
                  <p className="text-sm text-slate-600">Receive browser push notifications</p>
                </div>
                <input
                  type="checkbox"
                  id="pushNotif"
                  checked={preferences.notifications.push}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, push: e.target.checked },
                    })
                  }
                  className="h-5 w-5 text-orange-600 focus:ring-2 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                <div>
                  <label htmlFor="shipmentUpdates" className="text-sm font-semibold text-slate-900 cursor-pointer">
                    Shipment Updates
                  </label>
                  <p className="text-sm text-slate-600">Get notified on shipment status changes</p>
                </div>
                <input
                  type="checkbox"
                  id="shipmentUpdates"
                  checked={preferences.notifications.shipmentUpdates}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, shipmentUpdates: e.target.checked },
                    })
                  }
                  className="h-5 w-5 text-orange-600 focus:ring-2 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                />
              </div>

              {user?.role === UserRole.DRIVER && (
                <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                  <div>
                    <label htmlFor="assignments" className="text-sm font-semibold text-slate-900 cursor-pointer">
                      Assignment Notifications
                    </label>
                    <p className="text-sm text-slate-600">Get notified when assigned to shipments</p>
                  </div>
                  <input
                    type="checkbox"
                    id="assignments"
                    checked={preferences.notifications.assignments}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, assignments: e.target.checked },
                      })
                    }
                    className="h-5 w-5 text-orange-600 focus:ring-2 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Preferences */}
          {user && ([UserRole.ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role) && (
            <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-300 card-3d">
              <div className="px-6 py-4 glass-dark">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard Preferences
                </h3>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                  <div>
                    <label htmlFor="showStats" className="text-sm font-semibold text-slate-900 cursor-pointer">
                      Show Statistics
                    </label>
                    <p className="text-sm text-slate-600">Display analytics and stats on dashboard</p>
                  </div>
                  <input
                    type="checkbox"
                    id="showStats"
                    checked={preferences.dashboard.showStats}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        dashboard: { ...preferences.dashboard, showStats: e.target.checked },
                      })
                    }
                    className="h-5 w-5 text-orange-600 focus:ring-2 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="defaultView" className="block text-sm font-semibold text-slate-700 mb-2">
                    Default View
                  </label>
                  <select
                    id="defaultView"
                    value={preferences.dashboard.defaultView}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        dashboard: { ...preferences.dashboard, defaultView: e.target.value },
                      })
                    }
                    className="w-full max-w-xs px-4 py-3 glass border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all duration-200"
                  >
                    <option value="table">Table View</option>
                    <option value="cards">Card View</option>
                    <option value="list">List View</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-400 card-3d">
            <div className="px-6 py-4 glass-dark">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Data Management
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between glass border-slate-200 rounded-xl p-4 hover:bg-white/50 transition-all duration-200">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Export Your Data</h4>
                  <p className="text-sm text-slate-600">Download a copy of your shipment data</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="group relative px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl
                           hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105
                           shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-500 card-3d">
            <div className="px-6 py-4 glass-dark">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                System Information
              </h3>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Application Version</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">1.0.0</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Your Role</dt>
                  <dd className="mt-2">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                      user?.role === 'ADMIN'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : user?.role === 'DISPATCHER'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : user?.role === 'DRIVER'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                    }`}>
                      {user?.role}
                    </span>
                  </dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Last Login</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">{new Date().toLocaleString()}</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Account Status</dt>
                  <dd className="mt-2">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end animate-fadeInUp delay-600">
            <button
              onClick={handleSavePreferences}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-xl
                       hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105
                       shadow-xl shadow-orange-600/30 hover:shadow-2xl hover:shadow-orange-600/50
                       flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Preferences
              <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

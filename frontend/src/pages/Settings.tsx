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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your application preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                id="currency"
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotif" className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500">Receive updates via email</p>
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="pushNotif" className="text-sm font-medium text-gray-700">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="shipmentUpdates" className="text-sm font-medium text-gray-700">
                  Shipment Updates
                </label>
                <p className="text-sm text-gray-500">Get notified on shipment status changes</p>
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
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            {user?.role === UserRole.DRIVER && (
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="assignments" className="text-sm font-medium text-gray-700">
                    Assignment Notifications
                  </label>
                  <p className="text-sm text-gray-500">Get notified when assigned to shipments</p>
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
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Preferences */}
        {user && [UserRole.ADMIN, UserRole.DISPATCHER].includes(user.role) && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Dashboard Preferences</h3>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="showStats" className="text-sm font-medium text-gray-700">
                    Show Statistics
                  </label>
                  <p className="text-sm text-gray-500">Display analytics and stats on dashboard</p>
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
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label htmlFor="defaultView" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Export Your Data</h4>
                <p className="text-sm text-gray-500">Download a copy of your shipment data</p>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Application Version</dt>
                <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Your Role</dt>
                <dd className="mt-1">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {user?.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                <dd className="mt-1">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

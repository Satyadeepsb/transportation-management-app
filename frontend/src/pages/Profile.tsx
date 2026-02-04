import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '../contexts/AuthContext';
import { UPDATE_USER_MUTATION } from '../graphql/users';
import type { User } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [updateUser, { loading }] = useMutation<{ updateUser: User }>(UPDATE_USER_MUTATION);

  if (!user) {
    navigate('/auth/sign-in');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await updateUser({
        variables: {
          input: {
            id: user.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
          },
        },
      });

      if (data?.updateUser) {
        updateAuthUser(data.updateUser);
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrors({ submit: err.message || 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      // Note: This would require a separate mutation for password change
      // For now, show a placeholder message
      setSuccessMessage('Password change functionality to be implemented');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setErrors({ submit: err.message || 'Failed to change password' });
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'DISPATCHER':
        return 'bg-blue-100 text-blue-800';
      case 'DRIVER':
        return 'bg-green-100 text-green-800';
      case 'CUSTOMER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen gradient-mesh -m-6 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float"></div>
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 float-delayed"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 animate-fadeInUp">
          <h2 className="text-4xl font-display font-bold text-slate-900">
            My Profile
          </h2>
          <p className="mt-2 text-slate-600 text-lg">
            Manage your account information
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 glass border-emerald-300 rounded-xl p-4 shadow-lg animate-scaleIn">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-emerald-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 glass border-red-300 rounded-xl p-4 shadow-lg animate-scaleIn">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-100 card-3d">
          <div className="px-6 py-4 glass-dark">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-semibold text-white hover:text-cyan-200 transition-colors duration-200 hover:scale-110 transform"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                        errors.firstName
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                        errors.lastName
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                          : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                      }`}
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 glass border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-xl
                             hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 transform hover:scale-105
                             shadow-lg shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/50
                             disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                    <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">First Name</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">{user.firstName}</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Last Name</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">{user.lastName}</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Email</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">{user.email}</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Phone</dt>
                  <dd className="mt-2 text-base font-semibold text-slate-900">{user.phone || 'Not provided'}</dd>
                </div>
                <div className="glass border-slate-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Role</dt>
                  <dd className="mt-2">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                      user.role === 'ADMIN'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : user.role === 'DISPATCHER'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : user.role === 'DRIVER'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                    }`}>
                      {user.role}
                    </span>
                  </dd>
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
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="mt-6 glass border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp delay-200 card-3d">
          <div className="px-6 py-4 glass-dark">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </h3>
                <p className="mt-1 text-sm text-slate-200">Change your account password</p>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 text-sm font-semibold text-white hover:text-cyan-200 transition-colors duration-200 hover:scale-110 transform"
                >
                  Change Password
                </button>
              )}
            </div>
          </div>

          {isChangingPassword && (
            <div className="px-6 py-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                      errors.currentPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="mt-2 text-sm font-medium text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                      errors.newPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                    }`}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.newPassword && (
                    <p className="mt-2 text-sm font-medium text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className={`block w-full px-4 py-3 glass border-slate-200 rounded-xl shadow-sm font-medium transition-all duration-200 ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                        : 'border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm font-medium text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setErrors({});
                    }}
                    className="px-6 py-3 glass border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="group relative px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl
                             hover:from-teal-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105
                             shadow-lg shadow-teal-600/30 hover:shadow-2xl hover:shadow-teal-600/50"
                  >
                    Update Password
                    <div className="absolute inset-0 rounded-xl shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="mt-6 glass border-slate-200 rounded-2xl shadow-xl px-6 py-6 animate-fadeInUp delay-300 card-3d">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass border-slate-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Account Created
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div className="glass border-slate-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Last Updated
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-900">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

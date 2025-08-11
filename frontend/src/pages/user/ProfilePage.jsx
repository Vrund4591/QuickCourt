import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    avatar: user?.avatar || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate profile update
      updateUser(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-secondary"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="flex items-center mb-8">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-20 h-20 rounded-full border-4 border-[#604058]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#604058] flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-[#604058] font-medium">{user?.role}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Full Name</p>
                    <p className="font-semibold">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Role</p>
                    <p className="font-semibold">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Member Since</p>
                    <p className="font-semibold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

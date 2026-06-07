import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { toast } from 'react-toastify';
import axiosInstance from '../AuthPages/axiosConfig';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    mobileNumber: '',
    address: '',
    image: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('UserData'))?.token;

        if (!token) {
          setError('Authentication token is missing');
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get('/auth/get/user/id', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setError(response.data.msg || 'Failed to fetch user profile');
          toast.error(response.data.msg || 'Failed to fetch user profile');
        }
      } catch (err) {
        setError('Failed to load user profile');
        toast.error('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = JSON.parse(localStorage.getItem('UserData'))?.token;
      
      const response = await axiosInstance.put('/auth/update/user', user, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(response.data.msg || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    // Refetch original data
    const fetchData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('UserData'))?.token;
        const response = await axiosInstance.get('/auth/get/user/id', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchData();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar role="user" activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar role="user" activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="user" activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                    <img 
                      src={`http://localhost:8080/images/${user.image}` || '/default-avatar.png'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">User ID: {user.id}</p>
                <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {user.role}
                </span>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={user.mobileNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.mobileNumber || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={user.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-[44px] whitespace-pre-line">
                        {user.address || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Info (non-editable) */}
                {!isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Account Status</p>
                        <p className="text-green-600 font-medium">
                          {user.enabled ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Non Locked</p>
                        <p className={user.accountNonLocked ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {user.accountNonLocked ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Non Expired</p>
                        <p className={user.accountNonExpired ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {user.accountNonExpired ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Credentials Non Expired</p>
                        <p className={user.credentialsNonExpired ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {user.credentialsNonExpired ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <p className="text-gray-600 mb-2">Last changed 3 months ago</p>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                  Change Password
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Authentication</label>
                <p className="text-gray-600 mb-2">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
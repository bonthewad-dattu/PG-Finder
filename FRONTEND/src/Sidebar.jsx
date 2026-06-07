import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiUser, FiEye, FiFilePlus,
  FiUpload, FiSearch, FiLogOut, FiBriefcase, FiDollarSign, FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
    { id: 'manageLocations', label: 'Manage Locations', icon: <FiMapPin />, path: '/admin/manage-locations' },
    { id: 'managePGs', label: 'Manage PGs', icon: <FiBriefcase />, path: '/admin/manage-pgs' },
    { id: 'viewBookings', label: 'View Bookings', icon: <FiDollarSign />, path: '/admin/view-bookings' },
  ];

  const userMenu = [
    { id: 'viewPGs', label: 'View PGs', icon: <FiSearch />, path: '/user/view-pgs' },
    { id: 'viewBookingHistory', label: 'Booking History', icon: <FiFilePlus />, path: '/user/booking-history' },
    { id: 'profile', label: 'Profile', icon: <FiUser />, path: '/user/profile' },  // Added Profile for User
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'admin': return adminMenu;
      case 'user': return userMenu;
      default: return [];
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'user': return 'Customer';
      default: return '';
    }
  };

  const menuItems = getMenuItems();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("UserData");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success('Logged out successfully');
    navigate("/");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 text-gray-800 p-4 h-screen sticky top-0 flex flex-col shadow-sm">
      {/* Header */}
      <div className="mb-6 p-4 flex items-center space-x-3 border-b border-gray-100 pb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-md">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">PG Finder</h3>
          <p className="text-xs text-gray-500 font-medium">{getRoleTitle()} Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gray-50 text-gray-600 border-l-4 border-gray-500 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={`text-lg ${activeTab === item.id ? 'text-gray-500' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 border border-gray-200">
            <FiUser size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">My Account</p>
            <p className="text-xs text-gray-500">{getRoleTitle()}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-all duration-200 group"
        >
          <span className="text-lg text-gray-500 group-hover:text-gray-500">
            <FiLogOut />
          </span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

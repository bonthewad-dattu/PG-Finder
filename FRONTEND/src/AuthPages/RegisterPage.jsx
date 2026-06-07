import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuth } from './AuthProvider';
import axiosInstance from './axiosConfig';

function AuthPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('USER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    address: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'USER',
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setRegisterSuccess(false);

    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/register', formData);

      setRegisterSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        address: '',
      });

      setTimeout(() => {
        setIsRegisterOpen(false);
        setRegisterSuccess(false);
      }, 2000);
    } catch (error) {
      setErrors({
        form: error.response?.data?.msg || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginErrors({});

    const newErrors = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      setIsLoginLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/users/login', loginData);
      login(response.data.user, response.data.token);
      setIsLoginOpen(false);
    } catch (error) {
      setLoginErrors({
        form: error.response?.data?.message || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    // Implement forgot password functionality here
    alert('Forgot password feature is under development');
  };

  return (
    <div className="font-sans bg-gray-50 antialiased">
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">Login to FundTastic</Dialog.Title>

            {loginErrors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {loginErrors.form}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-gray-700 mb-2">Email</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="login-password" className="block text-gray-700 mb-2">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="login-role" className="block text-gray-700 mb-2">Role</label>
                <select
                  id="login-role"
                  name="role"
                  value={loginData.role}
                  onChange={handleLoginInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                >
                  <option value="USER">User</option>
                  <option value="INVESTOR">Investor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isLoginLoading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsLoginOpen(false);
                    setIsRegisterOpen(true);
                  }}
                  className="text-gray-800 font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
              <p
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsForgotPasswordOpen(true);
                }}
                className="text-gray-600 hover:text-gray-800 cursor-pointer mt-2"
              >
                Forgot password?
              </p>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">Create an Account</Dialog.Title>

            {registerSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                Registration successful! You can now login.
              </div>
            )}

            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="mobileNumber" className="block text-gray-700 mb-2">Mobile Number</label>
                <input
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="text-gray-800 font-medium hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">Forgot Password</Dialog.Title>

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="forgot-email" className="block text-gray-700 mb-2">Enter your email</label>
                <input
                  id="forgot-email"
                  type="email"
                  name="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default AuthPage;

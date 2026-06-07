import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import axiosInstance from './AuthPages/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthPages/AuthProvider';
import { toast } from 'react-toastify';

const PGFinderWithAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // PG Finder state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Auth state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    address: '',
    role: 'USER',
    image: null,
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Sample PG data
  const samplePGs = [
    {
      id: 1,
      name: "Elite Stay PG",
      location: "Koramangala, Bangalore",
      price: "₹12,000/month",
      rating: 4.5,
      amenities: ["Wi-Fi", "AC", "Food"],
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      name: "Comfort Homes",
      location: "HSR Layout, Bangalore",
      price: "₹10,000/month",
      rating: 4.2,
      amenities: ["Wi-Fi", "Laundry", "Food"],
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      name: "Urban Nest PG",
      location: "Indiranagar, Bangalore",
      price: "₹15,000/month",
      rating: 4.00, amenities: ["Wi-Fi", "AC", "Gym", "Food"],
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      name: "Green Valley PG",
      location: "Whitefield, Bangalore",
      price: "₹9,000/month",
      rating: 4.0,
      amenities: ["Wi-Fi", "Parking", "Food"],
      image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 5,
      name: "Metro Living",
      location: "MG Road, Bangalore",
      price: "₹18,000/month",
      rating: 4.9,
      amenities: ["Wi-Fi", "AC", "Pool", "Gym", "Food"],
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 6,
      name: "Student Hub PG",
      location: "BTM Layout, Bangalore",
      price: "₹8,500/month",
      rating: 4.1,
      amenities: ["Wi-Fi", "Library", "Food"],
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    },
  ];

  // Handle PG search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim() === '') {
      setSearchResults(samplePGs);
    } else {
      const filteredResults = samplePGs.filter((pg) =>
        pg.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
      setSearchResults(filteredResults);
    }
    setShowResults(true);
  };

  // Auth functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image file',
      }));
      return;
    }
    setFormData({
      ...formData,
      image: file,
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
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number';
    if (!formData.image) newErrors.image = 'Profile image is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('mobileNumber', formData.mobileNumber);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('image', formData.image);

    try {
      const response = await axiosInstance.post('/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setRegisterSuccess(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          mobileNumber: '',
          address: '',
          role: 'USER',
          image: null,
        });

        setTimeout(() => {
          setIsRegisterOpen(false);
          setRegisterSuccess(false);
          setIsLoginOpen(true);
        }, 2000);
      } else {
        setErrors({
          form: response.data.message || 'Registration failed. Please try again.',
        });
      }
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Network error. Please try again.',
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
    else if (!validateEmail(loginData.email)) newErrors.email = 'Invalid email format';
    if (!loginData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      setIsLoginLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/login', loginData);

      if (response.status === 200) {
        const { user, token } = response.data;
        setIsLoggedIn(true);
        setUser(user);
        login(response.data, token);

        // Store token in localStorage (removed cookie storage for simplicity)
        localStorage.setItem('token', token);

        setLoginData({
          email: '',
          password: '',
        });

        // Navigate based on role
        switch (response.data.role.toUpperCase()) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'USER':
            navigate('/user/view-pgs');
            break;
          default:
            navigate('/user/dashboard'); // Default to user dashboard
        }
        toast.success("🎉 Congratulations! You’ve successfully logged in! 🚀");
        setIsLoginOpen(false);
      } else {
        setLoginErrors({
          form: response.data.message || 'Login failed. Please try again.',
        });
      }
    } catch (error) {
      setLoginErrors({
        form: error.response?.data?.message || 'Network error. Please try again.',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!forgotPasswordEmail) {
      setErrors({ forgotEmail: 'Email is required' });
      setIsLoading(false);
      return;
    }
    if (!validateEmail(forgotPasswordEmail)) {
      setErrors({ forgotEmail: 'Invalid email format' });
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/auth/forgot-password', { email: forgotPasswordEmail });
      alert('Password reset instructions have been sent to your email.');
      setForgotPasswordEmail('');
      setIsForgotPasswordOpen(false);
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || 'Failed to send reset instructions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xl">PG</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">PG Finder</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-orange-600 hover:text-orange-400">Home</a>
            <a href="#" className="text-gray-600 hover:text-orange-400">About</a>
            <a href="#" className="text-gray-600 hover:text-orange-400">Cities</a>
            <a href="#" className="text-gray-600 hover:text-orange-400">Contact</a>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user?.username || 'User'}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition duration-300"
              >
                Login
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Find Your Perfect PG <span className="text-orange-600">Near You</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover the best paying guest accommodations tailored to your needs.
              Search by location, budget, amenities, and more.
            </p>
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">Verified listings with real photos</p>
            </div>
            <div className="flex items-center mt-4">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">No brokerage, contact owners directly</p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Find PG Accommodation</h2>
              <form onSubmit={handleSearch}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="location">
                    Enter Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="location"
                      type="text"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g. Koramangala, Bangalore"
                      value指标:value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      aria-label="Search location"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="budget">
                    Budget Range (₹)
                  </label>
                  <select
                    id="budget"
                    className="block w-full py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    aria-label="Budget range"
                  >
                    <option>5,000 - 10,000</option>
                    <option>10,000 - 15,000</option>
                    <option>15,000 - 20,000</option>
                    <option>20,000+</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition duration-300"
                >
                  Search PGs
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Featured PGs Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {showResults ? 'Search Results' : 'Featured PGs'}
        </h2>
        <p className="text-gray-600 text-center mb-10">
          {showResults ? `Showing results for "${searchLocation}"` : 'Popular choices with great amenities'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(showResults ? searchResults : samplePGs.slice(0, 3)).map((pg) => (
            <div
              key={pg.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="h-48 overflow-hidden">
                <img src={pg.image} alt={pg.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{pg.name}</h3>
                  <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-2 py-1 rounded-full">
                    {pg.rating} ★
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{pg.location}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {pg.amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-orange-600">{pg.price}</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Search</h3>
              <p className="text-gray-600">Find PGs by location, budget, and amenities</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Compare</h3>
              <p className="text-gray-600">View photos, amenities, and prices</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Contact</h3>
              <p className="text-gray-600">Connect directly with PG owners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PG Finder</h3>
              <p className="text-gray-400">Find your perfect paying guest accommodation with ease.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Popular Cities</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Bangalore</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Delhi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Mumbai</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Hyderabad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <address className="text-gray-400 not-italic">
                <p>123 MG Road</p>
                <p>Bangalore, KA 560001</p>
                <p className="mt-2">Email: info@pgfinder.com</p>
                <p>Phone: +91 98765 43210</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} PG Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">Login to PG Finder</Dialog.Title>

            {loginErrors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {loginErrors.form}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Email"
                  required
                />
                {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="login-password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Password"
                  required
                />
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
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
                  className="text-orange-600 font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
              <button
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsForgotPasswordOpen(true);
                }}
                className="text-gray-600 hover:text-gray-800 mt-2"
              >
                Forgot password?
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
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
                <label htmlFor="username" className="block text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Username"
                  required
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Email"
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Password"
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="mobileNumber" className="block text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Mobile Number"
                  required
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Address"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 mb-2">
                  Profile Image
                </label>
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Profile Image"
                  required
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Role"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
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
                  className="text-orange-600 font-medium hover:underline"
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
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">Forgot Password</Dialog.Title>

            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="forgot-email" className="block text-gray-700 mb-2">
                  Enter your email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  name="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label="Email for password reset"
                  required
                />
                {errors.forgotEmail && <p className="text-red-500 text-sm mt-1">{errors.forgotEmail}</p>}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
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
};

export default PGFinderWithAuth;
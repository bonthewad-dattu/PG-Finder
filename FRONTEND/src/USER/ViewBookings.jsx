import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import axiosInstance from '../AuthPages/axiosConfig';

const ViewBookings = () => {
    const [activeTab, setActiveTab] = useState('viewBookings');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
        const token = JSON.parse(localStorage.getItem('UserData')).token;

    // Fetch bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/user/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}` // Add the token to the Authorization header
                    }
            });
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Filter bookings based on status and search term
    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
        const matchesSearch =
            booking.pg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.pg.location.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Open modal with booking details
    const openModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    // Get status badge class based on status
    const getStatusClass = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar role="user" activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookings</h2>
                        <p className="text-sm text-gray-500 mt-1">View and manage your PG bookings</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by PG name or location..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredBookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-xl font-bold text-gray-900">{booking.pg.name}</h3>
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Location</p>
                                                    <p className="text-gray-900">{booking.pg.location.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Price</p>
                                                    <p className="text-gray-900">₹{booking.pg.price.toLocaleString()}/month</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Booking Date</p>
                                                    <p className="text-gray-900">{formatDate(booking.bookingDate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Gender</p>
                                                    <p className="text-gray-900">{booking.pg.gender}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                                            <button
                                                onClick={() => openModal(booking)}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                            >
                                                View Details
                                            </button>
                                            {booking.status === 'PENDING' && (
                                                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 mb-4">
                            {bookings.length === 0
                                ? "You haven't made any bookings yet."
                                : "No bookings match your search criteria."}
                        </p>
                        {bookings.length === 0 && (
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Browse PGs
                            </button>
                        )}
                    </div>
                )}

                {/* Booking Details Modal */}
                {isModalOpen && selectedBooking && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">{selectedBooking.pg.name}</h3>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="text-gray-900">{selectedBooking.pg.location.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="text-gray-900">₹{selectedBooking.pg.price.toLocaleString()}/month</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Booking Date</p>
                                        <p className="text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="text-gray-900">{selectedBooking.pg.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Booking ID</p>
                                        <p className="text-gray-900">#{selectedBooking.id}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-gray-900">{selectedBooking.pg.address}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Amenities</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Array.isArray(selectedBooking.pg.amenities) &&
                                            selectedBooking.pg.amenities.map((amenity, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    {amenity.replace(/["\[\]]/g, '')}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">User Information</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                        <div>
                                            <p className="text-gray-900 font-medium">Name</p>
                                            <p className="text-gray-600">{selectedBooking.user.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Email</p>
                                            <p className="text-gray-600">{selectedBooking.user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Phone</p>
                                            <p className="text-gray-600">{selectedBooking.user.mobileNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Address</p>
                                            <p className="text-gray-600">{selectedBooking.user.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewBookings;
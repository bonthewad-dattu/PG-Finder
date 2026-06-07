import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import { toast } from 'react-toastify';
import axiosInstance from '../AuthPages/axiosConfig';

const ManageBookings = () => {
    const [activeTab, setActiveTab] = useState('viewBookings');
    const [bookings, setBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const token = JSON.parse(localStorage.getItem('UserData'))?.token;

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/admin/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Error fetching bookings");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBookings();
        }
    }, [token]);

    // Filter bookings based on search term and status
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.pg.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Update booking status (CONFIRMED or REJECTED)
    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await axiosInstance.put(`/admin/update/${id}`, null, {
                params: { status },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success(`Booking ${status.toLowerCase()}`);
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.id === id ? { ...booking, status } : booking
                )
            );
        } catch (error) {
            console.error(`Error updating booking status to ${status}:`, error);
            toast.error(`Error updating booking status to ${status}`);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Bookings</h2>
                        <p className="text-sm text-gray-500 mt-1">View, manage, or filter bookings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by user or PG..."
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
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PG</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.pg.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                {booking.status === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500 italic">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBookings;

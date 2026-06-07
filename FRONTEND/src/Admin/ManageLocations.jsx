import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import axiosInstance from '../AuthPages/axiosConfig';
import { toast } from 'react-toastify';


const ManageLocations = () => {
    const [activeTab, setActiveTab] = useState('manageLocations');
    const [locations, setLocations] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [newLocation, setNewLocation] = useState({ name: '' });

    const token = JSON.parse(localStorage.getItem('UserData')).token;
    console.log(token);


    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`/get/locations`, {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGdtYWlsLmNvbSIsImlhdCI6MTc1NjA5OTU3MCwiZXhwIjoxNzU2MTAzMTcwfQ.A5Ib72TEp1shlgB8VZY3XZIxu6wJPPpvWZc_qtyIMzM`
                }
            });
            setLocations(response.data.locations);
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error('Error response:', error.response);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error message:', error.message);
            }
        }
    };

    const handleAddLocation = async () => {
        try {
            await axiosInstance.post(
                `/admin/locations`,
                { name: newLocation.name },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchLocations();
            setNewLocation({ name: '' });
            setIsAddModalOpen(false);
            toast.success("Location added successfully")
        } catch (error) {
            console.error('Error adding location:', error);
        }
    };

    const handleEditLocation = async () => {
        try {
            await axiosInstance.put(
                `/admin/locations/${selectedLocation.id}`,
                { name: selectedLocation.name },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchLocations();
            setIsEditModalOpen(false);
            setSelectedLocation(null);
            toast.success(" Location updated successfully")
        } catch (error) {
            console.error('Error editing location:', error);
        }
    };

    const handleDeleteLocation = async () => {
        try {
            await axiosInstance.delete(`/admin/locations/${selectedLocation.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLocations();
            setIsDeleteModalOpen(false);
            setSelectedLocation(null);
            toast.success("Location deleted successfully")
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    const openEditModal = (location) => {
        setSelectedLocation({ ...location });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (location) => {
        setSelectedLocation(location);
        setIsDeleteModalOpen(true);
    };

    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || location.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Locations</h2>
                        <p className="text-sm text-gray-500 mt-1">Add, edit, or remove locations available for PGs</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Location
                    </button>
                </div>

                {/* Search & Filter */}
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
                                placeholder="Search locations..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Filter by status:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Locations Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLocations.length > 0 ? (
                                    filteredLocations.map((location) => (
                                        <tr key={location.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <button
                                                    onClick={() => openEditModal(location)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(location)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No locations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Location</h3>
                                <input
                                    type="text"
                                    placeholder="Location name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({ name: e.target.value })}
                                />
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLocation}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && selectedLocation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Location</h3>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedLocation.name}
                                    onChange={(e) =>
                                        setSelectedLocation({ ...selectedLocation, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditLocation}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && selectedLocation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Location</h3>
                                <p>Are you sure you want to delete <b>{selectedLocation.name}</b>?</p>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteLocation}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageLocations;

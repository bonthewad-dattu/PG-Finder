import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import axios from 'axios';
import axiosInstance from '../AuthPages/axiosConfig';
import { toast } from 'react-toastify';

const ManagePGs = () => {
    const [activeTab, setActiveTab] = useState('managePGs');
    const [pgs, setPGs] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPG, setSelectedPG] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [newPG, setNewPG] = useState({
        name: '',
        locationId: '',
        price: 0,
        address: '',
        gender: 'Male',
        amenities: [],
        images: []
    });
    const [selectedImages, setSelectedImages] = useState([]);

    // Fetch PGs from the API when the component mounts
    useEffect(() => {
        fetchPGs();
        fetchLocations();
    }, []);

    const fetchPGs = () => {
        axiosInstance.get('/all/pgs')
            .then(response => {
                if (response.data.success) {
                    // Process the API response to handle amenities and image URLs
                    const processedPGs = response.data.pgs.map(pg => ({
                        ...pg,
                        // Handle amenities: if they are a string, parse it into an array
                        amenities: Array.isArray(pg.amenities)
                            ? pg.amenities
                            : (typeof pg.amenities === 'string' ? JSON.parse(pg.amenities) : []),
                        // Adjust image URL path accordingly
                        images: pg.images.map(image => `http://localhost:8080/hostels/${image}`)
                    }));
                    setPGs(processedPGs);
                }
            })
            .catch(error => {
                console.error("Error fetching PGs: ", error);
            });
    };



    const fetchLocations = () => {
        axiosInstance.get('/get/locations')
            .then(response => {
                if (response.data.success) {
                    setLocations(response.data.locations);
                }
            })
            .catch(error => {
                console.error("Error fetching locations: ", error);
            });
    };

    // Get unique location names for filter
    const locationNames = ['All', ...new Set(pgs.map(pg => pg.location.name))];

    // Filter PGs based on search term and filters
    const filteredPGs = pgs.filter(pg => {
        const matchesSearch = pg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pg.location.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || pg.status === statusFilter;
        const matchesLocation = locationFilter === 'All' || pg.location.name === locationFilter;
        return matchesSearch && matchesStatus && matchesLocation;
    });

    // Handle adding a new PG
    const handleAddPG = () => {
        const formData = new FormData();

        // Append all fields to formData
        formData.append('name', newPG.name);
        formData.append('locationId', newPG.locationId);
        formData.append('price', newPG.price);
        formData.append('address', newPG.address);
        formData.append('gender', newPG.gender);

        // Append amenities as individual values
        newPG.amenities.forEach(amenity => {
            formData.append('amenities', amenity);
        });

        // Append all selected images
        selectedImages.forEach(image => {
            formData.append('images', image);
        });

        axiosInstance.post('/admin/pgs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                fetchPGs(); // Refresh the list
                setNewPG({
                    name: '',
                    locationId: '',
                    price: 0,
                    address: '',
                    gender: 'Male',
                    amenities: [],
                    images: []
                });
                setSelectedImages([]);
                setIsAddModalOpen(false);
                toast.success("Pg Added Successfully")
            })
            .catch(error => {
                console.error("Error adding PG: ", error);
            });
    };

    // Handle image selection for new PG
    const handleImageChange = (e) => {
        setSelectedImages([...e.target.files]);
    };

    // Handle amenities input change
    const handleAmenitiesChange = (e) => {
        const { value } = e.target;
        setNewPG({ ...newPG, amenities: value.split(',').map(item => item.trim()) });
    };

    // Open edit modal with PG data
    const openEditModal = (pg) => {
        setSelectedPG({ ...pg });
        setIsEditModalOpen(true);
    };

    // Open view modal with PG data
    const openViewModal = (pg) => {
        setSelectedPG(pg);
        setIsViewModalOpen(true);
    };

    // Open delete confirmation modal
    const openDeleteModal = (pg) => {
        setSelectedPG(pg);
        setIsDeleteModalOpen(true);
    };

    // Handle deleting a PG
    const handleDeletePG = () => {
        if (!selectedPG) return;

        axiosInstance.delete(`/admin/pgs/${selectedPG.id}`)
            .then(response => {
                fetchPGs(); // Refresh the list
                setIsDeleteModalOpen(false);
                setSelectedPG(null);
                toast.success("Pg Deleted Successfully")

            })
            .catch(error => {
                console.error("Error deleting PG: ", error);
            });
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar role="admin" activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manage PGs</h2>
                        <p className="text-sm text-gray-500 mt-1">Add, edit, or remove PG accommodations</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add New PG
                    </button>
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
                                placeholder="Search PGs..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Status:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Location:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    {locationNames.map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PGs Grid */}
                {filteredPGs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPGs.map(pg => (
                            <div key={pg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                                <div className="h-48 overflow-hidden">
                                    <img src={pg.images[0] || '/placeholder-image.jpg'} alt={pg.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{pg.name}</h3>
                                        <span className="bg-green-100 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                                            {pg.rating} ★
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{pg.location.name}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pg.amenities.slice(0, 3).map((amenity, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {amenity}
                                            </span>
                                        ))}
                                        {pg.amenities.length > 3 && (
                                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                +{pg.amenities.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xl font-bold text-green-600">₹{pg.price.toLocaleString()}/month</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pg.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {pg.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between space-x-2">
                                        <button
                                            onClick={() => openViewModal(pg)}
                                            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            View
                                        </button>
                                        {/* <button
                                            onClick={() => openEditModal(pg)}
                                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Edit
                                        </button> */}
                                        <button
                                            onClick={() => openDeleteModal(pg)}
                                            className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No PGs found</h3>
                        <p className="text-gray-500 mb-4">No PG accommodations match your search criteria.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add New PG
                        </button>
                    </div>
                )}

                {/* Add PG Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Add New PG</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PG Name</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.name}
                                            onChange={(e) => setNewPG({ ...newPG, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.locationId}
                                            onChange={(e) => setNewPG({ ...newPG, locationId: e.target.value })}
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(location => (
                                                <option key={location.id} value={location.id}>{location.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.price}
                                            onChange={(e) => setNewPG({ ...newPG, price: parseFloat(e.target.value) })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.address}
                                            onChange={(e) => setNewPG({ ...newPG, address: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.gender}
                                            onChange={(e) => setNewPG({ ...newPG, gender: e.target.value })}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Co-living">Co-living</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            value={newPG.amenities.join(', ')}
                                            onChange={handleAmenitiesChange}
                                            placeholder="Wi-Fi, AC, Parking, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                                        <input
                                            type="file"
                                            multiple
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 rounded-lg border border-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddPG}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                    >
                                        Add PG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete {selectedPG?.name}? This action cannot be undone.</p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 rounded-lg border border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeletePG}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View PG Modal */}
                {isViewModalOpen && selectedPG && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedPG.name}</h3>
                                    <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {selectedPG.images.map((image, index) => (
                                        <img key={index} src={image} alt={selectedPG.name} className="w-full h-48 object-cover rounded-lg" />
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                                        <p className="text-gray-900">{selectedPG.location.name}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                        <p className="text-gray-900">{selectedPG.address}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Price</h4>
                                        <p className="text-green-600 font-bold">₹{selectedPG.price.toLocaleString()}/month</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                                        <p className="text-gray-900">{selectedPG.gender}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Amenities</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedPG.amenities.map((amenity, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePGs;
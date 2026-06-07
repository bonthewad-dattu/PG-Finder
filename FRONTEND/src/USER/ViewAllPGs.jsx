import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import axiosInstance from '../AuthPages/axiosConfig';
import { toast } from 'react-toastify';

const ViewAllPGs = () => {
    const [activeTab, setActiveTab] = useState('viewPGs');
    const [pgs, setPGs] = useState([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPG, setSelectedPG] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All'); // Added gender filter state

    // Fetch PGs from the API when the component mounts
    useEffect(() => {
        axiosInstance.get('/all/pgs')
            .then(response => {
                // Process the API response to handle amenities and image URLs
                const processedPGs = response.data.pgs.map(pg => ({
                    ...pg,
                    // Handle amenities: check if it's an array or needs parsing
                    amenities: Array.isArray(pg.amenities)
                        ? pg.amenities
                        : typeof pg.amenities[0] === 'string'
                            ? JSON.parse(pg.amenities[0])
                            : pg.amenities,
                    images: pg.images.map(image => `http://localhost:8080/hostels/${image}`)
                }));
                setPGs(processedPGs);
            })
            .catch(error => {
                console.error("Error fetching PGs: ", error);
            });
    }, []);

    // Get unique locations and genders for filters
    const locations = ['All', ...new Set(pgs.map(pg => pg.location.name))];
    const genders = ['All', ...new Set(pgs.map(pg => pg.gender))];

    // Filter PGs based on search term and filters
    const filteredPGs = pgs.filter(pg => {
        const matchesSearch = pg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pg.location.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || pg.status === statusFilter;
        const matchesLocation = locationFilter === 'All' || pg.location.name === locationFilter;
        const matchesGender = genderFilter === 'All' || pg.gender === genderFilter;
        return matchesSearch && matchesStatus && matchesLocation && matchesGender;
    });

    // Open view modal with PG data
    const openViewModal = (pg) => {
        setSelectedPG(pg);
        setIsViewModalOpen(true);
    };

    // Handle booking request
    const handleBooking = (pg) => {
        // Retrieve the token from localStorage
        const token = JSON.parse(localStorage.getItem('UserData')).token;

        if (!token) {
            console.error("User is not authenticated");
            return; // Optionally, show an error message or redirect the user to login
        }

        axiosInstance.post(`/user/bookings/${pg.id}`, {
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Add the token to the Authorization header
            }
        })
            .then(response => {
                console.log("Booking created successfully:", response.data);
                toast.success("Booking created successfully")
                // Optionally, update the UI to reflect the booking status
            })
            .catch(error => {
                console.error("Error creating booking:", error);
            });
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
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">View All PGs</h2>
                        <p className="text-sm text-gray-500 mt-1">Browse all PG accommodations</p>
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
                                placeholder="Search PGs..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Location:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    {locations.map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Gender:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={genderFilter}
                                    onChange={(e) => setGenderFilter(e.target.value)}
                                >
                                    {genders.map((gender, index) => (
                                        <option key={index} value={gender}>{gender}</option>
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
                                    <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{pg.name}</h3>
                                        <span className="bg-green-100 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                                            {pg.rating} ★
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{pg.location.name}</p>
                                    <p className="text-gray-600 mb-3">For: {pg.gender}</p>

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
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pg.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                                        <button
                                            onClick={() => handleBooking(pg)}
                                            className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                                        >
                                            Book
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
                    </div>
                )}

                {/* View PG Modal */}
                {isViewModalOpen && selectedPG && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-2xl">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">{selectedPG.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedPG.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedPG.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="text-gray-900">{selectedPG.location.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="text-gray-900">₹{selectedPG.price.toLocaleString()}/month</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="text-gray-900">{selectedPG.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Rating</p>
                                        <p className="text-gray-900">{selectedPG.rating} ★</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Occupancy</p>
                                        <p className="text-gray-900">{selectedPG.occupied} / {selectedPG.capacity}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Amenities</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedPG.amenities.map((amenity, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-48 overflow-hidden rounded-lg">
                                    <img src={selectedPG.images[0]} alt={selectedPG.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
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

export default ViewAllPGs;

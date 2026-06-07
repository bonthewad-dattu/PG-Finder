import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthPages/AuthProvider";
import RegisterPage from "./AuthPages/RegisterPage";
import PrivateRoute from "./AuthPages/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./LandingPage";
import AuthPage from "./AuthPages/RegisterPage";
import AdminDashboard from "./Admin/AdminDashboard";
import ManageLocations from "./Admin/ManageLocations";
import ManagePGs from "./Admin/ManagePG";
import ViewAllPGs from "./USER/ViewAllPGs";
import ViewBookings from "./USER/ViewBookings";
import ManageBookings from "./Admin/ManageBookings";
import ProfilePage from "./USER/ProfilePage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Pages */}
          <Route path="/signup" element={<AuthPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/manage-locations"
            element={
              <PrivateRoute>
                <ManageLocations />
              </PrivateRoute>
            }
          />


          <Route
            path="/admin/manage-pgs"
            element={
              <PrivateRoute>
                <ManagePGs />
              </PrivateRoute>
            }
          />


          <Route
            path="/admin/view-bookings"
            element={
              <PrivateRoute>
                <ManageBookings />
              </PrivateRoute>
            }
          />


          <Route
            path="/user/view-pgs"
            element={
              <PrivateRoute>
                <ViewAllPGs />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/booking-history"
            element={
              <PrivateRoute>
                <ViewBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />


        </Routes>

        {/* Toast Notification container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;

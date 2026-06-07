package com.project.pgFinder.controller;

import com.project.pgFinder.entity.Location;
import com.project.pgFinder.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api")
public class LocationController {

    @Autowired
    private LocationService locationService;

    // Open to all (for user selection)
    @GetMapping("/get/locations")
    public ResponseEntity<?> getAllLocations() {
        HashMap<String, Object> res = new HashMap<>();
        try {
            List<Location> locations = locationService.getAllLocations();
            res.put("success", true);
            res.put("locations", locations);
            return ResponseEntity.ok(res); // Returns 200 OK with locations
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", "Failed to fetch the locations: " + e.getMessage());
            return ResponseEntity.status(500).body(res); // Returns 500 with error message
        }
    }

    // Admin only - Add a new location
    @PostMapping("/admin/locations")
    public ResponseEntity<?> addLocation(@RequestBody Location location) {
        HashMap<String, Object> res = new HashMap<>();
        try {
            if (location.getName() == null || location.getName().trim().isEmpty()) {
                res.put("success", false);
                res.put("error", "Location name cannot be empty");
                return ResponseEntity.status(400).body(res); // Returns 400 for bad request
            }
            locationService.addLocation(location);
            res.put("success", true);
            res.put("msg", "Location added successfully");
            return ResponseEntity.status(201).body(res); // Returns 201 (Created)
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", "Failed to add location: " + e.getMessage());
            return ResponseEntity.status(500).body(res); // Returns 500 on error
        }
    }

    // Admin only - Update an existing location
    @PutMapping("/admin/locations/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @RequestBody Location location) {
        HashMap<String, Object> res = new HashMap<>();
        try {
            Location updatedLocation = locationService.updateLocation(id, location);
            if (updatedLocation == null) {
                res.put("success", false);
                res.put("error", "Location not found");
                return ResponseEntity.status(404).body(res); // Returns 404 if location not found
            }
            res.put("success", true);
            res.put("msg", "Location updated successfully");
            return ResponseEntity.ok(res); // Returns 200 OK
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", "Failed to update location: " + e.getMessage());
            return ResponseEntity.status(500).body(res); // Returns 500 on error
        }
    }

    // Admin only - Delete a location
    @DeleteMapping("/admin/locations/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id) {
        HashMap<String, Object> res = new HashMap<>();
        try {
            locationService.deleteLocation(id);
            res.put("success", true);
            res.put("msg", "Location deleted successfully");
            return ResponseEntity.ok(res); // Returns 200 OK
        } catch (Exception e) {
            res.put("success", false);
            res.put("error", "Failed to delete location: " + e.getMessage());
            return ResponseEntity.status(500).body(res); // Returns 500 on error
        }
    }
}

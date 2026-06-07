package com.project.pgFinder.service;

import com.project.pgFinder.entity.Location;
import com.project.pgFinder.repository.ILocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    @Autowired
    private ILocationRepository locationRepository;

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location addLocation(Location location) {
        return locationRepository.save(location);
    }

    public Location updateLocation(Long id, Location updatedLocation)
    {
        Optional<Location> existing = locationRepository.findById(id);
        if (existing.isPresent()) {
            Location loc = existing.get();
            loc.setName(updatedLocation.getName());
            return locationRepository.save(loc);
        }
        throw new RuntimeException("Location not found");
    }

    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }
}

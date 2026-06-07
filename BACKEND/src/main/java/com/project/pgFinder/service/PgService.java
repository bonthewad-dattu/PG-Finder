package com.project.pgFinder.service;

import com.project.pgFinder.entity.Location;
import com.project.pgFinder.entity.PG;
import com.project.pgFinder.repository.ILocationRepository;
import com.project.pgFinder.repository.IPgRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PgService {

    @Autowired
    private IPgRepository pgRepository;

    @Autowired
    private ILocationRepository locationRepository;

    public List<PG> getPgsByLocation(Long locationId) {
        Optional<Location> location = locationRepository.findById(locationId);
        if (location.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        return pgRepository.findByLocation(location.get());
    }

    public List<PG> getPgsByLocationWithFilters(Long locationId, String gender, Double minPrice, Double maxPrice) {
        Optional<Location> location = locationRepository.findById(locationId);
        if (location.isEmpty()) {
            throw new RuntimeException("Location not found");
        }
        return pgRepository.findByFilters(location.get(), gender, minPrice, maxPrice);
    }

    public void addPg(PG pg) {
        pgRepository.save(pg);
    }

    public PG updatePg(Long id, PG updatedPg) {
        Optional<PG> existing = pgRepository.findById(id);
        if (existing.isPresent()) {
            PG p = existing.get();
            p.setName(updatedPg.getName());
            p.setLocation(updatedPg.getLocation());
            p.setGender(updatedPg.getGender());
            p.setPrice(updatedPg.getPrice());
            return pgRepository.save(p);
        }
        throw new RuntimeException("PG not found");
    }

    public void deletePg(Long id) {
        pgRepository.deleteById(id);
    }

    public List<PG> getAllPgs()
    {
        return pgRepository.findAll();
    }
}

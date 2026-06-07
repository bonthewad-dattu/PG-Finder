package com.project.pgFinder.controller;

import com.project.pgFinder.entity.Location;
import com.project.pgFinder.entity.PG;
import com.project.pgFinder.repository.ILocationRepository;
import com.project.pgFinder.service.PgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PgController {

    @Autowired
    private PgService pgService;

    @Autowired
    private ILocationRepository locationRepository;

    // User: View PGs by location without filters (GET /api/user/pgs/{locationId})
    @GetMapping("/user/pgs/{locationId}")
    public List<PG> getAllPgsByLocation(@PathVariable Long locationId) {
        return pgService.getPgsByLocation(locationId);
    }

    // User: View PGs by location with optional filters (GET /api/user/pgs/{locationId}/filter)
    @GetMapping("/user/pgs/{locationId}/filter")
    public List<PG> getPgsByLocationWithFilters(@PathVariable Long locationId,
                                                @RequestParam(required = false) String gender,
                                                @RequestParam(required = false) Double minPrice,
                                                @RequestParam(required = false) Double maxPrice) {
        return pgService.getPgsByLocationWithFilters(locationId, gender, minPrice, maxPrice);
    }

    @GetMapping("/all/pgs")
    public ResponseEntity<?> getAllPgs(){
        HashMap<String,Object> res = new HashMap<>();
        try
        {
            List<PG> pgs = pgService.getAllPgs();
            res.put("success",true);
            res.put("pgs",pgs);
            return ResponseEntity.ok(res);
        }
        catch (Exception e){
            res.put("success",false);
            res.put("error","Failed to fetch the pgs");
            return ResponseEntity.status(500).body(res);
        }
    }

    @PostMapping("/admin/pgs")
    public ResponseEntity<?> addPg(@RequestParam("images") MultipartFile[] images,  // Accept multiple images
                                   @RequestParam("name") String name,
                                   @RequestParam("locationId") Long locationId,
                                   @RequestParam("gender") String gender,
                                   @RequestParam("price") Double price,
                                   @RequestParam("address") String address,
                                   @RequestParam("amenities") List<String> amenities) {
        try {
            // List to store image filenames
            List<String> imageNames = new ArrayList<>();

            // Save each image and store their names
            String filepath = Paths.get("").toAbsolutePath().toString();
            for (MultipartFile image : images) {
                // Generate unique filename for each image
                String filename = image.getOriginalFilename();
                Path path = Paths.get(filepath, "src", "main", "resources", "static", "hostels", filename);
                image.transferTo(path);
                imageNames.add(filename);  // Add filename to the list
            }

            // Prepare PG entity
            Location location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            PG pg = new PG(null, name, location, gender, price, address, amenities, imageNames);  // Add list of images

            pgService.addPg(pg);
            return ResponseEntity.ok("PG added successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading images or adding PG: " + e.getMessage());
        }
    }

    // Admin: Update PG
    @PutMapping("/admin/pgs/{id}")
    public PG updatePg(@PathVariable Long id, @RequestBody PG pg) {
        return pgService.updatePg(id, pg);
    }

    // Admin: Delete PG
    @DeleteMapping("/admin/pgs/{id}")
    public ResponseEntity<?> deletePg(@PathVariable Long id) {
        pgService.deletePg(id);
        return ResponseEntity.ok("Deleted");
    }
}

package com.project.pgFinder.dto;

import com.project.pgFinder.entity.Location;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PgDto
{
    private String name;
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    private String gender;
    private double price;
    private String address;
    private List<String> amenities;
    private List<MultipartFile> images;
}

package com.project.pgFinder.repository;

import com.project.pgFinder.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ILocationRepository extends JpaRepository<Location,Long> {
}

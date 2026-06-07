package com.project.pgFinder.repository;

import com.project.pgFinder.entity.Location;
import com.project.pgFinder.entity.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPgRepository extends JpaRepository<PG,Long>
{
    List<PG> findByLocation(Location location);

    @Query(value = "SELECT p FROM PG p WHERE (:gender IS NULL OR p.gender = :gender) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND p.location = :location",nativeQuery = true)
    List<PG> findByFilters(@Param("location") Location location,
                           @Param("gender") String gender,
                           @Param("minPrice") Double minPrice,
                           @Param("maxPrice") Double maxPrice);
}

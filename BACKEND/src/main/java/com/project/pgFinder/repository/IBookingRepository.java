package com.project.pgFinder.repository;

import com.project.pgFinder.entity.Booking;
import com.project.pgFinder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IBookingRepository extends JpaRepository<Booking,Long>
{
    List<Booking> findByUser(User user);
}

package com.project.pgFinder.service;

import com.project.pgFinder.entity.Booking;
import com.project.pgFinder.entity.PG;
import com.project.pgFinder.entity.User;
import com.project.pgFinder.repository.IBookingRepository;
import com.project.pgFinder.repository.IPgRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private IBookingRepository bookingRepository;

    @Autowired
    private IPgRepository pgRepository;

    @Autowired
    private UserService userService;

    public Booking bookPg(Long pgId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // Now returns email
        User user = (User) userService.loadUserByUsername(email);

        Optional<PG> pg = pgRepository.findById(pgId);
        if (pg.isEmpty()) {
            throw new RuntimeException("PG not found");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPg(pg.get());
        booking.setBookingDate(new Date());
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = (User) userService.loadUserByUsername(email);
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> findById(Long bookingId) {
        return bookingRepository.findById(bookingId);
    }

    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
}

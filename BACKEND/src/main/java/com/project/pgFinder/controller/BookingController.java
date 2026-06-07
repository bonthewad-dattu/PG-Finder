package com.project.pgFinder.controller;

import com.project.pgFinder.entity.Booking;
import com.project.pgFinder.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/api/user/bookings/{pgId}")
    public Booking bookPg(@PathVariable Long pgId) {
        return bookingService.bookPg(pgId);
    }

    @GetMapping("/api/user/bookings")
    public List<Booking> getUserBookings() {
        return bookingService.getUserBookings();
    }

    @GetMapping("/api/admin/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/api/admin/update/{bookingId}")
    public ResponseEntity<?> updateStatus(@PathVariable Long bookingId,@RequestParam String status)
    {
        HashMap<String,Object> res = new HashMap<>();
        try
        {
            Optional<Booking> booking = bookingService.findById(bookingId);
            if (booking.isEmpty()){
                res.put("success",false);
                res.put("error","Failed to fetch the booking");
                return ResponseEntity.status(404).body(res);
            }
            booking.get().setStatus(status);
            bookingService.updateBooking(booking.get());
            res.put("success",true);
            res.put("msg","booking status updated successfully");
            return ResponseEntity.status(200).body(res);
        }
        catch (Exception e){
            res.put("success",false);
            res.put("error","Failed to update the booking status");
            return ResponseEntity.status(500).body(res);
        }
    }
}

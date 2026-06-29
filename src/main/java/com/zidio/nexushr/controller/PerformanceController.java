package com.zidio.nexushr.controller;

import com.zidio.nexushr.dto.PerformanceDTO;
import com.zidio.nexushr.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Page<PerformanceDTO>> getAllReviews(Pageable pageable) {
        return ResponseEntity.ok(performanceService.getAllReviews(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<PerformanceDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getReviewById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceDTO>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(performanceService.getReviewsByEmployee(employeeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<PerformanceDTO> createReview(@RequestBody PerformanceDTO dto) {
        return ResponseEntity.ok(performanceService.createReview(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<PerformanceDTO> updateReview(@PathVariable Long id, @RequestBody PerformanceDTO dto) {
        return ResponseEntity.ok(performanceService.updateReview(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        performanceService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}

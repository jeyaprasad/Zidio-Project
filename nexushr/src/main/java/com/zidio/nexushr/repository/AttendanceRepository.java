package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Attendance;
import com.zidio.nexushr.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployee(Employee employee);
    List<Attendance> findByEmployeeAndDateBetween(Employee employee, LocalDate start, LocalDate end);
    Optional<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    long countByDateAndStatus(LocalDate date, Attendance.AttendanceStatus status);
}

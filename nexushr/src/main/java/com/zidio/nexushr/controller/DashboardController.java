package com.zidio.nexushr.controller;

import com.zidio.nexushr.entity.Attendance;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.repository.AttendanceRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(Employee.EmploymentStatus.ACTIVE);
        long presentToday = attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.ABSENT);

        return ResponseEntity.ok(Map.of(
                "totalEmployees", totalEmployees,
                "activeEmployees", activeEmployees,
                "presentToday", presentToday,
                "absentToday", absentToday
        ));
    }
}

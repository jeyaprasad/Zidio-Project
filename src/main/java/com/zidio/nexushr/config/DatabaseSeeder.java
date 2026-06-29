package com.zidio.nexushr.config;

import com.zidio.nexushr.entity.*;
import com.zidio.nexushr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Seeding default database records...");

            // 1. Create Users
            User adminUser = User.builder()
                    .email("admin@nexushr.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Admin User")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            User hrUser = User.builder()
                    .email("hr@nexushr.com")
                    .password(passwordEncoder.encode("hr123"))
                    .fullName("HR Manager")
                    .role(Role.HR)
                    .enabled(true)
                    .build();

            User managerUser = User.builder()
                    .email("manager@nexushr.com")
                    .password(passwordEncoder.encode("manager123"))
                    .fullName("Line Manager")
                    .role(Role.MANAGER)
                    .enabled(true)
                    .build();

            User employeeUser = User.builder()
                    .email("employee@nexushr.com")
                    .password(passwordEncoder.encode("employee123"))
                    .fullName("Jane Doe")
                    .role(Role.EMPLOYEE)
                    .enabled(true)
                    .build();

            userRepository.saveAll(List.of(adminUser, hrUser, managerUser, employeeUser));

            // 2. Create Employees
            Employee empAdmin = Employee.builder()
                    .employeeId("EMP001")
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@nexushr.com")
                    .phone("1234567890")
                    .department("Administration")
                    .position("System Administrator")
                    .hireDate(LocalDate.now().minusYears(3))
                    .salary(BigDecimal.valueOf(120000))
                    .leaveBalance(30)
                    .status(Employee.EmploymentStatus.ACTIVE)
                    .user(adminUser)
                    .build();

            Employee empHr = Employee.builder()
                    .employeeId("EMP002")
                    .firstName("HR")
                    .lastName("Manager")
                    .email("hr@nexushr.com")
                    .phone("1234567891")
                    .department("Human Resources")
                    .position("HR Director")
                    .hireDate(LocalDate.now().minusYears(2))
                    .salary(BigDecimal.valueOf(95000))
                    .leaveBalance(30)
                    .status(Employee.EmploymentStatus.ACTIVE)
                    .user(hrUser)
                    .build();

            Employee empManager = Employee.builder()
                    .employeeId("EMP003")
                    .firstName("Line")
                    .lastName("Manager")
                    .email("manager@nexushr.com")
                    .phone("1234567892")
                    .department("Engineering")
                    .position("Engineering Manager")
                    .hireDate(LocalDate.now().minusYears(2))
                    .salary(BigDecimal.valueOf(110000))
                    .leaveBalance(30)
                    .status(Employee.EmploymentStatus.ACTIVE)
                    .user(managerUser)
                    .build();

            Employee empJane = Employee.builder()
                    .employeeId("EMP004")
                    .firstName("Jane")
                    .lastName("Doe")
                    .email("employee@nexushr.com")
                    .phone("1234567893")
                    .department("Engineering")
                    .position("Lead Engineer")
                    .hireDate(LocalDate.now().minusYears(1))
                    .salary(BigDecimal.valueOf(85000))
                    .leaveBalance(30)
                    .status(Employee.EmploymentStatus.ACTIVE)
                    .user(employeeUser)
                    .build();

            employeeRepository.saveAll(List.of(empAdmin, empHr, empManager, empJane));

            // 3. Create Attendance Records
            Attendance att1 = Attendance.builder()
                    .employee(empJane)
                    .date(LocalDate.now())
                    .checkIn(LocalTime.of(9, 0))
                    .status(Attendance.AttendanceStatus.PRESENT)
                    .notes("Checked in on time")
                    .build();

            Attendance att2 = Attendance.builder()
                    .employee(empManager)
                    .date(LocalDate.now())
                    .checkIn(LocalTime.of(8, 45))
                    .status(Attendance.AttendanceStatus.PRESENT)
                    .notes("Checked in early")
                    .build();

            attendanceRepository.saveAll(List.of(att1, att2));

            // 4. Create Leaves
            Leave leave1 = Leave.builder()
                    .employee(empJane)
                    .startDate(LocalDate.now().plusWeeks(1))
                    .endDate(LocalDate.now().plusWeeks(1).plusDays(2))
                    .leaveType("CASUAL")
                    .status(Leave.LeaveStatus.PENDING)
                    .reason("Family event")
                    .build();

            Leave leave2 = Leave.builder()
                    .employee(empManager)
                    .startDate(LocalDate.now().minusMonths(1))
                    .endDate(LocalDate.now().minusMonths(1).plusDays(4))
                    .leaveType("SICK")
                    .status(Leave.LeaveStatus.APPROVED)
                    .reason("Medical rest")
                    .build();

            leaveRepository.saveAll(List.of(leave1, leave2));

            // 5. Create Performance Reviews
            PerformanceReview review = PerformanceReview.builder()
                    .employee(empJane)
                    .reviewer(empManager)
                    .reviewDate(LocalDate.now().minusDays(5))
                    .rating(4)
                    .feedback("Jane is doing an outstanding job leading the engineering team. Her technical skills are top-tier.")
                    .goals("Expand cloud architecture knowledge and mentor junior engineers.")
                    .status(PerformanceReview.ReviewStatus.COMPLETED)
                    .sentiment("POSITIVE")
                    .build();

            performanceReviewRepository.save(review);

            log.info("Database seeding complete.");
        }
    }
}

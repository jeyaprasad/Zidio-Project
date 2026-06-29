package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.PayrollDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayrollScheduler {

    private final EmployeeRepository employeeRepository;
    private final PayrollService payrollService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // Run on the 28th of every month at 1:00 AM
    @Scheduled(cron = "0 0 1 28 * ?")
    public void runMonthlyPayroll() {
        log.info("Starting automated monthly payroll run...");
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmploymentStatus.ACTIVE);
        int successCount = 0;

        for (Employee employee : activeEmployees) {
            try {
                String payPeriod = LocalDate.now().getMonth().name() + " " + LocalDate.now().getYear();

                PayrollDTO dto = PayrollDTO.builder()
                        .employeeId(employee.getId())
                        .payPeriod(payPeriod)
                        // basicSalary null → PayrollService will use employee.getSalary()
                        .build();

                PayrollDTO result = payrollService.createPayroll(dto);
                successCount++;
                log.info("Payroll generated for employee ID: {} — Net: {}", employee.getId(), result.getNetSalary());

                if (employee.getUser() != null) {
                    try {
                        notificationService.createNotification(com.zidio.nexushr.dto.NotificationDTO.builder()
                                .userId(employee.getUser().getId())
                                .title("Payslip Generated")
                                .message("Your payslip for " + payPeriod + " has been generated. Net Salary: $" + result.getNetSalary() + ".")
                                .type("SUCCESS")
                                .build());
                    } catch (Exception ex) {
                        log.error("Failed to send WebSocket notification for payroll", ex);
                    }
                }

                // ─── F-07: Send payslip notification email ────────────────────
                if (employee.getEmail() != null && !employee.getEmail().isEmpty()) {
                    emailService.sendEmail(
                        employee.getEmail(),
                        "Your Payslip for " + payPeriod + " is Ready",
                        "Dear " + employee.getFirstName() + ",\n\n"
                        + "Your payslip for " + payPeriod + " has been generated.\n\n"
                        + "  Basic Salary:  $" + result.getBasicSalary() + "\n"
                        + "  Allowances:    $" + (result.getAllowances() != null ? result.getAllowances() : "0.00") + "\n"
                        + "  Tax Deducted:  $" + (result.getTaxAmount() != null ? result.getTaxAmount() : "0.00") + "\n"
                        + "  Other Deducts: $" + (result.getDeductions() != null ? result.getDeductions() : "0.00") + "\n"
                        + "  NET SALARY:    $" + result.getNetSalary() + "\n\n"
                        + "Log in to NexusHR to download your full payslip PDF.\n\n"
                        + "Regards,\nNexusHR Payroll System"
                    );
                }
            } catch (Exception e) {
                log.error("Failed to generate payroll for employee ID: {}", employee.getId(), e);
            }
        }
        log.info("Monthly payroll run complete. Processed {}/{} employees successfully.", successCount, activeEmployees.size());
    }
}

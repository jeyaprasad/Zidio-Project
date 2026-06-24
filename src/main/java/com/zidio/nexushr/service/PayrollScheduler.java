package com.zidio.nexushr.service;

import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayrollScheduler {

    private final EmployeeRepository employeeRepository;
    private final PayrollService payrollService;

    // Run on the 28th of every month at 1:00 AM
    @Scheduled(cron = "0 0 1 28 * ?")
    public void runMonthlyPayroll() {
        log.info("Starting automated monthly payroll run...");
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmploymentStatus.ACTIVE);
        
        for (Employee employee : activeEmployees) {
            try {
                com.zidio.nexushr.dto.PayrollDTO dto = com.zidio.nexushr.dto.PayrollDTO.builder()
                        .employeeId(employee.getId())
                        .payPeriod(java.time.LocalDate.now().getMonth().name() + " " + java.time.LocalDate.now().getYear())
                        .basicSalary(employee.getSalary())
                        .build();
                payrollService.createPayroll(dto);
                log.info("Successfully generated payroll for employee ID: {}", employee.getId());
            } catch (Exception e) {
                log.error("Failed to generate payroll for employee ID: {}", employee.getId(), e);
            }
        }
        log.info("Automated monthly payroll run complete. Processed {} employees.", activeEmployees.size());
    }
}

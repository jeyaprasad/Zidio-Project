package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.PayrollDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Payroll;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PayrollServiceTest {

    @Mock
    private PayrollRepository payrollRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private PayrollService payrollService;

    private Employee employee;
    private PayrollDTO payrollDTO;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Jane");
        employee.setLastName("Smith");
        employee.setSalary(BigDecimal.valueOf(5000));

        payrollDTO = new PayrollDTO();
        payrollDTO.setEmployeeId(1L);
        payrollDTO.setPayPeriod("June 2026");
        payrollDTO.setBasicSalary(BigDecimal.valueOf(5000));
        payrollDTO.setAllowances(BigDecimal.valueOf(500));
        payrollDTO.setDeductions(BigDecimal.valueOf(200));
        payrollDTO.setPayDate(LocalDate.now());
    }

    @Test
    void testCreatePayroll_NetSalaryCalculation() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(payrollRepository.save(any(Payroll.class))).thenAnswer(invocation -> {
            Payroll saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        PayrollDTO result = payrollService.createPayroll(payrollDTO);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        // Net salary should be: 5000 + 500 - 200 = 5300
        assertEquals(BigDecimal.valueOf(5300), result.getNetSalary());
        assertEquals("PENDING", result.getStatus());
        verify(payrollRepository, times(1)).save(any(Payroll.class));
    }
}

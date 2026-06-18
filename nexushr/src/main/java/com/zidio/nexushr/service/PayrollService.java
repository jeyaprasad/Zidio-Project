package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.PayrollDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Payroll;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public List<PayrollDTO> getAllPayrolls() {
        return payrollRepository.findAll().stream()
                .map(PayrollDTO::fromEntity)
                .toList();
    }

    public PayrollDTO getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));
        return PayrollDTO.fromEntity(payroll);
    }

    public List<PayrollDTO> getPayrollByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return payrollRepository.findByEmployee(employee).stream()
                .map(PayrollDTO::fromEntity)
                .toList();
    }

    public PayrollDTO createPayroll(PayrollDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriod(dto.getPayPeriod())
                .basicSalary(dto.getBasicSalary())
                .allowances(dto.getAllowances())
                .deductions(dto.getDeductions())
                .netSalary(dto.getNetSalary())
                .payDate(dto.getPayDate())
                .status(Payroll.PayrollStatus.PENDING)
                .build();

        return PayrollDTO.fromEntity(payrollRepository.save(payroll));
    }

    public PayrollDTO updatePayroll(Long id, PayrollDTO dto) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));

        payroll.setPayPeriod(dto.getPayPeriod());
        payroll.setBasicSalary(dto.getBasicSalary());
        payroll.setAllowances(dto.getAllowances());
        payroll.setDeductions(dto.getDeductions());
        payroll.setNetSalary(dto.getNetSalary());
        payroll.setPayDate(dto.getPayDate());
        if (dto.getStatus() != null) {
            payroll.setStatus(Payroll.PayrollStatus.valueOf(dto.getStatus()));
        }

        return PayrollDTO.fromEntity(payrollRepository.save(payroll));
    }

    public void deletePayroll(Long id) {
        if (!payrollRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payroll", "id", id);
        }
        payrollRepository.deleteById(id);
    }
}

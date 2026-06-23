package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.PayrollDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Payroll;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    private BigDecimal calculateNetSalary(BigDecimal basic, BigDecimal allowances, BigDecimal deductions) {
        BigDecimal b = basic != null ? basic : BigDecimal.ZERO;
        BigDecimal a = allowances != null ? allowances : BigDecimal.ZERO;
        BigDecimal d = deductions != null ? deductions : BigDecimal.ZERO;
        return b.add(a).subtract(d);
    }

    public Page<PayrollDTO> getAllPayrolls(Pageable pageable) {
        return payrollRepository.findAll(pageable).map(PayrollDTO::fromEntity);
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

        BigDecimal calculatedNet = calculateNetSalary(dto.getBasicSalary(), dto.getAllowances(), dto.getDeductions());

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriod(dto.getPayPeriod())
                .basicSalary(dto.getBasicSalary())
                .allowances(dto.getAllowances())
                .deductions(dto.getDeductions())
                .netSalary(calculatedNet)
                .payDate(dto.getPayDate())
                .status(Payroll.PayrollStatus.PENDING)
                .build();

        return PayrollDTO.fromEntity(payrollRepository.save(payroll));
    }

    public PayrollDTO updatePayroll(Long id, PayrollDTO dto) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));

        BigDecimal calculatedNet = calculateNetSalary(dto.getBasicSalary(), dto.getAllowances(), dto.getDeductions());

        payroll.setPayPeriod(dto.getPayPeriod());
        payroll.setBasicSalary(dto.getBasicSalary());
        payroll.setAllowances(dto.getAllowances());
        payroll.setDeductions(dto.getDeductions());
        payroll.setNetSalary(calculatedNet);
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

    public byte[] generatePayslipPdf(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));
        Employee employee = payroll.getEmployee();

        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        com.lowagie.text.Document document = new com.lowagie.text.Document();
        try {
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            // Metadata
            document.addTitle("NexusHR Payslip");
            document.addAuthor("NexusHR Enterprise");

            // Title
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("NEXUSHR ENTERPRISE PAYSLIP", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Subtitle
            com.lowagie.text.Font subFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 10);
            com.lowagie.text.Paragraph subtitle = new com.lowagie.text.Paragraph("Pay Period: " + payroll.getPayPeriod() + " | Date: " + payroll.getPayDate(), subFont);
            subtitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(30);
            document.add(subtitle);

            // Employee Details
            com.lowagie.text.Font boldFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 11);
            com.lowagie.text.Font normalFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 11);

            document.add(new com.lowagie.text.Paragraph("Employee Information:", boldFont));
            document.add(new com.lowagie.text.Paragraph("Name: " + employee.getFirstName() + " " + employee.getLastName(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Employee ID: " + employee.getEmployeeId(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Department: " + employee.getDepartment(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Position: " + employee.getPosition(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Email: " + employee.getEmail(), normalFont));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------------------------------------", normalFont));

            // Salary Details
            document.add(new com.lowagie.text.Paragraph("Earnings & Deductions Summary:", boldFont));
            document.add(new com.lowagie.text.Paragraph("Basic Salary: $" + payroll.getBasicSalary(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Allowances:   $" + (payroll.getAllowances() != null ? payroll.getAllowances() : "0.00"), normalFont));
            document.add(new com.lowagie.text.Paragraph("Deductions:   -$" + (payroll.getDeductions() != null ? payroll.getDeductions() : "0.00"), normalFont));
            document.add(new com.lowagie.text.Paragraph("------------------------------------------------------------------------------------------------", normalFont));

            // Net Salary Highlight
            com.lowagie.text.Font netFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 13);
            com.lowagie.text.Paragraph netSalaryPara = new com.lowagie.text.Paragraph("NET SALARY:   $" + payroll.getNetSalary(), netFont);
            netSalaryPara.setSpacingBefore(10);
            document.add(netSalaryPara);

            // Status
            com.lowagie.text.Paragraph statusPara = new com.lowagie.text.Paragraph("Status:       " + payroll.getStatus(), boldFont);
            statusPara.setSpacingBefore(5);
            document.add(statusPara);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}

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
import java.math.RoundingMode;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Tax Calculation — Progressive Brackets (Annual Income)
    // Bracket thresholds are annual; method receives monthly gross, converts,
    // computes annual tax, then returns monthly tax amount.
    //
    //   0        – 12,000   → 0%
    //   12,001   – 50,000   → 12%
    //   50,001   – 100,000  → 22%
    //   100,001  – 200,000  → 30%
    //   200,001+            → 37%
    // ─────────────────────────────────────────────────────────────────────────
    private BigDecimal calculateMonthlyTax(BigDecimal monthlyGross) {
        if (monthlyGross == null || monthlyGross.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Convert to annual income for bracket matching
        BigDecimal annual = monthlyGross.multiply(BigDecimal.valueOf(12));

        BigDecimal annualTax;
        if (annual.compareTo(BigDecimal.valueOf(12_000)) <= 0) {
            annualTax = BigDecimal.ZERO;
        } else if (annual.compareTo(BigDecimal.valueOf(50_000)) <= 0) {
            annualTax = annual.subtract(BigDecimal.valueOf(12_000))
                    .multiply(BigDecimal.valueOf(0.12));
        } else if (annual.compareTo(BigDecimal.valueOf(100_000)) <= 0) {
            BigDecimal base = BigDecimal.valueOf(50_000 - 12_000).multiply(BigDecimal.valueOf(0.12));
            BigDecimal upper = annual.subtract(BigDecimal.valueOf(50_000)).multiply(BigDecimal.valueOf(0.22));
            annualTax = base.add(upper);
        } else if (annual.compareTo(BigDecimal.valueOf(200_000)) <= 0) {
            BigDecimal base = BigDecimal.valueOf(50_000 - 12_000).multiply(BigDecimal.valueOf(0.12))
                    .add(BigDecimal.valueOf(100_000 - 50_000).multiply(BigDecimal.valueOf(0.22)));
            BigDecimal upper = annual.subtract(BigDecimal.valueOf(100_000)).multiply(BigDecimal.valueOf(0.30));
            annualTax = base.add(upper);
        } else {
            BigDecimal base = BigDecimal.valueOf(50_000 - 12_000).multiply(BigDecimal.valueOf(0.12))
                    .add(BigDecimal.valueOf(100_000 - 50_000).multiply(BigDecimal.valueOf(0.22)))
                    .add(BigDecimal.valueOf(200_000 - 100_000).multiply(BigDecimal.valueOf(0.30)));
            BigDecimal upper = annual.subtract(BigDecimal.valueOf(200_000)).multiply(BigDecimal.valueOf(0.37));
            annualTax = base.add(upper);
        }

        // Return monthly tax (round to 2 decimal places)
        return annualTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateNetSalary(BigDecimal basic, BigDecimal allowances, BigDecimal deductions, BigDecimal tax) {
        BigDecimal b = basic != null ? basic : BigDecimal.ZERO;
        BigDecimal a = allowances != null ? allowances : BigDecimal.ZERO;
        BigDecimal d = deductions != null ? deductions : BigDecimal.ZERO;
        BigDecimal t = tax != null ? tax : BigDecimal.ZERO;
        return b.add(a).subtract(d).subtract(t);
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

        // Use employee's stored salary as basic if not provided
        BigDecimal basic = dto.getBasicSalary() != null
                ? dto.getBasicSalary()
                : (employee.getSalary() != null ? employee.getSalary() : BigDecimal.ZERO);

        BigDecimal allowances = dto.getAllowances() != null ? dto.getAllowances() : BigDecimal.ZERO;
        BigDecimal deductions = dto.getDeductions() != null ? dto.getDeductions() : BigDecimal.ZERO;

        // Automatically compute tax on gross (basic + allowances)
        BigDecimal grossMonthly = basic.add(allowances);
        BigDecimal taxAmount = calculateMonthlyTax(grossMonthly);

        BigDecimal netSalary = calculateNetSalary(basic, allowances, deductions, taxAmount);

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriod(dto.getPayPeriod())
                .basicSalary(basic)
                .allowances(allowances)
                .deductions(deductions)
                .taxAmount(taxAmount)
                .netSalary(netSalary)
                .payDate(dto.getPayDate())
                .status(Payroll.PayrollStatus.PENDING)
                .build();

        return PayrollDTO.fromEntity(payrollRepository.save(payroll));
    }

    public PayrollDTO updatePayroll(Long id, PayrollDTO dto) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));

        BigDecimal basic = dto.getBasicSalary() != null ? dto.getBasicSalary() : payroll.getBasicSalary();
        BigDecimal allowances = dto.getAllowances() != null ? dto.getAllowances() : payroll.getAllowances();
        BigDecimal deductions = dto.getDeductions() != null ? dto.getDeductions() : payroll.getDeductions();

        BigDecimal grossMonthly = basic.add(allowances != null ? allowances : BigDecimal.ZERO);
        BigDecimal taxAmount = calculateMonthlyTax(grossMonthly);

        payroll.setPayPeriod(dto.getPayPeriod());
        payroll.setBasicSalary(basic);
        payroll.setAllowances(allowances);
        payroll.setDeductions(deductions);
        payroll.setTaxAmount(taxAmount);
        payroll.setNetSalary(calculateNetSalary(basic, allowances, deductions, taxAmount));
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

            document.addTitle("NexusHR Payslip");
            document.addAuthor("NexusHR Enterprise");

            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("NEXUSHR ENTERPRISE PAYSLIP", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            com.lowagie.text.Font subFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 10);
            com.lowagie.text.Paragraph subtitle = new com.lowagie.text.Paragraph(
                    "Pay Period: " + payroll.getPayPeriod() + " | Date: " + payroll.getPayDate(), subFont);
            subtitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(30);
            document.add(subtitle);

            com.lowagie.text.Font boldFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 11);
            com.lowagie.text.Font normalFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 11);

            document.add(new com.lowagie.text.Paragraph("Employee Information:", boldFont));
            document.add(new com.lowagie.text.Paragraph("Name: " + employee.getFirstName() + " " + employee.getLastName(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Employee ID: " + employee.getEmployeeId(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Department: " + employee.getDepartment(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Position: " + employee.getPosition(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Email: " + employee.getEmail(), normalFont));
            document.add(new com.lowagie.text.Paragraph("-".repeat(80), normalFont));

            document.add(new com.lowagie.text.Paragraph("Earnings & Deductions Summary:", boldFont));
            document.add(new com.lowagie.text.Paragraph("Basic Salary:   $" + payroll.getBasicSalary(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Allowances:     $" + safeVal(payroll.getAllowances()), normalFont));
            document.add(new com.lowagie.text.Paragraph("Deductions:    -$" + safeVal(payroll.getDeductions()), normalFont));
            document.add(new com.lowagie.text.Paragraph("Tax (Auto):    -$" + safeVal(payroll.getTaxAmount()), normalFont));
            document.add(new com.lowagie.text.Paragraph("-".repeat(80), normalFont));

            com.lowagie.text.Font netFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 13);
            com.lowagie.text.Paragraph netSalaryPara = new com.lowagie.text.Paragraph("NET SALARY:     $" + payroll.getNetSalary(), netFont);
            netSalaryPara.setSpacingBefore(10);
            document.add(netSalaryPara);

            com.lowagie.text.Paragraph statusPara = new com.lowagie.text.Paragraph("Status:         " + payroll.getStatus(), boldFont);
            statusPara.setSpacingBefore(5);
            document.add(statusPara);

            document.close();
        } catch (Exception e) {
            log.error("Error generating payslip pdf", e);
        }

        return out.toByteArray();
    }

    private String safeVal(BigDecimal val) {
        return val != null ? val.toString() : "0.00";
    }
}


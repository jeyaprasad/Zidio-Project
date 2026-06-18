package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Payroll;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String payPeriod;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private LocalDate payDate;
    private String status;

    public static PayrollDTO fromEntity(Payroll payroll) {
        return PayrollDTO.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployee().getId())
                .employeeName(payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName())
                .payPeriod(payroll.getPayPeriod())
                .basicSalary(payroll.getBasicSalary())
                .allowances(payroll.getAllowances())
                .deductions(payroll.getDeductions())
                .netSalary(payroll.getNetSalary())
                .payDate(payroll.getPayDate())
                .status(payroll.getStatus().name())
                .build();
    }
}

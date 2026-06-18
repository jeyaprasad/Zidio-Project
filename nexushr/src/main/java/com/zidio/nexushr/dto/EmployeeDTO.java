package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Employee;
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
public class EmployeeDTO {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String position;
    private LocalDate hireDate;
    private BigDecimal salary;
    private String status;
    private Long userId;

    public static EmployeeDTO fromEntity(Employee emp) {
        return EmployeeDTO.builder()
                .id(emp.getId())
                .employeeId(emp.getEmployeeId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .department(emp.getDepartment())
                .position(emp.getPosition())
                .hireDate(emp.getHireDate())
                .salary(emp.getSalary())
                .status(emp.getStatus().name())
                .userId(emp.getUser() != null ? emp.getUser().getId() : null)
                .build();
    }
}

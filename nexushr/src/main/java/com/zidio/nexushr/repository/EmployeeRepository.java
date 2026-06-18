package com.zidio.nexushr.repository;

import com.zidio.nexushr.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUserId(Long userId);
    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(Employee.EmploymentStatus status);
    long countByStatus(Employee.EmploymentStatus status);
}

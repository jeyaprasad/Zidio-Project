package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.LeaveDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Leave;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private LeaveService leaveService;

    private Employee employee;
    private LeaveDTO leaveDTO;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setLeaveBalance(30);
        employee.setEmail("john.doe@example.com");

        leaveDTO = new LeaveDTO();
        leaveDTO.setEmployeeId(1L);
        leaveDTO.setStartDate(LocalDate.now());
        leaveDTO.setEndDate(LocalDate.now().plusDays(2)); // 3 days
        leaveDTO.setLeaveType("ANNUAL");
        leaveDTO.setReason("Vacation");
    }

    @Test
    void testApplyLeave_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRepository.save(any(Leave.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveDTO result = leaveService.applyLeave(leaveDTO);

        assertNotNull(result);
        assertEquals(Leave.LeaveStatus.PENDING.name(), result.getStatus());
        // Verify balance is NOT deducted at apply time
        assertEquals(30, employee.getLeaveBalance());
        verify(emailService, times(1)).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void testApplyLeave_InsufficientBalance() {
        employee.setLeaveBalance(2);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThrows(IllegalArgumentException.class, () -> leaveService.applyLeave(leaveDTO));
    }

    @Test
    void testUpdateLeaveStatus_Approved() {
        Leave leave = Leave.builder()
                .id(10L)
                .employee(employee)
                .startDate(leaveDTO.getStartDate())
                .endDate(leaveDTO.getEndDate())
                .leaveType(leaveDTO.getLeaveType())
                .status(Leave.LeaveStatus.PENDING)
                .build();

        when(leaveRepository.findById(10L)).thenReturn(Optional.of(leave));
        when(leaveRepository.save(any(Leave.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveDTO result = leaveService.updateLeaveStatus(10L, "APPROVED");

        assertNotNull(result);
        assertEquals("APPROVED", result.getStatus());
        // Verify balance is deducted on approval (30 - 3 = 27)
        assertEquals(27, employee.getLeaveBalance());
        verify(employeeRepository, times(1)).save(employee);
    }
}

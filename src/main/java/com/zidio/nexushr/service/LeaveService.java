package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.LeaveDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.Leave;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public Page<LeaveDTO> getAllLeaves(Pageable pageable) {
        return leaveRepository.findAll(pageable).map(LeaveDTO::fromEntity);
    }

    public LeaveDTO getLeaveById(Long id) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", id));
        return LeaveDTO.fromEntity(leave);
    }

    public List<LeaveDTO> getLeavesByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return leaveRepository.findByEmployee(employee).stream()
                .map(LeaveDTO::fromEntity)
                .toList();
    }

    @Transactional
    public LeaveDTO applyLeave(LeaveDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        long durationDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        if (durationDays <= 0) {
            throw new IllegalArgumentException("Leave start date must be before or equal to end date");
        }

        if (employee.getLeaveBalance() == null) {
            employee.setLeaveBalance(30);
        }

        if (durationDays > employee.getLeaveBalance()) {
            throw new IllegalArgumentException("Insufficient leave balance. Remaining: " 
                    + employee.getLeaveBalance() + " days, Requested: " + durationDays + " days.");
        }

        Leave leave = Leave.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .leaveType(dto.getLeaveType())
                .status(Leave.LeaveStatus.PENDING)
                .reason(dto.getReason())
                .build();

        Leave savedLeave = leaveRepository.save(leave);

        if (employee.getUser() != null) {
            try {
                notificationService.createNotification(com.zidio.nexushr.dto.NotificationDTO.builder()
                        .userId(employee.getUser().getId())
                        .title("Leave Request Submitted")
                        .message("Your leave request for the period " + savedLeave.getStartDate() + " to " + savedLeave.getEndDate() + " (" + durationDays + " days) has been submitted.")
                        .type("INFO")
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to send WebSocket notification: " + e.getMessage());
            }
        }
        
        if (employee.getEmail() != null && !employee.getEmail().isEmpty()) {
            emailService.sendEmail(
                employee.getEmail(),
                "Leave Request Submitted - " + savedLeave.getLeaveType(),
                "Hello " + employee.getFirstName() + ",\n\n" +
                "Your leave request for the period " + savedLeave.getStartDate() + " to " + savedLeave.getEndDate() +
                " (" + durationDays + " days) has been successfully submitted and is currently PENDING review.\n\n" +
                "Reason: " + savedLeave.getReason() + "\n\n" +
                "Regards,\nNexusHR Portal"
            );
        }

        return LeaveDTO.fromEntity(savedLeave);
    }

    @Transactional
    public LeaveDTO updateLeaveStatus(Long id, String statusStr) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", id));

        Leave.LeaveStatus newStatus = Leave.LeaveStatus.valueOf(statusStr.toUpperCase());
        Leave.LeaveStatus oldStatus = leave.getStatus();

        if (oldStatus == newStatus) {
            return LeaveDTO.fromEntity(leave);
        }

        Employee employee = leave.getEmployee();
        long durationDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;

        if (newStatus == Leave.LeaveStatus.APPROVED) {
            if (employee.getLeaveBalance() == null) {
                employee.setLeaveBalance(30);
            }
            if (durationDays > employee.getLeaveBalance()) {
                throw new IllegalArgumentException("Cannot approve leave. Employee has insufficient balance (" 
                        + employee.getLeaveBalance() + " days).");
            }
            employee.setLeaveBalance(employee.getLeaveBalance() - Math.toIntExact(durationDays));
            employeeRepository.save(employee);
        } else if (oldStatus == Leave.LeaveStatus.APPROVED 
                && (newStatus == Leave.LeaveStatus.CANCELLED || newStatus == Leave.LeaveStatus.REJECTED)) {
            if (employee.getLeaveBalance() == null) {
                employee.setLeaveBalance(30);
            }
            employee.setLeaveBalance(employee.getLeaveBalance() + Math.toIntExact(durationDays));
            employeeRepository.save(employee);
        }

        leave.setStatus(newStatus);
        Leave savedLeave = leaveRepository.save(leave);

        if (employee.getUser() != null) {
            try {
                notificationService.createNotification(com.zidio.nexushr.dto.NotificationDTO.builder()
                        .userId(employee.getUser().getId())
                        .title("Leave Request " + newStatus.name())
                        .message("Your leave request for the period " + savedLeave.getStartDate() + " to " + savedLeave.getEndDate() + " has been " + newStatus.name().toLowerCase() + ".")
                        .type(newStatus == Leave.LeaveStatus.APPROVED ? "SUCCESS" : "WARNING")
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to send WebSocket notification: " + e.getMessage());
            }
        }

        if (employee.getEmail() != null && !employee.getEmail().isEmpty()) {
            emailService.sendEmail(
                employee.getEmail(),
                "Leave Request " + newStatus.name() + " - " + savedLeave.getLeaveType(),
                "Hello " + employee.getFirstName() + ",\n\n" +
                "Your leave request for the period " + savedLeave.getStartDate() + " to " + savedLeave.getEndDate() +
                " has been " + newStatus.name() + ".\n\n" +
                "Regards,\nNexusHR Portal"
            );
        }

        return LeaveDTO.fromEntity(savedLeave);
    }

    @Transactional
    public void deleteLeave(Long id) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave", "id", id));

        if (leave.getStatus() == Leave.LeaveStatus.APPROVED) {
            Employee employee = leave.getEmployee();
            long durationDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
            if (employee.getLeaveBalance() == null) {
                employee.setLeaveBalance(30);
            }
            employee.setLeaveBalance(employee.getLeaveBalance() + (int) durationDays);
            employeeRepository.save(employee);
        }

        leaveRepository.delete(leave);
    }
}

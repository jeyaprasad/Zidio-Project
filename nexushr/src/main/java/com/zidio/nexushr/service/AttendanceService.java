package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.AttendanceDTO;
import com.zidio.nexushr.entity.Attendance;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.AttendanceRepository;
import com.zidio.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(AttendanceDTO::fromEntity)
                .toList();
    }

    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        return AttendanceDTO.fromEntity(attendance);
    }

    public List<AttendanceDTO> getAttendanceByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return attendanceRepository.findByEmployee(employee).stream()
                .map(AttendanceDTO::fromEntity)
                .toList();
    }

    public List<AttendanceDTO> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(AttendanceDTO::fromEntity)
                .toList();
    }

    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .checkIn(dto.getCheckIn())
                .checkOut(dto.getCheckOut())
                .status(Attendance.AttendanceStatus.valueOf(dto.getStatus()))
                .notes(dto.getNotes())
                .build();

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));

        attendance.setCheckIn(dto.getCheckIn());
        attendance.setCheckOut(dto.getCheckOut());
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(dto.getStatus()));
        attendance.setNotes(dto.getNotes());

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance", "id", id);
        }
        attendanceRepository.deleteById(id);
    }
}

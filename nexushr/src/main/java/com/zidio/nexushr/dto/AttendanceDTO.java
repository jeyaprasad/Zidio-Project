package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private String status;
    private String notes;

    public static AttendanceDTO fromEntity(Attendance att) {
        return AttendanceDTO.builder()
                .id(att.getId())
                .employeeId(att.getEmployee().getId())
                .employeeName(att.getEmployee().getFirstName() + " " + att.getEmployee().getLastName())
                .date(att.getDate())
                .checkIn(att.getCheckIn())
                .checkOut(att.getCheckOut())
                .status(att.getStatus().name())
                .notes(att.getNotes())
                .build();
    }
}

package com.zidio.nexushr.dto;

import com.zidio.nexushr.entity.PerformanceReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long reviewerId;
    private String reviewerName;
    private LocalDate reviewDate;

    @jakarta.validation.constraints.NotNull(message = "Rating is required")
    @jakarta.validation.constraints.Min(value = 1, message = "Rating must be at least 1")
    @jakarta.validation.constraints.Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String feedback;
    private String goals;
    private String status;
    private String sentiment;

    public static PerformanceDTO fromEntity(PerformanceReview review) {
        return PerformanceDTO.builder()
                .id(review.getId())
                .employeeId(review.getEmployee().getId())
                .employeeName(review.getEmployee().getFirstName() + " " + review.getEmployee().getLastName())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName())
                .reviewDate(review.getReviewDate())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .goals(review.getGoals())
                .status(review.getStatus().name())
                .sentiment(review.getSentiment())
                .build();
    }
}

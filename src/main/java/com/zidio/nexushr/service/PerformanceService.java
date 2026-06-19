package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.PerformanceDTO;
import com.zidio.nexushr.entity.Employee;
import com.zidio.nexushr.entity.PerformanceReview;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.EmployeeRepository;
import com.zidio.nexushr.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;
    private final EmailService emailService;
    private final HuggingFaceService huggingFaceService;

    public List<PerformanceDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(PerformanceDTO::fromEntity)
                .toList();
    }

    public PerformanceDTO getReviewById(Long id) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
        return PerformanceDTO.fromEntity(review);
    }

    public List<PerformanceDTO> getReviewsByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return reviewRepository.findByEmployee(employee).stream()
                .map(PerformanceDTO::fromEntity)
                .toList();
    }

    public PerformanceDTO createReview(PerformanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
        Employee reviewer = employeeRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer", "id", dto.getReviewerId()));

        String sentiment = huggingFaceService.analyzeSentiment(dto.getFeedback());

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(dto.getReviewDate())
                .rating(dto.getRating())
                .feedback(dto.getFeedback())
                .goals(dto.getGoals())
                .sentiment(sentiment)
                .build();

        PerformanceReview savedReview = reviewRepository.save(review);

        if (employee.getEmail() != null && !employee.getEmail().isEmpty()) {
            emailService.sendEmail(
                employee.getEmail(),
                "New Performance Review Published",
                "Hello " + employee.getFirstName() + ",\n\n" +
                "A new performance review has been published for you by reviewer " + reviewer.getFirstName() + " " + reviewer.getLastName() + ".\n\n" +
                "Rating: " + savedReview.getRating() + "/5\n" +
                "Feedback: " + savedReview.getFeedback() + "\n\n" +
                "Regards,\nNexusHR Portal"
            );
        }

        return PerformanceDTO.fromEntity(savedReview);
    }

    public PerformanceDTO updateReview(Long id, PerformanceDTO dto) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));

        review.setReviewDate(dto.getReviewDate());
        review.setRating(dto.getRating());

        if (dto.getFeedback() != null && !dto.getFeedback().equals(review.getFeedback())) {
            review.setFeedback(dto.getFeedback());
            review.setSentiment(huggingFaceService.analyzeSentiment(dto.getFeedback()));
        } else if (dto.getFeedback() != null) {
            review.setFeedback(dto.getFeedback());
        }

        review.setGoals(dto.getGoals());
        if (dto.getStatus() != null) {
            review.setStatus(PerformanceReview.ReviewStatus.valueOf(dto.getStatus()));
        }

        return PerformanceDTO.fromEntity(reviewRepository.save(review));
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("PerformanceReview", "id", id);
        }
        reviewRepository.deleteById(id);
    }
}

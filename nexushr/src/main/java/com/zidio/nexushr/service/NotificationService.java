package com.zidio.nexushr.service;

import com.zidio.nexushr.dto.NotificationDTO;
import com.zidio.nexushr.entity.Notification;
import com.zidio.nexushr.entity.User;
import com.zidio.nexushr.exception.ResourceNotFoundException;
import com.zidio.nexushr.repository.NotificationRepository;
import com.zidio.nexushr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(NotificationDTO::fromEntity)
                .toList();
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user).stream()
                .map(NotificationDTO::fromEntity)
                .toList();
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public NotificationDTO createNotification(NotificationDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getUserId()));

        Notification notification = Notification.builder()
                .user(user)
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(Notification.NotificationType.valueOf(dto.getType()))
                .read(false)
                .build();

        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        List<Notification> unread = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}

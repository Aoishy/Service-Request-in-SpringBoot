package com.aoishy.servicerequest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
    name = "progress_logs",
    indexes = {
        @Index(name = "idx_progress_log_request_id", columnList = "request_id"),
        @Index(name = "idx_progress_log_timestamp", columnList = "timestamp")
    }
)
public class ProgressLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private ServiceRequest request;

    @NotBlank(message = "Stage name is required")
    @Column(nullable = false)
    private String stage;

    @NotBlank(message = "Message is required")
    @Column(nullable = false)
    private String message;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer progress;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
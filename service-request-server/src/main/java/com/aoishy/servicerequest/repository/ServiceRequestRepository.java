package com.aoishy.servicerequest.repository;

import com.aoishy.servicerequest.entity.RequestPriority;
import com.aoishy.servicerequest.entity.RequestStatus;
import com.aoishy.servicerequest.entity.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    // Filter by status
    Page<ServiceRequest> findByStatus(
            RequestStatus status,
            Pageable pageable
    );

    // Filter by priority
    Page<ServiceRequest> findByPriority(
            RequestPriority priority,
            Pageable pageable
    );

    // Filter by submitter (case-insensitive search)
    Page<ServiceRequest> findBySubmittedByContainingIgnoreCase(
            String submittedBy,
            Pageable pageable
    );

    // Filter by status and priority
    Page<ServiceRequest> findByStatusAndPriority(
            RequestStatus status,
            RequestPriority priority,
            Pageable pageable
    );

    // Used for late-joining clients
    List<ServiceRequest> findByStatusInOrderByCreatedAtDesc(
            List<RequestStatus> statuses
    );

    // Search title or description
    Page<ServiceRequest> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description,
            Pageable pageable
    );
}
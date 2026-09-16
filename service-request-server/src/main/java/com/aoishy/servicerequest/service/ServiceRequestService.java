package com.aoishy.servicerequest.service;

import com.aoishy.servicerequest.dto.ListRequestsQuery;
import com.aoishy.servicerequest.entity.ProgressLog;
import com.aoishy.servicerequest.entity.RequestPriority;
import com.aoishy.servicerequest.entity.RequestStatus;
import com.aoishy.servicerequest.entity.ServiceRequest;
import com.aoishy.servicerequest.repository.ProgressLogRepository;
import com.aoishy.servicerequest.repository.ServiceRequestRepository;
import com.aoishy.servicerequest.websocket.WebSocketEventService;
import com.aoishy.servicerequest.worker.RequestProcessor;
import com.aoishy.servicerequest.worker.WorkerPool;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ProgressLogRepository progressLogRepository;
    private final WorkerPool workerPool;
    private final RequestProcessor requestProcessor;
    private final WebSocketEventService webSocketEventService;

    public ServiceRequestService(
            ServiceRequestRepository serviceRequestRepository,
            ProgressLogRepository progressLogRepository,
            WorkerPool workerPool,
            RequestProcessor requestProcessor,
            WebSocketEventService webSocketEventService
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.progressLogRepository = progressLogRepository;
        this.workerPool = workerPool;
        this.requestProcessor = requestProcessor;
        this.webSocketEventService = webSocketEventService;
    }

    // =========================================================
    // CREATE REQUEST
    // =========================================================

    @Transactional
    public ServiceRequest createRequest(
            String title,
            String description,
            RequestPriority priority,
            String submittedBy
    ) {

        ServiceRequest request = new ServiceRequest();

        request.setTitle(title);
        request.setDescription(description);
        request.setPriority(priority);
        request.setSubmittedBy(submittedBy);

        request.setStatus(RequestStatus.PENDING);
        request.setProgress(0);

        LocalDateTime now = LocalDateTime.now();

        request.setCreatedAt(now);
        request.setUpdatedAt(now);

        // Save request to PostgreSQL
        ServiceRequest savedRequest =
                serviceRequestRepository.save(request);

        System.out.println(
                "[Service] Request created: "
                        + savedRequest.getId()
        );

        // Notify connected clients
        webSocketEventService.requestCreated(savedRequest);

        // Start background processing only after the request insert commits.
        Long requestId = savedRequest.getId();
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        workerPool.submit(
                                requestId,
                                () -> requestProcessor.process(requestId)
                        );
                    }
                }
        );

        System.out.println(
                "[Service] Request submitted to WorkerPool: "
                        + savedRequest.getId()
        );

        return savedRequest;
    }

    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    public ServiceRequest getRequestById(Long id) {

        return serviceRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service request '"
                                        + id
                                        + "' not found"
                        )
                );
    }

    // =========================================================
    // LIST REQUESTS
    // =========================================================

    public Page<ServiceRequest> listRequests(
            ListRequestsQuery query
    ) {

        int page =
                Math.max(1, query.getPage());

        int limit =
                Math.min(
                        50,
                        Math.max(1, query.getLimit())
                );

        String sortBy = query.getSortBy();

        // Only allow supported sort fields
        if (!"createdAt".equals(sortBy)
                && !"updatedAt".equals(sortBy)
                && !"priority".equals(sortBy)
                && !"status".equals(sortBy)) {

            sortBy = "createdAt";
        }

        Sort.Direction direction =
                "asc".equalsIgnoreCase(
                        query.getSortOrder()
                )
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable =
                PageRequest.of(
                        page - 1,
                        limit,
                        Sort.by(direction, sortBy)
                );

        // Status + Priority
        if (query.getStatus() != null
                && query.getPriority() != null) {

            return serviceRequestRepository
                    .findByStatusAndPriority(
                            query.getStatus(),
                            query.getPriority(),
                            pageable
                    );
        }

        // Status only
        if (query.getStatus() != null) {

            return serviceRequestRepository
                    .findByStatus(
                            query.getStatus(),
                            pageable
                    );
        }

        // Priority only
        if (query.getPriority() != null) {

            return serviceRequestRepository
                    .findByPriority(
                            query.getPriority(),
                            pageable
                    );
        }

        // Submitted By
        if (query.getSubmittedBy() != null
                && !query.getSubmittedBy().isBlank()) {

            return serviceRequestRepository
                    .findBySubmittedByContainingIgnoreCase(
                            query.getSubmittedBy(),
                            pageable
                    );
        }

        // Search title or description
        if (query.getSearch() != null
                && !query.getSearch().isBlank()) {

            return serviceRequestRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                            query.getSearch(),
                            query.getSearch(),
                            pageable
                    );
        }

        return serviceRequestRepository.findAll(pageable);
    }

    // =========================================================
    // CANCEL REQUEST
    // =========================================================

    @Transactional
    public ServiceRequest cancelRequest(Long id) {

        ServiceRequest request =
                getRequestById(id);

        // Only pending or processing requests
        // can be cancelled.
        if (request.getStatus() != RequestStatus.PENDING
                && request.getStatus() != RequestStatus.PROCESSING) {

            throw new IllegalStateException(
                    "Cannot cancel a request with status '"
                            + request.getStatus()
                            + "'. Only pending or processing "
                            + "requests can be cancelled."
            );
        }

        /*
         * Ask WorkerPool to interrupt the worker.
         *
         * If the request is currently being processed,
         * RequestProcessor will detect the interruption
         * and mark the request as CANCELLED.
         */
        boolean workerCancelled =
                workerPool.cancel(id);

        // If there is no worker currently running,
        // cancel directly.
        if (!workerCancelled) {

            request.setStatus(
                    RequestStatus.CANCELLED
            );

            request.setCompletedAt(
                    LocalDateTime.now()
            );

            request.setUpdatedAt(
                    LocalDateTime.now()
            );

            ServiceRequest savedRequest =
                    serviceRequestRepository.save(request);

            System.out.println(
                    "[Service] Request cancelled directly: "
                            + id
            );

            webSocketEventService.requestCancelled(
                    savedRequest
            );

            return savedRequest;
        }

        /*
         * The worker has been interrupted.
         *
         * RequestProcessor.handleCancellation()
         * will update PostgreSQL and send the
         * WebSocket cancellation event.
         */
        System.out.println(
                "[Service] Cancellation requested for: "
                        + id
        );

        return request;
    }

    // =========================================================
    // GET PROGRESS LOGS
    // =========================================================

    public List<ProgressLog> getProgressLog(Long id) {

        ServiceRequest request =
                getRequestById(id);

        return progressLogRepository
                .findByRequestOrderByTimestampAsc(
                        request
                );
    }

    // =========================================================
    // DELETE REQUEST
    // =========================================================

    @Transactional
    public void deleteRequest(Long id) {

        ServiceRequest request =
                getRequestById(id);

        /*
         * Only completed, failed, or cancelled
         * requests can be deleted.
         */
        if (request.getStatus() != RequestStatus.COMPLETED
                && request.getStatus() != RequestStatus.FAILED
                && request.getStatus() != RequestStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Cannot delete a request with status '"
                            + request.getStatus()
                            + "'. Cancel it first."
            );
        }

        // Delete progress logs first because
        // they reference the service request.
        progressLogRepository.deleteByRequest(
                request
        );

        // Delete the request.
        serviceRequestRepository.delete(
                request
        );

        System.out.println(
                "[Service] Request deleted: "
                        + id
        );
    }
}
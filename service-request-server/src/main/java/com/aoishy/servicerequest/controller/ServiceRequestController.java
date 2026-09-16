package com.aoishy.servicerequest.controller;

import com.aoishy.servicerequest.dto.CreateRequestDto;
import com.aoishy.servicerequest.dto.ListRequestsQuery;
import com.aoishy.servicerequest.entity.ProgressLog;
import com.aoishy.servicerequest.entity.ServiceRequest;
import com.aoishy.servicerequest.service.ServiceRequestService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(
            ServiceRequestService serviceRequestService
    ) {
        this.serviceRequestService = serviceRequestService;
    }

    // =========================================================
    // CREATE REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createRequest(
            @Valid @RequestBody CreateRequestDto data
    ) {

        ServiceRequest request =
                serviceRequestService.createRequest(
                        data.getTitle(),
                        data.getDescription(),
                        data.getPriority(),
                        data.getSubmittedBy()
                );

        return ResponseEntity
                .status(201)
                .body(
                        new ApiResponse(
                                true,
                                new RequestData(request)
                        )
                );
    }

    // =========================================================
    // GET ALL REQUESTS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> listRequests(
            @ModelAttribute ListRequestsQuery query
    ) {

        Page<ServiceRequest> result =
                serviceRequestService.listRequests(query);

        PaginationData pagination =
                new PaginationData(
                        result.getTotalElements(),
                        query.getPage(),
                        query.getLimit(),
                        result.getTotalPages()
                );

        ListData data =
                new ListData(
                        result.getContent(),
                        pagination
                );

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        data
                )
        );
    }

    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequest(
            @PathVariable Long id
    ) {

        ServiceRequest request =
                serviceRequestService.getRequestById(id);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        new RequestData(request)
                )
        );
    }

    // =========================================================
    // CANCEL REQUEST
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Long id
    ) {

        ServiceRequest request =
                serviceRequestService.cancelRequest(id);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        new RequestData(request)
                )
        );
    }

    // =========================================================
    // GET PROGRESS LOG
    // =========================================================

    @GetMapping("/{id}/progress")
    public ResponseEntity<?> getProgressLog(
            @PathVariable Long id
    ) {

        List<ProgressLog> logs =
                serviceRequestService.getProgressLog(id);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        new LogsData(logs)
                )
        );
    }

    // =========================================================
    // DELETE REQUEST
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(
            @PathVariable Long id
    ) {

        serviceRequestService.deleteRequest(id);

        return ResponseEntity.ok(
                new ApiResponse(
                        true,
                        null
                )
        );
    }

    // =========================================================
    // RESPONSE RECORDS
    // =========================================================

    public record ApiResponse(
            boolean success,
            Object data
    ) {
    }

    public record RequestData(
            ServiceRequest request
    ) {
    }

    public record LogsData(
            List<ProgressLog> logs
    ) {
    }

    public record ListData(
            List<ServiceRequest> requests,
            PaginationData pagination
    ) {
    }

    public record PaginationData(
            long total,
            int page,
            int limit,
            int totalPages
    ) {
    }
}
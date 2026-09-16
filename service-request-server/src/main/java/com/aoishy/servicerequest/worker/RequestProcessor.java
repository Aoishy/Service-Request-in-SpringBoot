package com.aoishy.servicerequest.worker;

import com.aoishy.servicerequest.entity.ProgressLog;
import com.aoishy.servicerequest.entity.RequestStatus;
import com.aoishy.servicerequest.entity.ServiceRequest;
import com.aoishy.servicerequest.repository.ProgressLogRepository;
import com.aoishy.servicerequest.repository.ServiceRequestRepository;
import com.aoishy.servicerequest.websocket.WebSocketEventService;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class RequestProcessor {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ProgressLogRepository progressLogRepository;
    private final WebSocketEventService webSocketEventService;

    public RequestProcessor(
            ServiceRequestRepository serviceRequestRepository,
            ProgressLogRepository progressLogRepository,
            WebSocketEventService webSocketEventService
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.progressLogRepository = progressLogRepository;
        this.webSocketEventService = webSocketEventService;
    }

    // =========================================================
    // PROCESSING STAGES
    // =========================================================

    private static final List<ProcessingStage> STAGES = List.of(

            new ProcessingStage(
                    "Validation",
                    8,
                    2500,
                    "Validating request parameters and business rules"
            ),

            new ProcessingStage(
                    "Resource Allocation",
                    20,
                    3000,
                    "Allocating system resources and establishing dependencies"
            ),

            new ProcessingStage(
                    "Analysis",
                    40,
                    5000,
                    "Analyzing request requirements and computing execution plan"
            ),

            new ProcessingStage(
                    "Processing",
                    72,
                    8000,
                    "Executing primary processing pipeline"
            ),

            new ProcessingStage(
                    "Quality Check",
                    90,
                    3000,
                    "Verifying output integrity and quality standards"
            ),

            new ProcessingStage(
                    "Finalization",
                    100,
                    2000,
                    "Packaging results and releasing resources"
            )
    );

    // =========================================================
    // MAIN PROCESS METHOD
    // =========================================================

    public void process(Long requestId) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalStateException(
                        "Service request '" + requestId + "' not found"
                ));

        process(request);
    }

    public void process(ServiceRequest request) {

        try {

            System.out.println(
                    "[RequestProcessor] Starting request: "
                            + request.getId()
            );

            // -------------------------------------------------
            // STARTED
            // -------------------------------------------------

            request.setStatus(RequestStatus.PROCESSING);
            request.setProgress(0);
            request.setCurrentStage("Starting");
            request.setStartedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());

            ServiceRequest savedRequest =
                    serviceRequestRepository.save(request);

            System.out.println(
                    "[RequestProcessor] Request "
                            + request.getId()
                            + " started"
            );

            // WebSocket:
            // request:status-updated
            webSocketEventService.requestStatusUpdated(savedRequest);


            // -------------------------------------------------
            // PROCESS EACH STAGE
            // -------------------------------------------------

            for (ProcessingStage stage : STAGES) {

                // Check cancellation/interruption
                if (Thread.currentThread().isInterrupted()) {

                    handleCancellation(request);
                    return;
                }

                System.out.println(
                        "[RequestProcessor] Request "
                                + request.getId()
                                + " → "
                                + stage.name()
                );

                // Simulate processing work
                boolean completed = performWork(stage.durationMs());

                // If worker was interrupted
                if (!completed ||
                        Thread.currentThread().isInterrupted()) {

                    handleCancellation(request);
                    return;
                }

                // -------------------------------------------------
                // UPDATE REQUEST PROGRESS
                // -------------------------------------------------

                request.setProgress(stage.progress());
                request.setCurrentStage(stage.name());
                request.setUpdatedAt(LocalDateTime.now());

                savedRequest =
                        serviceRequestRepository.save(request);


                // -------------------------------------------------
                // CREATE PROGRESS LOG
                // -------------------------------------------------

                ProgressLog log = new ProgressLog();

                log.setRequest(savedRequest);
                log.setStage(stage.name());
                log.setMessage(stage.message());
                log.setProgress(stage.progress());
                log.setTimestamp(LocalDateTime.now());
                log.setCreatedAt(LocalDateTime.now());

                ProgressLog savedLog =
                        progressLogRepository.save(log);


                // -------------------------------------------------
                // WEBSOCKET: PROGRESS UPDATE
                // -------------------------------------------------

                webSocketEventService.requestProgressUpdated(
                        savedLog
                );

                System.out.println(
                        "[RequestProcessor] Request "
                                + request.getId()
                                + " progress: "
                                + stage.progress()
                                + "%"
                );
            }


            // -------------------------------------------------
            // COMPLETED
            // -------------------------------------------------

            request.setStatus(RequestStatus.COMPLETED);
            request.setProgress(100);
            request.setCurrentStage("Finalization");
            request.setCompletedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());

            savedRequest =
                    serviceRequestRepository.save(request);

            System.out.println(
                    "[RequestProcessor] Request "
                            + request.getId()
                            + " COMPLETED"
            );

            // WebSocket:
            // request:completed
            webSocketEventService.requestCompleted(savedRequest);


        } catch (InterruptedException e) {

            // Restore interrupted flag
            Thread.currentThread().interrupt();

            handleCancellation(request);

        } catch (Exception e) {

            handleFailure(request, e);
        }
    }

    // =========================================================
    // PERFORM WORK
    // =========================================================

    private boolean performWork(long durationMs)
            throws InterruptedException {

        long chunkMs = 100;

        long chunks =
                (long) Math.ceil(
                        (double) durationMs / chunkMs
                );

        for (long i = 0; i < chunks; i++) {

            // Check whether worker was interrupted
            if (Thread.currentThread().isInterrupted()) {
                return false;
            }

            // Small amount of CPU work
            performCpuWork();

            // Sleep so interruption can be detected
            Thread.sleep(chunkMs);
        }

        return true;
    }

    // =========================================================
    // CPU WORK
    // =========================================================

    private void performCpuWork() {

        int limit = 12000;

        boolean[] composite =
                new boolean[limit + 1];

        for (int i = 2; i * i <= limit; i++) {

            if (!composite[i]) {

                for (int j = i * i;
                     j <= limit;
                     j += i) {

                    composite[j] = true;
                }
            }
        }
    }

    // =========================================================
    // HANDLE CANCELLATION
    // =========================================================

    @Transactional
    protected void handleCancellation(
            ServiceRequest request
    ) {

        request.setStatus(RequestStatus.CANCELLED);
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        ServiceRequest savedRequest =
                serviceRequestRepository.save(request);

        System.out.println(
                "[RequestProcessor] Request "
                        + request.getId()
                        + " CANCELLED"
        );

        // WebSocket:
        // request:cancelled
        webSocketEventService.requestCancelled(
                savedRequest
        );
    }

    // =========================================================
    // HANDLE FAILURE
    // =========================================================

    @Transactional
    protected void handleFailure(
            ServiceRequest request,
            Exception exception
    ) {

        request.setStatus(RequestStatus.FAILED);
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        String errorMessage =
                exception.getMessage();

        if (errorMessage == null ||
                errorMessage.isBlank()) {

            errorMessage =
                    "Request processing failed";
        }

        request.setErrorMessage(errorMessage);

        ServiceRequest savedRequest =
                serviceRequestRepository.save(request);

        System.err.println(
                "[RequestProcessor] Request "
                        + request.getId()
                        + " FAILED: "
                        + errorMessage
        );

        // WebSocket:
        // request:failed
        webSocketEventService.requestFailed(
                savedRequest
        );
    }

    // =========================================================
    // PROCESSING STAGE RECORD
    // =========================================================

    private record ProcessingStage(
            String name,
            int progress,
            long durationMs,
            String message
    ) {
    }
}
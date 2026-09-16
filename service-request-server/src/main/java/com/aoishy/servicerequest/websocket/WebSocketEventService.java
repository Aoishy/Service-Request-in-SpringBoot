package com.aoishy.servicerequest.websocket;

import com.aoishy.servicerequest.entity.ProgressLog;
import com.aoishy.servicerequest.entity.ServiceRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketEventService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventService(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================
    // request:created
    // Payload: { request }
    // =========================================================

    public void requestCreated(ServiceRequest request) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("request", request);
messagingTemplate.convertAndSend(
    "/topic/request-created",
    (Object) payload
);
    }

    // =========================================================
    // request:status-updated
    // Payload: { requestId, status, currentStage, updatedAt }
    // =========================================================

    public void requestStatusUpdated(ServiceRequest request) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestId", request.getId());
        payload.put("status", request.getStatus().name().toLowerCase());
        payload.put("currentStage", request.getCurrentStage());
        payload.put("updatedAt", request.getUpdatedAt());

        messagingTemplate.convertAndSend(
                "/topic/request-status-updated",
                (Object) payload
        );
    }

    // =========================================================
    // request:progress-updated
    // Payload: { requestId, progress, currentStage, message, timestamp }
    // =========================================================

    public void requestProgressUpdated(ProgressLog log) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestId", log.getRequest().getId());
        payload.put("progress", log.getProgress());
        payload.put("currentStage", log.getStage());
        payload.put("message", log.getMessage());
        payload.put("timestamp", log.getTimestamp());

        messagingTemplate.convertAndSend(
                "/topic/request-progress-updated",
                (Object)payload
        );
    }

    // =========================================================
    // request:completed
    // Payload: { requestId, status, progress, completedAt }
    // =========================================================

    public void requestCompleted(ServiceRequest request) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestId", request.getId());
        payload.put("status", "completed");
        payload.put("progress", 100);
        payload.put("completedAt", request.getCompletedAt());

        messagingTemplate.convertAndSend(
                "/topic/request-completed",
                (Object) payload
        );
    }

    // =========================================================
    // request:failed
    // Payload: { requestId, status, errorMessage, completedAt }
    // =========================================================

    public void requestFailed(ServiceRequest request) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestId", request.getId());
        payload.put("status", "failed");
        payload.put("errorMessage", request.getErrorMessage());
        payload.put("completedAt", request.getCompletedAt());

        messagingTemplate.convertAndSend(
                "/topic/request-failed",
                (Object) payload
        );
    }

    // =========================================================
    // request:cancelled
    // Payload: { requestId, status, completedAt }
    // =========================================================

    public void requestCancelled(ServiceRequest request) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("requestId", request.getId());
        payload.put("status", "cancelled");
        payload.put("completedAt", request.getCompletedAt());

        messagingTemplate.convertAndSend(
                "/topic/request-cancelled",
                (Object) payload
        );
    }
}
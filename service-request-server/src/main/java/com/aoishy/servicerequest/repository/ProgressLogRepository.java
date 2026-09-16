package com.aoishy.servicerequest.repository;

import com.aoishy.servicerequest.entity.ProgressLog;
import com.aoishy.servicerequest.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressLogRepository
        extends JpaRepository<ProgressLog, Long> {

    // Get all logs for a request in chronological order
    List<ProgressLog> findByRequestOrderByTimestampAsc(
            ServiceRequest request
    );

    // Delete all logs belonging to a request
    void deleteByRequest(ServiceRequest request);
}
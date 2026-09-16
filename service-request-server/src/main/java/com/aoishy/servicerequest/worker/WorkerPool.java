package com.aoishy.servicerequest.worker;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Component
public class WorkerPool {

    private final ExecutorService executorService;

    /*
     * Keeps track of each request's worker.
     *
     * requestId → Future
     */
    private final Map<Long, Future<?>> activeWorkers =
            new ConcurrentHashMap<>();

    private final int maxWorkers = 4;

    public WorkerPool() {

        this.executorService =
                Executors.newFixedThreadPool(maxWorkers);

        System.out.println(
                "[WorkerPool] Initialized (maxWorkers="
                        + maxWorkers
                        + ")"
        );
    }

    // =========================================================
    // SUBMIT JOB
    // =========================================================

    public void submit(Long requestId, Runnable task) {

        Future<?> future =
                executorService.submit(() -> {

                    try {

                        task.run();

                    } finally {

                        // Remove worker after completion
                        activeWorkers.remove(requestId);

                        System.out.println(
                                "[WorkerPool] Worker finished: "
                                        + requestId
                        );
                    }
                });

        activeWorkers.put(requestId, future);

        System.out.println(
                "[WorkerPool] Job submitted: "
                        + requestId
        );
    }

    // =========================================================
    // CANCEL JOB
    // =========================================================

    public boolean cancel(Long requestId) {

        Future<?> future =
                activeWorkers.get(requestId);

        if (future == null) {

            System.out.println(
                    "[WorkerPool] No active worker found for request: "
                            + requestId
            );

            return false;
        }

        /*
         * true means:
         *
         * "Interrupt the thread running this task."
         */
        boolean cancelled =
                future.cancel(true);

        if (cancelled) {

            System.out.println(
                    "[WorkerPool] Cancellation requested for: "
                            + requestId
            );

        } else {

            System.out.println(
                    "[WorkerPool] Could not cancel: "
                            + requestId
            );
        }

        return cancelled;
    }

    // =========================================================
    // ACTIVE WORKER COUNT
    // =========================================================

    public int getActiveCount() {

        return activeWorkers.size();
    }

    // =========================================================
    // SHUTDOWN
    // =========================================================

    public void shutdown() {

        System.out.println(
                "[WorkerPool] Shutting down..."
        );

        executorService.shutdownNow();

        activeWorkers.clear();
    }
}
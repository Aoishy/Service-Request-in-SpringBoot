import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';

import { REQUESTS_QUERY_KEY } from '../api/requests';
import type {
  IServiceRequest,
  RequestStatus,
} from '../types';

let stompClient: Client | null = null;

// =========================================================
// GET WEBSOCKET CLIENT
// =========================================================

export function getSocketInstance(): Client {

  if (!stompClient) {

    const protocol =
      window.location.protocol === 'https:'
        ? 'wss'
        : 'ws';

    stompClient = new Client({

      brokerURL:
        `${protocol}://${window.location.host}/ws`,

      reconnectDelay: 1000,

      heartbeatIncoming: 10000,

      heartbeatOutgoing: 10000,

      debug: () => {
        // Keep STOMP debug messages disabled
      },
    });
  }

  return stompClient;
}

// =========================================================
// SOCKET HOOK
// =========================================================

export function useSocket() {

  const [isConnected, setIsConnected] =
    useState(false);

  const [lastEvent, setLastEvent] =
    useState<{
      type: string;
      payload: unknown;
      time: Date;
    } | null>(null);

  const queryClient =
    useQueryClient();

  useEffect(() => {

    const client =
      getSocketInstance();

    // =======================================================
    // UPDATE REQUEST IN CACHE
    // =======================================================

    const updateRequestInCache = (
      requestId: number,
      patch: Partial<IServiceRequest>
    ) => {

      queryClient.setQueriesData(
        {
          queryKey: REQUESTS_QUERY_KEY,
        },

        (
          old:
            | {
                items: IServiceRequest[];
                pagination: unknown;
              }
            | undefined
        ) => {

          if (!old?.items) {
            return old;
          }

          return {
            ...old,

            items: old.items.map(
              (item) =>
                item.id === requestId
                  ? {
                      ...item,
                      ...patch,
                    }
                  : item
            ),
          };
        }
      );

      queryClient.setQueryData(
        ['request', requestId],

        (
          old:
            | IServiceRequest
            | undefined
        ) => {

          if (!old) {
            return old;
          }

          return {
            ...old,
            ...patch,
          };
        }
      );
    };

    // =======================================================
    // CONNECTED
    // =======================================================

    client.onConnect = () => {

      setIsConnected(true);

      console.log(
        '[WebSocket] Connected to Spring Boot'
      );

      // -----------------------------------------------------
      // REQUEST CREATED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-created',

        (message: IMessage) => {

          const data:
            { request: IServiceRequest } =
            JSON.parse(message.body);

          setLastEvent({
            type: 'request:created',
            payload: data,
            time: new Date(),
          });

          queryClient.invalidateQueries({
            queryKey: REQUESTS_QUERY_KEY,
          });
        }
      );

      // -----------------------------------------------------
      // STATUS UPDATED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-status-updated',

        (message: IMessage) => {

          const data = JSON.parse(message.body) as
            | {
                requestId: number;
                status: RequestStatus;
                currentStage?: string;
                updatedAt: string;
              }
            | IServiceRequest;

          setLastEvent({
            type: 'request:status-updated',
            payload: data,
            time: new Date(),
          });

          /*
           * The Spring backend currently sends the
           * complete ServiceRequest object for status
           * updates.
           */
          if ('id' in data) {

            updateRequestInCache(
              data.id,
              data
            );

          } else {

            updateRequestInCache(
              data.requestId,
              {
                status: data.status,
                currentStage: data.currentStage,
                updatedAt: data.updatedAt,
              }
            );
          }
        }
      );

      // -----------------------------------------------------
      // PROGRESS UPDATED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-progress-updated',

        (message: IMessage) => {

          const data = JSON.parse(message.body) as
            | {
                id: number;
                request?: IServiceRequest;
                requestId?: number;
                stage?: string;
                message?: string;
                progress: number;
                currentStage?: string;
                timestamp?: string;
              };

          setLastEvent({
            type: 'request:progress-updated',
            payload: data,
            time: new Date(),
          });

          const requestId =
            data.requestId ??
            data.request?.id;

          if (requestId !== undefined) {

            updateRequestInCache(
              requestId,
              {
                progress: data.progress,
                currentStage:
                  data.currentStage ??
                  data.stage,
              }
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                requestId,
              ],
            });
          }
        }
      );

      // -----------------------------------------------------
      // REQUEST COMPLETED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-completed',

        (message: IMessage) => {

          const data = JSON.parse(message.body) as
            | {
                requestId: number;
                status: 'completed';
                progress: number;
                completedAt: string;
              }
            | IServiceRequest;

          setLastEvent({
            type: 'request:completed',
            payload: data,
            time: new Date(),
          });

          if ('id' in data) {

            updateRequestInCache(
              data.id,
              data
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                data.id,
              ],
            });

          } else {

            updateRequestInCache(
              data.requestId,
              {
                status: 'completed',
                progress: 100,
                completedAt: data.completedAt,
              }
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                data.requestId,
              ],
            });
          }
        }
      );

      // -----------------------------------------------------
      // REQUEST FAILED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-failed',

        (message: IMessage) => {

          const data = JSON.parse(message.body) as
            | {
                requestId: number;
                status: 'failed';
                errorMessage: string;
                completedAt: string;
              }
            | IServiceRequest;

          setLastEvent({
            type: 'request:failed',
            payload: data,
            time: new Date(),
          });

          if ('id' in data) {

            updateRequestInCache(
              data.id,
              data
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                data.id,
              ],
            });

          } else {

            updateRequestInCache(
              data.requestId,
              {
                status: 'failed',
                errorMessage:
                  data.errorMessage,
                completedAt:
                  data.completedAt,
              }
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                data.requestId,
              ],
            });
          }
        }
      );

      // -----------------------------------------------------
      // REQUEST CANCELLED
      // -----------------------------------------------------

      client.subscribe(
        '/topic/request-cancelled',

        (message: IMessage) => {

          const data = JSON.parse(message.body) as
            | {
                requestId: number;
                status: 'cancelled';
                completedAt: string;
              }
            | IServiceRequest;

          setLastEvent({
            type: 'request:cancelled',
            payload: data,
            time: new Date(),
          });

          if ('id' in data) {

            updateRequestInCache(
              data.id,
              data
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                String(data.id),
              ],
            });

          } else {

            updateRequestInCache(
              data.requestId,
              {
                status: 'cancelled',
                completedAt:
                  data.completedAt,
              }
            );

            queryClient.invalidateQueries({
              queryKey: [
                'progress-logs',
                String(data.requestId),
              ],
            });
          }
        }
      );
    };

    // =======================================================
    // DISCONNECTED
    // =======================================================

    client.onDisconnect = () => {

      setIsConnected(false);

      console.log(
        '[WebSocket] Disconnected from Spring Boot'
      );
    };

    // =======================================================
    // ERROR
    // =======================================================

    client.onStompError = (frame) => {

      console.error(
        '[WebSocket] STOMP error:',
        frame.headers['message']
      );

      console.error(
        '[WebSocket] Details:',
        frame.body
      );
    };

    // =======================================================
    // ACTIVATE CONNECTION
    // =======================================================

    if (!client.active) {
      client.activate();
    }

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {

      /*
       * We do not deactivate the global STOMP client here.
       *
       * This prevents multiple components from repeatedly
       * opening and closing the same WebSocket connection.
       */
      setIsConnected(
        client.connected
      );
    };

  }, [queryClient]);

  return {
    isConnected,
    lastEvent,
  };
}
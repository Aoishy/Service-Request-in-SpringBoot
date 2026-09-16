package com.aoishy.servicerequest.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void send(String topic, Object payload) {

        messagingTemplate.convertAndSend(
                "/topic/" + topic,
                payload
        );
    }
}
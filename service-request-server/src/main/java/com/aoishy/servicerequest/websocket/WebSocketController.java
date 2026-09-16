package com.aoishy.servicerequest.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/ping")
    public String ping() {
        return "pong";
    }

}
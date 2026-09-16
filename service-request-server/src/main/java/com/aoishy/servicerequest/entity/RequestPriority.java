
package com.aoishy.servicerequest.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RequestPriority {
    HIGH,
    LOW,
    MEDIUM,
    CRITICAL;

    @JsonCreator
    public static RequestPriority fromString(String value) {
        return RequestPriority.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }
}


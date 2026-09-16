package com.aoishy.servicerequest.dto;

import com.aoishy.servicerequest.entity.RequestPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateRequestDto {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100,
          message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000,
          message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private RequestPriority priority;

    @NotBlank(message = "Submitter name is required")
    @Size(max = 50,
          message = "Submitter name must not exceed 50 characters")
    private String submittedBy;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RequestPriority getPriority() {
        return priority;
    }

    public void setPriority(RequestPriority priority) {
        this.priority = priority;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }
}
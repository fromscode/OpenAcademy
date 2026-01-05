package com.openacademy.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentDashboardResponse {
    private String welcomeMessage;
    private String studentName;
    private String studentEmail;
}
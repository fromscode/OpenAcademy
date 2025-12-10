package com.openacademy.backend.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class GroupMemberDTO {
    Long userId;
    String fullName;
    String email;
    String phoneNumber;
    String role;
    Instant joinedAt;
}

package com.openacademy.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.dto.MessageResponse;
import com.openacademy.backend.dto.GroupMemberDTO;
import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.service.GroupService;

@RestController
@RequestMapping("/api/chat/groups")
public class ChatGroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/create/{group-name}/{owner-id}")
    public ChatGroup createGroup(@PathVariable("group-name") String groupName,
            @PathVariable("owner-id") Long ownerId) {
        return groupService.createGroup(groupName, ownerId);
    }

    @PostMapping("/add-member/{group-id}/{user-id}/{role}")
    public ChatGroup addMember(@PathVariable("group-id") Long groupId,
            @PathVariable("user-id") Long userId,
            @PathVariable("role") String role) {

        return groupService.addMember(groupId, userId, role);
    }

    // New endpoint to join a group (user explicitly joins)
    @PostMapping("/join/{group-id}/{user-id}")
    public ResponseEntity<?> joinGroup(@PathVariable("group-id") Long groupId,
            @PathVariable("user-id") Long userId) {
        try {
            ChatGroup group = groupService.addMember(groupId, userId, "MEMBER");
            if (group != null) {
                return ResponseEntity.ok(group);
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User already a member");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/remove-member/{group-id}/{user-id}")
    public ResponseEntity<?> removeMember(@PathVariable("group-id") Long groupId,
            @PathVariable("user-id") Long userId) {
        try {
            String result = groupService.deleteMember(groupId, userId);
            return ResponseEntity.ok().body(new MessageResponse(result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{groupId}")
    public ChatGroup getGroup(@PathVariable Long groupId) {
        return groupService.getGroup(groupId);
    }

    // Get all groups (for admin purposes)
    @GetMapping("/all-groups")
    public List<ChatGroup> getAllGroups() {
        return groupService.getAllGroups();
    }

    // Get groups where user is a member (this should be the default for students)
    @GetMapping("/user/{userId}")
    public List<ChatGroup> getUserGroups(@PathVariable Long userId) {
        return groupService.getUserGroups(userId);
    }

    // Get all members of a group
    @GetMapping("/members/{groupId}")
    public List<GroupMemberDTO> getGroupMembers(@PathVariable Long groupId) {
        return groupService.getGroupMembers(groupId);
    }

    @GetMapping("/count/{groupId}")
    public long countGroupMembers(@PathVariable Long groupId) {
        return groupService.countGroupMembers(groupId);
    }

}

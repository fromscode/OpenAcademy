package com.openacademy.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.service.GroupService;

@RestController
@RequestMapping("/api/chat/groups")
public class ChatGroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/create/{group-name}")
    public ChatGroup createGroup(@PathVariable("group-name") String groupName) {
        return groupService.createGroup(groupName, null);
    }

    @PostMapping("/add-member/{group-id}/{user-id}/{role}")
    public ChatGroup addMember(@PathVariable("group-id") Long groupId,
            @PathVariable("user-id") Long userId,
            @PathVariable("role") String role) {

        return groupService.addMember(groupId, userId, role);
    }

    @DeleteMapping("/remove-member/{group-id}/{user-id}")
    public ChatGroup removeMember(@PathVariable("group-id") Long groupId,
            @PathVariable("user-id") Long userId) {

        return groupService.deleteMember(groupId, userId);
    }

    @GetMapping("/{groupId}")
    public ChatGroup getGroup(@PathVariable Long groupId) {
        return groupService.getGroup(groupId);
    }

    @GetMapping("/all-groups")
    public List<ChatGroup> getAllGroups() {
        return groupService.getAllGroups();
    }
}

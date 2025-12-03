package com.openacademy.backend.service;

import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.entities.GroupMember;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.ChatGroupRepository;
import com.openacademy.backend.repository.GroupMemberRepository;

@Service
public class GroupService {

    private final ChatGroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;

    public GroupService(ChatGroupRepository groupRepo, GroupMemberRepository memberRepo) {
        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
    }

    public ChatGroup createGroup(String name, User owner) {
        ChatGroup group = new ChatGroup();
        group.setName(name);
        group.setPrivate(true);
        groupRepo.save(group);

        // Owner becomes ADMIN
        GroupMember gm = new GroupMember(group, owner, "ADMIN");
        memberRepo.save(gm);

        return group;
    }

    public void addMember(Long groupId, User user, String role) {
        if (!memberRepo.existsByGroupIdAndUserId(groupId, user.getId())) {
            ChatGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Group not found"));

            GroupMember gm = new GroupMember(group, user, role);
            memberRepo.save(gm);
        }
    }
}

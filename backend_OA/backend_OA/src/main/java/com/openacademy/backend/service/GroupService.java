package com.openacademy.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.openacademy.backend.entities.ChatGroup;
import com.openacademy.backend.entities.GroupMember;
import com.openacademy.backend.entities.User;
import com.openacademy.backend.repository.ChatGroupRepository;
import com.openacademy.backend.repository.GroupMemberRepository;
import com.openacademy.backend.repository.UserRepository;

@Service
@SuppressWarnings("null")
public class GroupService {

    private final ChatGroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final UserRepository userRepo;

    public GroupService(ChatGroupRepository groupRepo, GroupMemberRepository memberRepo, UserRepository userRepo) {
        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
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

    public ChatGroup getGroup(Long groupId) {
        return groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
    }

    public List<ChatGroup> getAllGroups() {
        return groupRepo.findAll();
    }

    public ChatGroup addMember(Long groupId, User user, String role) {
        if (!memberRepo.existsByGroupIdAndUserId(groupId, user.getId())) {
            ChatGroup group = groupRepo.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Group not found"));

            GroupMember gm = new GroupMember(group, user, role);
            memberRepo.save(gm);
            return gm.getGroup();
        }
        return null;
    }

    public ChatGroup addMember(Long groupId, Long userId, String role) {
        Optional<User> userOpt = userRepo.findById(userId);

        User user = userOpt.orElseThrow(() -> new IllegalArgumentException("User not found"));

        return this.addMember(groupId, user, role);
    }

    public ChatGroup deleteMember(Long groupId, Long userId) {
        GroupMember gm = memberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Group member not found"));

        memberRepo.delete(gm);

        return gm.getGroup();
    }
}

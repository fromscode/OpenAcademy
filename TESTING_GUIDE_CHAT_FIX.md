# Testing Guide - Chat Group Membership Fix

## Prerequisites
- Backend server running on http://localhost:8080
- Frontend running on http://localhost:5173 (or configured port)
- At least 2 test user accounts (e.g., student1@test.com, student2@test.com)

---

## Test Scenario 1: Creating a Group

**Steps:**
1. Login as Student 1
2. Go to Messages page
3. Click the "+" icon (Create Group)
4. Enter group name: "Test Study Group"
5. Click "Create"

**Expected Results:**
✅ Group appears in Student 1's group list immediately
✅ Student 1 can see the group
✅ Student 1 can send messages
✅ Student 1 is listed as ADMIN in backend

---

## Test Scenario 2: Group Visibility (Main Fix)

**Steps:**
1. Keep Student 1 logged in with created group
2. Open new browser/incognito window
3. Login as Student 2
4. Go to Messages page
5. Check group list

**Expected Results:**
✅ Student 2 does NOT see "Test Study Group" in their list
✅ No groups appear (Student 2 hasn't joined any)
✅ Message shown: "No groups found"

**Previous Bug:** Student 2 would see all groups automatically ❌

---

## Test Scenario 3: Browsing Available Groups

**Steps:**
1. As Student 2, click UserPlus icon (Browse Groups)
2. Modal should open

**Expected Results:**
✅ Modal shows "Browse Available Groups"
✅ "Test Study Group" appears in the list
✅ "Join" button visible next to each group
✅ Loading indicator shown initially

---

## Test Scenario 4: Joining a Group

**Steps:**
1. As Student 2, in Browse Groups modal
2. Click "Join" button next to "Test Study Group"
3. Wait for the action to complete

**Expected Results:**
✅ Button shows "Joining..." with spinner
✅ Group disappears from available groups list
✅ Modal can be closed (X button)
✅ "Test Study Group" now appears in Student 2's group list
✅ Student 2 can now select the group

---

## Test Scenario 5: Viewing Messages After Joining

**Steps:**
1. As Student 1, send a message: "Hello everyone!"
2. As Student 2, click on "Test Study Group"

**Expected Results:**
✅ Student 2 can see the message sent by Student 1
✅ Student 2 can send messages
✅ Both users can see each other's messages in real-time

---

## Test Scenario 6: Message Access Before Joining

**Steps:**
1. As Student 1, create a new group "Private Study"
2. Send message: "Secret message"
3. Note the groupId from browser DevTools Network tab
4. As Student 2 (not joined), try to access messages via API:
   ```
   POST http://localhost:8080/api/chat/messages/group/{groupId}/{student2Id}
   ```

**Expected Results:**
✅ API returns 403 Forbidden
✅ Error message: "User is not a member of this group"
✅ Student 2 cannot see messages

---

## Test Scenario 7: Sending Messages Without Membership

**Steps:**
1. Continue from Scenario 6
2. As Student 2, attempt to send message via API:
   ```javascript
   POST http://localhost:8080/api/chat/messages/send
   Body: {
     "groupId": {privateGroupId},
     "senderId": {student2Id},
     "content": "Trying to hack in"
   }
   ```

**Expected Results:**
✅ API returns 403 Forbidden
✅ Error message: "User is not a member of this group"
✅ Message not sent

---

## Test Scenario 8: Multiple Groups

**Steps:**
1. As Student 1, create 3 groups:
   - "Math Study"
   - "Science Lab"
   - "History Notes"
2. As Student 2, join only "Math Study" and "Science Lab"

**Expected Results:**
✅ Student 1 sees all 3 groups
✅ Student 2 sees only 2 groups (Math Study, Science Lab)
✅ Student 2's browse shows only "History Notes" as available
✅ Each user sees correct message counts per group

---

## Test Scenario 9: Group Refresh

**Steps:**
1. As Student 1, create group "Emergency Group"
2. As Student 2, click Refresh button (↻)

**Expected Results:**
✅ Student 2's group list reloads
✅ No new groups appear (Student 2 hasn't joined)
✅ Browse Groups shows the new "Emergency Group"

---

## Test Scenario 10: Auto-select First Group

**Steps:**
1. As Student 2 (member of 2 groups)
2. Navigate away from Messages page
3. Return to Messages page

**Expected Results:**
✅ First group automatically selected
✅ Messages loaded for that group
✅ Can send messages immediately

---

## API Testing with Postman/Curl

### Get User's Groups
```bash
GET http://localhost:8080/api/chat/groups/user/{userId}
Authorization: Bearer {token}
```

**Expected:** Only groups user is member of

---

### Get All Groups (Admin)
```bash
GET http://localhost:8080/api/chat/groups/all-groups
Authorization: Bearer {token}
```

**Expected:** All groups in system

---

### Join Group
```bash
POST http://localhost:8080/api/chat/groups/join/{groupId}/{userId}
Authorization: Bearer {token}
```

**Expected:** 
- Success: Returns group object
- Already member: 409 Conflict

---

### Get Messages (With Membership Check)
```bash
POST http://localhost:8080/api/chat/messages/group/{groupId}/{userId}
Authorization: Bearer {token}
```

**Expected:**
- Member: Returns message array
- Non-member: 403 Forbidden

---

## Browser Console Checks

**Student 1 (Group Creator):**
```javascript
// Should see groups
console.log(groups); // [{id: 1, name: "Test Study Group", ...}]

// Should be able to send
sendMessage(1, "Hello"); // Success
```

**Student 2 (Before Joining):**
```javascript
// Should NOT see group
console.log(groups); // []

// Browse should show available
chatAPI.groups.getAllGroups(); // Shows all groups
```

**Student 2 (After Joining):**
```javascript
// Should see group now
console.log(groups); // [{id: 1, name: "Test Study Group", ...}]

// Should be able to send
sendMessage(1, "Hi back"); // Success
```

---

## Common Issues & Solutions

### Issue: "Cannot read property 'id' of undefined"
**Solution:** User not loaded properly, check AuthContext

### Issue: Groups not appearing after join
**Solution:** Check network tab for successful API response, try refresh button

### Issue: 403 Forbidden on all requests
**Solution:** Check authentication token, verify user is logged in

### Issue: Messages not loading
**Solution:** Verify userId is passed correctly to getGroupMessages()

### Issue: Join button not working
**Solution:** Check browser console for errors, verify backend is running

---

## Backend Database Verification

**Check Group Members:**
```sql
SELECT gm.*, u.email, cg.name as group_name 
FROM group_members gm
JOIN users u ON gm.user_id = u.id
JOIN chat_groups cg ON gm.group_id = cg.id;
```

**Check User's Groups:**
```sql
SELECT cg.* 
FROM chat_groups cg
JOIN group_members gm ON cg.id = gm.group_id
WHERE gm.user_id = {userId};
```

**Verify Message Access:**
```sql
SELECT cm.*, cg.name as group_name, u.email as sender_email
FROM chat_messages cm
JOIN chat_groups cg ON cm.group_id = cg.id
JOIN users u ON cm.sender_id = u.id
WHERE cm.group_id = {groupId};
```

---

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Proper 403 responses for unauthorized access
✅ Real-time message updates work
✅ UI updates immediately after joining
✅ No duplicate groups in list
✅ Membership persists after page reload
✅ Multiple users can interact simultaneously

---

## Rollback Plan

If issues occur:
1. Stop backend server
2. Restore previous Java files from git
3. Rebuild: `mvn clean install`
4. Restart backend
5. Restore frontend files from git
6. Rebuild: `npm run build`

---

## Performance Testing

**Load Test:**
- Create 50+ groups
- Add 100+ messages per group
- Join/leave groups repeatedly
- Monitor response times (<500ms expected)

**Concurrent Users:**
- 10+ users online simultaneously
- All joining/sending messages
- No race conditions or deadlocks

---

## Security Audit Checklist

- [x] Non-members cannot view messages
- [x] Non-members cannot send messages
- [x] Proper HTTP status codes (403 for forbidden)
- [x] No SQL injection vulnerabilities
- [x] Authorization token validated
- [x] User ID validated against token
- [x] Group ID validated before access

---

## Final Verification

Before marking as complete:
1. ✅ All unit tests pass (if any)
2. ✅ Manual testing completed
3. ✅ No console warnings/errors
4. ✅ Code review done
5. ✅ Documentation updated
6. ✅ Git commit with clear message

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify database state
4. Review network requests in DevTools
5. Confirm all files were updated correctly

For questions, refer to: `CHAT_GROUP_MEMBERSHIP_FIX.md`

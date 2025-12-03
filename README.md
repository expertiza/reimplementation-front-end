# Join Team Requests Feature - Testing Guide

This guide provides step-by-step instructions for testing the **Join Team Requests** feature implemented in Expertiza.

## 📌 Overview

The Join Team Requests feature allows students to:
1. View team advertisements on the Signup Sheet
2. Send requests to join teams that are advertising for partners
3. View and manage received join requests on the "Your Team" page
4. Accept or decline join requests

---


The Website should open at `http://152.7.176.23:3000`

---

## 🔐 Test User Credentials

| Username | Password | Role | Team | Student ID |
|----------|----------|------|------|------------|
| alice | password123 | Team Leader | AI Innovators | 47 |
| bob | password123 | Team Member | AI Innovators | 48 |
| charlie | password123 | Team Leader | Web Warriors | 49 |
| diana | password123 | Team Leader | Mobile Masters | 50 |
| ethan | password123 | No Team | — | 51 |
| fiona | password123 | No Team | — | 52 |

---

## 🧪 Complete Test Cases

### Test 1: View Received Requests ✅

**Objective:** Verify that team leaders can see incoming join requests.

**Steps:**
1. Login as **Alice** (username: `alice`, password: `password123`)
2. Navigate to: `http://152.7.176.23:3000/student_teams/view?student_id=47`
3. Scroll down to the **"Received Requests"** section

**Expected Result:**
- See a table with columns: Name, Comments, Action, Sent at
- See pending join request(s) from other users (e.g., Ethan's request)
- "Invite" and "Decline" buttons are visible for pending requests

---

### Test 2: View Signup Sheet with Advertisements 🎺

**Objective:** Verify that the signup sheet displays trumpet icons for teams advertising for partners.

**Steps:**
1. Login as **Ethan** (username: `ethan`, password: `password123`)
2. Navigate to: `http://152.7.176.23:3000/assignments/1/signup_sheet`

**Expected Result:**
- See 3 topics listed: AI and Machine Learning, Web Development, Mobile Applications
- See 📢 trumpet icon next to "AI and Machine Learning" (Team: AI Innovators is advertising)
- See 📢 trumpet icon next to "Web Development" (Team: Web Warriors is advertising)
- **NO** trumpet icon for "Mobile Applications" (Diana's team has no advertisement)

---

### Test 3: View Advertisement Details

**Objective:** Verify that clicking the trumpet icon shows team advertisement details.

**Steps:**
1. Still logged in as **Ethan** on the signup sheet
2. Click the 📢 trumpet icon for "AI and Machine Learning"

**Expected Result:**
- Modal popup appears with:
  - Team name: **AI Innovators**
  - Desired skills/qualifications (e.g., Python, TensorFlow, Data Science)
  - "Request to Join Team" button

---

### Test 4: Create Join Team Request from Advertisement

**Objective:** Verify that users can send join requests from the advertisement modal.

**Steps:**
1. In the advertisement modal (from Test 3), click **"Request to Join Team"**
2. A comment field may appear - enter: "I'm interested in ML!"
3. Submit the request

**Expected Result:**
- Success message: "Join team request sent successfully!" (or similar)
- Modal closes automatically

**Verification:**
1. Login as **Alice** → `http://152.7.176.23:3000/student_teams/view?student_id=47`
2. Check the "Received Requests" section
3. Should now see a new request from **Ethan**

---

### Test 5: Accept Join Request (Invite)

**Objective:** Verify that team leaders can accept join requests.

**Steps:**
1. Login as **Alice** → `http://152.7.176.23:3000/student_teams/view?student_id=47`
2. In the "Received Requests" section, find Ethan's request
3. Click the **"Invite"** button
4. Confirm in the popup dialog

**Expected Result:**
- Success message displayed
- Request removed from the pending list
- Ethan is added to the team members list

**Verification:**
1. Login as **Ethan** → `http://152.7.176.23:3000/student_teams/view?student_id=51`
2. Ethan should now be part of the "AI Innovators" team

---

### Test 6: Decline Join Request

**Objective:** Verify that team leaders can decline join requests.

**Steps:**
1. Login as **Charlie** → `http://152.7.176.23:3000/student_teams/view?student_id=49`
2. See pending requests in the "Received Requests" section (e.g., Fiona and Ethan)
3. Click **"Decline"** on one of the pending requests (e.g., Fiona's request)
4. Confirm in the popup dialog

**Expected Result:**
- Request status changes to DECLINED
- Request is removed from the pending requests list

---

### Test 7: Team Full Validation

**Objective:** Verify that the "Invite" button is disabled when the team is full.

**Prerequisites:**
- Team must be at maximum capacity (check assignment's `max_team_size`)

**Steps:**
1. As Charlie, accept Ethan's request (team now has 2/4 members)
2. Create more join requests to fill the team to capacity
3. Once team is full, view the "Received Requests" section

**Expected Result:**
- "Invite" button is **disabled** (grayed out)
- Tooltip shows: "Team is full"
- "Decline" button still works

---

### Test 8: Create Advertisement

**Objective:** Verify that team leaders can create advertisements for their team.

**Steps:**
1. Login as **Diana** → `http://152.7.176.23:3000/student_teams/view?student_id=50`
2. Look for the "Advertisement for teammates" section
3. Click **"Create advertisement"** or **"Advertise for Partner"**
4. Enter desired skills/qualifications
5. Save the advertisement

**Expected Result:**
- Advertisement is created successfully
- Success message displayed

**Verification:**
1. Login as **Fiona** → `http://152.7.176.23:3000/assignments/1/signup_sheet`
2. Should now see 📢 trumpet icon next to "Mobile Applications"

---

## 🔗 Quick Navigation Links

| Page | URL |
|------|-----|
| Login | `http://152.7.176.23:3000/login` |
| Signup Sheet (Assignment 1) | `http://152.7.176.23:3000/assignments/1/signup_sheet` |
| Alice's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=47` |
| Bob's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=48` |
| Charlie's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=49` |
| Diana's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=50` |
| Ethan's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=51` |
| Fiona's Team Page | `http://152.7.176.23:3000/student_teams/view?student_id=52` |
| Partner Advertisements (Topic 1) | `http://152.7.176.23:3000/topics/1/partner_advertisements` |

---

**Authorization:**
- Centralized `action_allowed?` method with role-based permissions
- Only team members can accept/decline requests
- Only the request creator can update/delete their own request

## 📝 Notes for Testers

### Important Reminders

1. **Test User Passwords**: All test users have password `password123`

2. **Assignment Context**: All tests use **Assignment 1** with topics:
   - Topic 1: AI and Machine Learning
   - Topic 2: Web Development  
   - Topic 3: Mobile Applications

3. **Team Assignments**:
   - **AI Innovators** (Topic 1): alice (leader), diana (member)
   - **Web Warriors** (Topic 2): bob (leader), ethan (member)
   - **Mobile Masters** (Topic 3): charlie (leader), fiona (member)

4. **Test Order**: Follow test cases in order (1→8) for best results as some tests build on previous state



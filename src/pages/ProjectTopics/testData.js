export const mockdata = [
  {
    "id": 1,
    "name": "OSS project & documentation",
    "settings": {
      "allow_suggestions": false,
      "enable_bidding": false,
      "can_review_same_topic": true,
      "can_choose_topic_to_review": true,
      "allow_bookmarks": false,
      "allow_bidding_for_reviewers": false
    },
    "topics": [
      {
        "id": 1,
        "topic_identifier": "E2400",
        "topic_name": "Allow reviewers to bid on what to review",
        "description": "Enable bidding functionality for reviewers",
        "max_choosers": 1,
        "category": "Enhancement",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 0,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 1,
          "topic_id": 1,
          "team_id": 1,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["admin admin","tester1","admin2"],
          "status": true
        }]
      },
      {
        "id": 2,
        "topic_identifier": "E2401",
        "topic_name": "Implementing and testing import & export controllers",
        "description": "Import/Export functionality",
        "max_choosers": 1,
        "category": "Development",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 0,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 2,
          "topic_id": 2,
          "team_id": 2,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["user4","user3","user2"],
          "status": true
        }]
      },
      {
        "id": 3,
        "topic_identifier": "E2402",
        "topic_name": "User management and users table",
        "description": "User management functionality",
        "max_choosers": 1,
        "category": "Development",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 1,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 5,
          "topic_id": 5,
          "team_id": 5,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["student3","student33","student333"],
          "status": true
        }]
      },
      {
        "id": 4,
        "topic_identifier": "E2403",
        "topic_name": "Mentor-meeting management",
        "description": "Mentor meeting functionality",
        "max_choosers": 1,
        "category": "Development",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 0,
        "waitlist_count": 1,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 3,
          "topic_id": 4,
          "team_id": 3,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["student1","student11","student111"],
          "status": true
        }]
      },
      {
        "id": 5,
        "topic_identifier": "E2404",
        "topic_name": "Refactor student_teams functionality",
        "description": "Team management improvements",
        "max_choosers": 2,
        "category": "Enhancement",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 1,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 4,
          "topic_id": 5,
          "team_id": 4,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["student2","student22","student222"],
          "status": true
        }]
      }
    ]
  },
  {
    "id": 2,
    "name": "OSS Project 2",
    "settings": {
      "allow_suggestions": false,
      "enable_bidding": false,
      "can_review_same_topic": true,
      "can_choose_topic_to_review": true,
      "allow_bookmarks": false,
      "allow_bidding_for_reviewers": true
    },
    "topics": [
      {
        "id": 6,
        "topic_identifier": "E2450",
        "topic_name": "Refactor assignments_controller.rb",
        "description": "Use Previous page to improve functionality",
        "max_choosers": 2,
        "category": "Enhancement",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 2,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 2,
        "assigned_teams": []
      },
      {
        "id": 7,
        "topic_identifier": "E2451",
        "topic_name": "Reimplement feedback_response_map.rb",
        "description": "Edit the features of this controller",
        "max_choosers": 2,
        "category": "Development",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 0,
        "waitlist_count": 3,
        "link": "",
        "assignment_id": 2,
        "assigned_teams": [{
          "id": 6,
          "topic_id": 7,
          "team_id": 1,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["admin admin","tester1","admin2"],
          "status": true
        },
          {
            "id": 7,
            "topic_id": 7,
            "team_id": 2,
            "is_waitlisted": false,
            "preference_priority_number": 1,
            "team_members": ["user5","user3","user2"],
            "status": true
          },
        ]
      },
      {
        "id": 8,
        "topic_identifier": "E2461",
        "topic_name": "UI for Courses",
        "description": "Make UI for courses",
        "max_choosers": 1,
        "category": "Development",
        "private_to": null,
        "micropayment": 0,
        "available_slots": 0,
        "waitlist_count": 0,
        "link": "",
        "assignment_id": 1,
        "assigned_teams": [{
          "id": 5,
          "topic_id": 5,
          "team_id": 5,
          "is_waitlisted": false,
          "preference_priority_number": 1,
          "team_members": ["student3","student33","student333"],
          "status": true
        }]
      },
    ]
  }
]
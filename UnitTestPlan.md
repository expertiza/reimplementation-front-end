# Unit Tests

Unit testing for TS/front end projects is most applicable for logic-heavy components, which in the case of our project includes the button functionality. The following test cases were included:

- Validating that the "Add Reviewer" button adds a new reviewer with a status of "Pending".
- Validating that the "Delete outstanding Reviewers" button removes the reviewer's association from the topic.
- Ensure that all table columns — "Topic Selected," "Contributor," and "Reviewed By" — display accurate and consistent data for each assignment.
- Verify that any modifications to reviewers (adding, deleting, or unassigning) are properly reflected in the user interface.
- Confirm that unsubmitting a review does not remove the reviewer, only changes their status to (Pending).

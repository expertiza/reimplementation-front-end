# Manual Testing Checklist

## View Submissions Page

### UI Elements
- [ ] Page title displays correctly
- [ ] Table is properly formatted and not too wide
- [ ] Team names are clearly visible
- [ ] Team member links are clickable and styled correctly
- [ ] Action links (Assign Grade, History) are visible and properly styled
- [ ] Table is responsive on different screen sizes

### Navigation
- [ ] Clicking on "Assign Grade" navigates to the Assign Grade page
- [ ] Clicking on "History" navigates to the History page
- [ ] Clicking on team member names navigates to their profile pages

### Data Display
- [ ] All teams are displayed correctly
- [ ] Team member information is accurate
- [ ] No missing or incorrect data

## Assign Grade Page

### UI Elements
- [ ] Assignment name and team name are displayed correctly
- [ ] Submission summary is visible and readable
- [ ] Peer review scores are displayed in a table
- [ ] Grade input field is present and properly labeled
- [ ] Comment textarea is present and properly labeled
- [ ] Submit button is present and properly labeled

### Form Validation
- [ ] Submit button is disabled when form is empty
- [ ] Submit button is enabled when both grade and comment are filled
- [ ] Form submission works correctly
- [ ] Appropriate feedback is shown after submission

### Data Display
- [ ] Assignment details are accurate
- [ ] Team information is correct
- [ ] Peer review scores are displayed correctly
- [ ] Missing reviews are highlighted (if applicable)

## Cross-Browser Testing
- [ ] Page renders correctly in Chrome
- [ ] Page renders correctly in Firefox
- [ ] Page renders correctly in Safari
- [ ] Page renders correctly in Edge

## Responsive Design
- [ ] Page is usable on desktop (1920x1080)
- [ ] Page is usable on laptop (1366x768)
- [ ] Page is usable on tablet (768x1024)
- [ ] Page is usable on mobile (375x667)

## Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG standards
- [ ] Screen readers can navigate the page
- [ ] Form labels are properly associated with inputs

## Performance
- [ ] Page loads quickly
- [ ] No unnecessary re-renders
- [ ] Smooth transitions between pages
- [ ] No lag when interacting with the UI 
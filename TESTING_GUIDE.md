# Testing Guide for Submitted Content Feature

## Setup

### Prerequisites
1. Backend running on `http://localhost:3002`
2. Frontend running on `http://localhost:3001`
3. MySQL database with seeded data
4. Redis cache running

### Start Services
```bash
# Terminal 1: Start backend
cd reimplementation-back-end
docker compose up app redis -d

# Terminal 2: Start frontend
cd reimplementation-front-end
npm run dev
```

## Test Credentials

Use any of these credentials to login:

| Username | Password | Role |
|----------|----------|------|
| marion_ohara | password | Student |
| admin | password123 | Administrator |
| instructor | password | Instructor |
| ta_user | password | Teaching Assistant |

## Manual Testing

### Test 1: Navigate to Submitted Content
**Steps:**
1. Login with test credentials
2. Go to `/assignments`
3. Click on any assignment
4. Look for "View Submissions" or "Submit Content" button
5. Navigate to Submitted Content page

**Expected Result:**
- Page loads without errors
- 2x2 grid of buttons displays (grey, no colors)
- Buttons: "Submit File", "Submit Hyperlink", "Submission History", "Submitted Files"
- Content sections below show empty states

### Test 2: Upload a File
**Steps:**
1. Click "📤 Submit File" button
2. Modal dialog opens
3. Click file input and select a small test file (< 5MB, allowed extension like .pdf)
4. Click "Upload File"

**Expected Result:**
- Success message appears
- Modal closes
- File appears in "Submitted Files and Hyperlinks" section
- File list shows "Download" and "Delete" buttons

### Test 3: Submit a Hyperlink
**Steps:**
1. Click "🔗 Submit Hyperlink" button
2. Modal dialog opens
3. Enter URL: `https://example.com`
4. Click "Submit Hyperlink"

**Expected Result:**
- Success message appears
- Modal closes
- Hyperlink appears in "Submitted Files and Hyperlinks" section
- Hyperlink is clickable

### Test 4: Download a File
**Steps:**
1. Upload a test file (see Test 2)
2. Click "Download" button next to the file
3. Check Downloads folder

**Expected Result:**
- File downloads successfully
- Filename matches the uploaded file

### Test 5: Delete a File
**Steps:**
1. Upload a test file (see Test 2)
2. Click "Delete" button next to the file

**Expected Result:**
- Success message appears
- File disappears from list
- "Submitted Files and Hyperlinks" section shows no files

### Test 6: Remove a Hyperlink
**Steps:**
1. Submit a hyperlink (see Test 3)
2. Click "Remove" button next to the hyperlink

**Expected Result:**
- Success message appears
- Hyperlink disappears from list
- "Submitted Files and Hyperlinks" section shows no hyperlinks

### Test 7: View Submission History
**Steps:**
1. Upload a file (see Test 2)
2. Submit a hyperlink (see Test 3)
3. Look at "Submission History" section

**Expected Result:**
- Table shows all submissions
- Each row displays: User, Type (File/Hyperlink), Content, Operation

### Test 8: Validation - Invalid File Size
**Steps:**
1. Click "📤 Submit File" button
2. Try to select a file > 5MB
3. Click "Upload File"

**Expected Result:**
- Error message: "File size must be less than 5MB"
- File is not uploaded

### Test 9: Validation - Invalid File Extension
**Steps:**
1. Click "📤 Submit File" button
2. Try to select a file with invalid extension (e.g., .exe, .sh)
3. Click "Upload File"

**Expected Result:**
- Error message: "Invalid file extension"
- File is not uploaded

### Test 10: Validation - Invalid URL
**Steps:**
1. Click "🔗 Submit Hyperlink" button
2. Enter invalid URL: `not a valid url`
3. Click "Submit Hyperlink"

**Expected Result:**
- Error message: "Must be a valid URL"
- Hyperlink is not submitted

## Automated Testing

### Run Unit Tests
```bash
npm run test
```

### Run Specific Test Suite
```bash
npm run test -- SubmittedContent.test.tsx
```

### Run Tests with Coverage
```bash
npm run test -- --coverage
```

### Test Files Location
- Component tests: `src/pages/Assignments/__tests__/SubmittedContent.test.tsx`
- Service tests: `src/services/__tests__/SubmittedContentService.test.ts`

## Bug Reporting

If you find issues:

1. **Take a screenshot** of the error
2. **Check browser console** (F12 → Console tab)
3. **Check backend logs** (terminal where backend is running)
4. **Verify credentials** are correct
5. **Report with:**
   - Step-by-step reproduction instructions
   - Expected vs actual behavior
   - Console error messages
   - Backend error messages

## Performance Testing

### Test Large File Upload
1. Create a 4.9MB file
2. Upload it
3. Check time taken
4. Should complete in < 10 seconds

### Test Multiple Submissions
1. Upload 5-10 files
2. Submit 5-10 hyperlinks
3. Check "Submission History" table performance
4. Should display all without slowdown

## Browser Compatibility

Test on:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Expected Result:** Feature works consistently across all browsers

## Accessibility Testing

- Tab through all buttons (keyboard navigation should work)
- Screen reader should read button labels correctly
- Modal dialogs should be keyboard accessible (ESC to close)

## Known Issues

None at this time. Please report any issues found during testing.

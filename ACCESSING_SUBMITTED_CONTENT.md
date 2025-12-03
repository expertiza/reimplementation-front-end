# Accessing Submitted Content Feature

## Overview
The Submitted Content feature allows users to upload files and submit hyperlinks for assignments in the Expertiza system.

## How to Access

### 1. Navigate to Assignments
- Go to the main Assignments page at `/assignments`
- You'll see a list of available assignments

### 2. Select an Assignment
- Click on any assignment from the list
- This will take you to the assignment detail page

### 3. Access Submit Content
- Look for the "Submit Content" button or tab on the assignment detail page
- Click on it to navigate to `/assignments/edit/{id}/submitcontent`

## Features

### Submit File (📤)
- Click the "Submit File" button
- A modal dialog will open
- Select a file from your computer
- Optionally check "Unzip file if it's a ZIP archive" to auto-extract ZIP files
- Click "Upload File"

**File Constraints:**
- Maximum size: 5MB
- Allowed extensions: pdf, png, jpeg, jpg, zip, tar, gz, 7z, odt, docx, md, rb, mp4, txt

### Submit Hyperlink (🔗)
- Click the "Submit Hyperlink" button
- A modal dialog will open
- Enter a valid URL (e.g., https://example.com)
- Click "Submit Hyperlink"

### View Submission History
- The "Submission History" section shows all submissions made
- Displays: User, Type (File/Hyperlink), Content, and Operation timestamp

### View Submitted Files and Hyperlinks
- The "Submitted Files and Hyperlinks" section displays:
  - **Hyperlinks**: Clickable links with Remove button
  - **Files**: File names with Download and Delete buttons

## Actions

### Download File
- In the "Submitted Files and Hyperlinks" section
- Click "Download" next to any file
- The file will download to your computer

### Delete File
- In the "Submitted Files and Hyperlinks" section
- Click "Delete" next to any file
- The file will be removed immediately

### Remove Hyperlink
- In the "Submitted Files and Hyperlinks" section
- Click "Remove" next to any hyperlink
- The hyperlink will be removed immediately

## Requirements

### Authentication
- You must be logged in to access this feature
- Your authentication token is stored in localStorage

### Permissions
- You must be a participant in the assignment to submit content
- Your participantId is required for all submissions

## Troubleshooting

### "Failed to upload file" Error
- Check file size (must be < 5MB)
- Check file extension (must be one of the allowed types)
- Ensure you have a valid internet connection

### "Failed to submit hyperlink" Error
- Verify the URL is valid (starts with http:// or https://)
- Check your internet connection

### "Submission not appearing" Error
- Click the refresh button or navigate away and back
- Check your browser console for error messages
- Verify your auth token is still valid (check localStorage)

## API Endpoints Used

- `GET /api/v1/submitted_content` - Fetch submissions
- `GET /submitted_content/list_files` - List uploaded files
- `POST /submitted_content/submit_file` - Upload a file
- `POST /submitted_content/submit_hyperlink` - Submit a hyperlink
- `POST /submitted_content/remove_hyperlink` - Remove a hyperlink
- `GET /submitted_content/download` - Download a file
- `POST /submitted_content/folder_action` - Delete a file

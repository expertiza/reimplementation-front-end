# Submitted Content Component README

## Overview
The `SubmittedContent` component handles file uploads, hyperlink submissions, and file/hyperlink management for Expertiza assignments.

## Location
`/src/pages/Assignments/SubmittedContent.tsx`

## Component Props
None - Component uses React Router hooks for navigation and data loading.

## Hooks Used
- `useLoaderData()`: Get assignment data from router
- `useNavigate()`: Navigate to other pages
- `useState`: Manage component state
- `useCallback`: Memoize async functions
- `useEffect`: Fetch data on mount
- `useMemo`: Memoize table columns

## State Variables

### Data State
```typescript
const [submissions, setSubmissions] = useState<ISubmission[]>([]);
const [files, setFiles] = useState<IFile[]>([]);
const [hyperlinks, setHyperlinks] = useState<string[]>([]);
```

### UI State
```typescript
const [error, setError] = useState<IError | null>(null);
const [loading, setLoading] = useState(false);
const [showFileModal, setShowFileModal] = useState(false);
const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
```

### Navigation State
```typescript
const [currentFolder, setCurrentFolder] = useState('/');
```

## Key Functions

### fetchSubmissions()
Fetches all submissions from `/api/v1/submitted_content`

### fetchFiles()
Fetches files and hyperlinks from `/submitted_content/list_files`

### handleFileUpload(values)
Uploads a file via `POST /submitted_content/submit_file`
- Parameters: `{ file, unzip }`
- Uses FormData for multipart upload

### handleHyperlinkSubmit(values)
Submits a hyperlink via `POST /submitted_content/submit_hyperlink`
- Parameters: `{ hyperlink }`

### handleRemoveHyperlink(index)
Removes a hyperlink via `POST /submitted_content/remove_hyperlink`
- Parameters: `{ id, chk_links }`

### handleDownloadFile(fileName)
Downloads a file via `GET /submitted_content/download`
- Uses blob response type
- Creates download link automatically

### handleDeleteFile(fileName)
Deletes a file via `POST /submitted_content/folder_action`
- Parameters: `{ id, current_folder, faction.delete }`

## Validation Schemas

### fileValidationSchema
```typescript
Yup.object().shape({
  file: Yup.mixed()
    .required('File is required')
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Invalid file extension', (value) => {
      const allowedExtensions = ['pdf', 'png', 'jpeg', ...];
      const extension = value.name.split('.').pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    })
})
```

### hyperlinkValidationSchema
```typescript
Yup.object().shape({
  hyperlink: Yup.string()
    .url('Must be a valid URL')
    .required('Hyperlink is required')
})
```

## Table Columns

The Submission History table displays:
| Column | Type | Content |
|--------|------|---------|
| user | string | Username of submitter |
| record_type | enum | 'file' or 'hyperlink' |
| content | string | File name or hyperlink URL |
| operation | string | Timestamp of operation |

## UI Sections

### 1. Title Section
- Centered h2: "Submit Content"
- Horizontal separator line (2px solid border)

### 2. Button Grid (2x2)
- **Submit File** (primary action): Opens file upload modal
- **Submit Hyperlink** (primary action): Opens hyperlink modal
- **Submission History** (disabled): Visual indicator
- **Submitted Files** (disabled): Visual indicator

### 3. Submission History Card
- Full-width card below grid
- TanStack Table displaying all submissions
- Shows empty state if no submissions

### 4. Files and Hyperlinks Card
- Full-width card below grid
- Lists all hyperlinks with Remove buttons
- Lists all files with Download and Delete buttons
- Shows empty state if nothing submitted

## Modal Components

### File Upload Modal
- Title: "Upload File"
- Form fields:
  - File input (required)
  - Unzip checkbox (optional)
- Buttons: Upload File, Cancel

### Hyperlink Modal
- Title: "Submit Hyperlink"
- Form fields:
  - URL input (required)
- Buttons: Submit Hyperlink, Cancel

## Error Handling

Errors displayed as dismissible Alert with color coding:
- **Error**: Danger (red) - File too large, invalid extension, network error
- **Success**: Success (green) - Upload/submission/deletion successful
- **Warning**: Warning (yellow) - Minor issues
- **Info**: Info (blue) - Informational messages

## Loading States

- Global spinner shows during data fetching
- Button disabled states during submission
- Loading text ("Uploading...", "Submitting...") during operations

## Styling

### Custom Styles (Inline)
```typescript
// Button styles
{
  height: '150px',
  fontSize: '1rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '20px',
  flexDirection: 'column',
  gap: '10px',
  backgroundColor: '#e9ecef',
  border: '1px solid #dee2e6',
  color: '#000',
}
```

### Bootstrap Classes
- `fw-bold`: Font weight bold
- `text-center`: Center text
- `text-muted`: Muted/grey text
- `mb-*`, `p-*`: Margin and padding utilities
- `d-flex`, `flex-column`: Flexbox utilities
- `gap-*`: Gap between flex items
- `w-100`: Full width
- `badge`, `bg-primary`: Badge styling
- `shadow-sm`: Subtle shadow

## Dependencies

```typescript
import React, { useState, useCallback, useEffect, useMemo }
import { Container, Row, Col, Button, Form, Alert, Spinner, Modal, ListGroup } from 'react-bootstrap'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import Table from '../../components/Table/Table'
import FormInput from '../../components/Form/FormInput'
import { Formik } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
```

## Usage in Routes

```typescript
{
  path: '/assignments/edit/:id/submitcontent',
  element: <SubmittedContent />,
}
```

## Related Files

- Types: `/src/types/SubmittedContent.ts`
- Service: `/src/services/SubmittedContentService.ts`
- Tests: `/src/pages/Assignments/__tests__/SubmittedContent.test.tsx`

## Known Limitations

1. Files limited to 5MB
2. Specific file types allowed only
3. No file preview functionality
4. No drag-and-drop upload yet
5. No batch operations

## Future Improvements

1. Add progress bar for uploads
2. Add file preview before download
3. Add drag-and-drop upload
4. Add file version history
5. Add comments on submissions
6. Add email notifications
7. Add batch delete operations

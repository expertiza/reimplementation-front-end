# Submitted Content Feature - Design Document

## Feature Overview
The Submitted Content feature enables students and teams to submit files and hyperlinks for assignments. This document outlines the design, architecture, and implementation details.

## Design Goals
1. **User-Friendly**: Simple interface for submissions
2. **Robust**: Proper validation and error handling
3. **Scalable**: Efficient handling of multiple files
4. **Responsive**: Works on desktop and mobile devices
5. **Accessible**: Follows WCAG accessibility guidelines

## Architecture

### Component Hierarchy
```
SubmittedContent (Main Component)
├── Modal (File Upload)
│   └── Formik Form
│       ├── File Input
│       └── Unzip Checkbox
├── Modal (Hyperlink Submission)
│   └── Formik Form
│       └── URL Input
├── 2x2 Grid of Buttons
│   ├── Submit File Button
│   ├── Submit Hyperlink Button
│   ├── Submission History Button (disabled)
│   └── Submitted Files Button (disabled)
├── Card: Submission History
│   └── Table Component
├── Card: Submitted Files and Hyperlinks
│   ├── Hyperlinks List
│   └── Files List
```

### Technology Stack
- **React 18.2.0**: UI framework
- **TypeScript**: Type safety
- **React Bootstrap 5.3.3**: UI components
- **Formik 2.2.9**: Form state management
- **Yup**: Schema validation
- **TanStack React Table 8.9.1**: Data table
- **Axios**: HTTP client
- **Vite**: Build tool

## UI/UX Design

### Layout Strategy
1. **Centered Title**: "Submit Content" at the top with separator line
2. **2x2 Grid**: Four equal-sized buttons (150px height, grey color)
   - Top-left: Submit File (interactive)
   - Top-right: Submit Hyperlink (interactive)
   - Bottom-left: Submission History (disabled visual indicator)
   - Bottom-right: Submitted Files (disabled visual indicator)
3. **Content Sections**: Below grid, full-width
   - Submission History (table)
   - Submitted Files and Hyperlinks (lists)

### Color Scheme
- **Button Background**: Light grey (#e9ecef)
- **Button Border**: Grey (#dee2e6)
- **Text Color**: Black (#000)
- **Background**: White
- **Accent**: Bootstrap primary blue (for badges, table highlights)

### Typography
- **Title**: h2, fw-bold (16px)
- **Section Headers**: h5, fw-bold (14px)
- **Subsection Headers**: h6, fw-bold (12px)
- **Body Text**: 14px, regular weight
- **Button Text**: 1rem, bold

### Spacing
- Container padding: py-5 (3rem top/bottom)
- Section gaps: g-4 (1.5rem)
- Internal gaps: gap-4 (1.5rem)
- Button gaps: gap-3 (1rem)

## Data Models

### ISubmission
```typescript
interface ISubmission {
  id: number;
  record_type: 'file' | 'hyperlink';
  content: string;
  operation: string;
  user: string;
  team_id: number;
  assignment_id: number;
}
```

### IFile
```typescript
interface IFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
}
```

### IError
```typescript
interface IError {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}
```

## Validation Rules

### File Upload
- **Size**: Maximum 5MB (5,242,880 bytes)
- **Extensions**: pdf, png, jpeg, jpg, zip, tar, gz, 7z, odt, docx, md, rb, mp4, txt
- **Required**: File must be selected

### Hyperlink Submission
- **Format**: Must be valid URL (e.g., https://example.com)
- **Required**: URL must be provided

## API Integration

### Endpoints Used
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/submitted_content` | Fetch submissions |
| GET | `/submitted_content/list_files` | List files and hyperlinks |
| POST | `/submitted_content/submit_file` | Upload file |
| POST | `/submitted_content/submit_hyperlink` | Submit hyperlink |
| POST | `/submitted_content/remove_hyperlink` | Remove hyperlink |
| GET | `/submitted_content/download` | Download file |
| POST | `/submitted_content/folder_action` | Delete file |

### Authentication
- JWT Bearer token in Authorization header
- Token stored in localStorage
- Token automatically included in all requests via axios interceptor

## State Management

### Component State
```typescript
const [error, setError] = useState<IError | null>(null);
const [loading, setLoading] = useState(false);
const [submissions, setSubmissions] = useState<ISubmission[]>([]);
const [files, setFiles] = useState<IFile[]>([]);
const [hyperlinks, setHyperlinks] = useState<string[]>([]);
const [currentFolder, setCurrentFolder] = useState('/');
const [showFileModal, setShowFileModal] = useState(false);
const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
```

## Error Handling

### User-Facing Errors
- Displayed as dismissible Alert component
- Color-coded: red for errors, green for success
- Auto-clear on dismiss or new submission

### Network Errors
- "Failed to fetch submissions"
- "Failed to fetch files"
- "Failed to upload file"
- "Failed to submit hyperlink"
- "Failed to remove hyperlink"
- "Failed to download file"
- "Failed to delete file"

## Performance Considerations

1. **Lazy Loading**: Files loaded on demand
2. **Debounced Fetching**: Initial fetch on component mount
3. **Table Virtualization**: TanStack Table for efficient rendering
4. **Chunked Uploads**: Suitable for large files
5. **Timeout**: 10-second API timeout to prevent hanging

## Responsive Design

### Breakpoints
- **lg (992px)**: Col lg={5} for button grid (50% width on desktop)
- **xs (< 576px)**: Col xs={6} for grid items (2 columns)
- **Button Grid**: Centers on all screen sizes

### Mobile Optimization
- Touch-friendly button size (150px height)
- Modal takes full width on mobile
- Table scrolls horizontally if needed
- Stacked layout on small screens

## Accessibility (WCAG 2.1 Level AA)

1. **Keyboard Navigation**
   - All buttons Tab-navigable
   - Modal ESC to close
   - Form fields labeled

2. **Screen Readers**
   - Semantic HTML (buttons, forms, tables)
   - ARIA labels where needed
   - Status messages announced

3. **Color Contrast**
   - All text meets 4.5:1 contrast ratio
   - Color not only indicator (also icons)

4. **Focus Management**
   - Focus trap in modals
   - Focus visible on buttons
   - Return focus after modal closes

## Testing Strategy

### Unit Tests
- Component rendering
- Form validation
- API call handling
- Error scenarios

### Integration Tests
- File upload flow
- Hyperlink submission flow
- Download and delete operations

### E2E Tests
- Full user workflows
- Cross-browser compatibility
- Mobile responsiveness

## Future Enhancements

1. **Drag & Drop**: Upload files by dragging
2. **Progress Bar**: Show upload progress for large files
3. **Preview**: Preview files before download
4. **Versioning**: Track file versions
5. **Comments**: Add comments to submissions
6. **Notifications**: Email notifications on submissions
7. **Batch Operations**: Select multiple files to delete
8. **Search**: Search submissions by date/user

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

See `package.json` for complete list:
- react: 18.2.0
- react-bootstrap: 5.3.3
- @tanstack/react-table: 8.9.1
- formik: 2.2.9
- yup: 1.3.3
- axios: 1.4.0

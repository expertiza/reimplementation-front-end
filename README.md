# Reimplementation Front-End

This project is a front-end implementation for the Reimplementation system.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Application

To start the development server:

```
npm start
```
or
```
yarn start
```

The application will be available at http://localhost:3000.

## Testing

### Running Tests

To run the tests:

```
npm test
```
or
```
yarn test
```

This will run the tests in watch mode. Press `q` to quit.

### Test Structure

The tests are organized as follows:

- Unit tests for components are located in `src/pages/Assignments/__tests__/`
- Test setup is in `src/setupTests.ts`

## Features

### View Submissions Page

- Displays a list of teams with their associated details
- Shows team names, team members, and resource links
- Provides interactive links for actions such as "Assign Grade" and "History"
- Responsive design for accessibility across devices

### Assign Grades Page

- Displays the selected team's details, submission summary, and peer review scores
- Provides input fields for grades and comments
- Includes a "Submit" button for finalizing grades
- Highlights missing reviews
- Prevents grade submission without completing required fields

## Backend Integration

The front-end integrates with the reimplementation backend to:

- Fetch and display assignment data
- Retrieve team member details
- Access historical records
- Submit grades and comments

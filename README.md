# Expertiza Project - Team 2522: Enhancing UI Consistency in Expertiza (E2522)

## Project Overview

This project focuses on refining and updating previously implemented UI components in the Expertiza system to align with the **design guidelines** provided in the [Design Document](https://github.com/AnvithaReddyGutha/reimplementation-front-end/blob/main/design_document.md). The goal is to enhance usability, maintain consistency, and improve the overall user experience by adhering to standardized design principles. Our team will be working on modifying existing pull requests to ensure they meet the design and functionality requirements.

---

## Project Tasks

### 1. **Pull Request #38: Reimplement Student Task List**
   - **Reference:** [CSC/ECE 517 Spring 2024 - E2429](https://wiki.expertiza.ncsu.edu/index.php?title=CSC/ECE_517_Spring_2024_-E2429_Reimplement_student_task_list)
   - **Required Changes:**
     - **Pagination Adjustment:** Ensure pagination is only visible when the list of columns exceeds one full page.
     - **Remove Search Bar and Dropdowns:** Remove the search bar at the top of the table and the dropdowns in each column.
     - **Text Formatting:** Implement proper text formatting based on the provided design guidelines.

### 2. **Pull Request #76: UI for View Assignments in Courses View**
   - **Reference:** [CSC/ECE 517 Fall 2024 - E2491](https://wiki.expertiza.ncsu.edu/index.php?title=CSC/ECE_517_Fall_2024_-E2491_UI_for_view_assignments_in_Courses_view)
   - **Required Changes:**
     - **Date Formatting:** Format dates into a more readable format, similar to the standard date format given in the design document.
     - **Remove Course Name Column:** Remove the course name column from the Assignment table.
     - **Disable Global Search Bar:** Disable the global search bar at the top of the Assignment table.
     - **Text Formatting:** Implement proper text formatting based on the provided design guidelines.

### 3. **Pull Request #79: Improving Assignment Participants Management UI in Expertiza**
   - **Reference:** [CSC/ECE 517 Fall 2024 - E2490](https://wiki.expertiza.ncsu.edu/index.php?title=CSC/ECE_517_Fall_2024_-E2490_Improving_Assignment_Participants_Management_UI_in_Expertiza)
   - **Required Changes:**
     - **Icon Updates:** Update icons according to the design guidelines.
     - **Text Formatting:** Implement proper text formatting based on the provided design guidelines.
     - **Button Formatting:** Implement proper button formatting based on the provided design guidelines.

---

## Design Guidelines

The design guidelines for this project are available in the [Design Document](https://github.com/AnvithaReddyGutha/reimplementation-front-end/blob/main/design_document.md). Key aspects to focus on include:

1. **Consistency:** Ensure all UI components follow the same design patterns, including fonts, colors, spacing, and alignment.
2. **Responsiveness:** Ensure the UI adapts to different screen sizes and devices.
3. **Accessibility:** Follow accessibility standards (e.g., ARIA roles, keyboard navigation, and proper contrast).
4. **Reusability:** Design reusable components to avoid duplication and simplify maintenance.
5. **Clarity:** Ensure all UI elements are intuitive and easy to understand.

---

## Prerequisites

- **React and TypeScript:** A solid understanding of React and TypeScript is required for this project.
- **Expertiza Setup:** Ensure you have the Expertiza environment set up for both the front-end and back-end.

---

## Project Setup Instructions

### Front-End Setup
1. Clone the **reimplementation-front-end** repository:
   ```bash
   git clone https://github.com/expertiza/reimplementation-front-end.git
   ```
2. Navigate to the project directory:
   ```bash
   cd reimplementation-front-end
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Back-End Setup
1. Clone the **reimplementation-back-end** repository:
   ```bash
   git clone https://github.com/expertiza/reimplementation-back-end.git
   ```
2. Navigate to the project directory:
   ```bash
   cd reimplementation-back-end
   ```
3. Install dependencies:
   ```bash
   bundle install
   ```
4. Set up the database:
   ```bash
   rake db:migrate
   ```
5. Start the Rails server:
   ```bash
   rails s
   ```

---

## Best Practices

1. **Component Reusability (DRY Principle):** Design reusable and modular components to avoid duplication and simplify maintenance.
2. **Separation of Concerns:** Keep the UI, state management, and business logic separated. Use container components for state and logic and presentational components for rendering.
3. **Responsive and Accessible Design:** Ensure the UI adapts to different devices and meets accessibility standards (e.g., ARIA roles, keyboard navigation, and proper contrast).
4. **Type Safety with TypeScript:** Use TypeScript interfaces and types to ensure data consistency and reduce runtime errors.
5. **Single Responsibility Principle:** Each component or function should have a single, well-defined purpose to improve clarity, testability, and scalability.

---

## Testing

- **Unit Testing:** Write unit tests for all new components and functionalities using Jest and React Testing Library.
- **Integration Testing:** Ensure that all components work seamlessly together and with the backend APIs.
- **Usability Testing:** Validate that the UI is intuitive and user-friendly across different devices and screen sizes.

---

## Deliverables

1. **Updated Pull Requests:** Submit updated pull requests for #38, #76, and #79 with all required changes implemented.
2. **Documentation:** Provide detailed documentation for all changes made, including explanations of design decisions and any new components or functionalities.
3. **Testing Results:** Submit a report detailing the results of all tests conducted, including any issues found and how they were resolved.

---

## Team Members

- **Joannes Koomson**
- **Jing Huang**
- **Chinmay Nayak**

## Mentor

- **Anvitha Reddy Gutha**

---

## References

- [Design Document](https://github.com/AnvithaReddyGutha/reimplementation-front-end/blob/main/design_document.md)
- [Expertiza Wiki](https://wiki.expertiza.ncsu.edu/)
- [Expertiza GitHub Repository](https://github.com/expertiza/expertiza)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)

---

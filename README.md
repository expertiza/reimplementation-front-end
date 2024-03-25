# Program 3 - E2425. Create a Courses user interface in ReactJS - Team APS
## About

The Courses page showcases a comprehensive list of courses, featuring vital information like the course title, institution name, dates of creation and updates, as well as associated functionalities like Edit course, Delete course, Add TA, Duplicate course.

The aim is to craft a user-friendly and interactive interface, facilitating seamless navigation and management of course-related data.

**Intuitive Course Management:** Developed a streamlined interface for easy navigation and management of courses  
**Enhanced Widgets:** Incorporated optimized widgets ensuring functionality and user engagement  
**Responsive Design:** The interface is accessible across various devices enhancing user experience  
**Performance Optimization:** Enhanced loading speeds and overall performance metrics by required code refactoring  

The features have been implemented using ReactJS and TypeScript.

## Design

### Added Instructor Column

The instructor column is now visible only for admin and superadmin users, enhancing the interface for better clarity. This dynamic feature ensures that the interface adapts based on the user's role, providing relevant information as needed.

![Instructor1](https://github.com/pankhis/reimplementation-front-end/assets/142809941/d92a8a84-1e82-4e71-999b-61f1520af17c)


### Improved Readability with Hover Effects

Action buttons now have hover effects, enhancing readability and providing visual feedback to users. Hovering over action buttons triggers visual cues, making it easier for users to identify interactive elements.

![Hover](https://github.com/pankhis/reimplementation-front-end/assets/142809941/d48a7dbf-daa6-4dab-a2e4-b17e68bd15c8)


### Customized Page Headers

Page headers are now customized based on the user's role, offering a personalized experience. Depending on who is signing in, the page headers dynamically adjust to display relevant information, improving user engagement.

#### When user is an Instructor

![Inst_Name](https://github.com/pankhis/reimplementation-front-end/assets/142809941/c26b1c56-5c9e-4f1c-8810-27419c0a9e4d)


#### When user is a TA

![TAed](https://github.com/pankhis/reimplementation-front-end/assets/142809941/0e71cbd4-a890-41f0-ab2f-bdb1957318ce)


### Enhanced Search Functionality

Implemented a search functionality based on instructors, allowing users to quickly find relevant information. Users can now easily search for instructors, streamlining the navigation process and improving user experience.

![Instructor2](https://github.com/pankhis/reimplementation-front-end/assets/142809941/b817f43f-b821-4259-bede-69264a81dbf1)


### Modal Dialogue Box for Course Information

Added a link on the course name that opens a modal dialogue box, displaying detailed course information. This feature provides users with quick access to essential course details without navigating away from the current page.

![View_Course](https://github.com/pankhis/reimplementation-front-end/assets/142809941/abd56445-4bb3-4735-8c52-7bc1c6cadbc2)


### Improved User Dropdown Selection

During the instructor selection process, all users were displayed in the dropdown menu, leading to potential confusion and inefficiency. Now, only actual instructors are shown, streamlining the selection process.

![Dropdown](https://github.com/pankhis/reimplementation-front-end/assets/142809941/bbb59262-a215-4524-8978-8e502d5fa2a1)


### Code Refactoring and Optimization

Conducted code refactoring to enhance usability, maintainability, and performance. Added relevant comments to the codebase for improved understanding and documentation. Optimized UI code and made code snippets as independent as possible for better modularity and scalability.

<div style="display: flex;">
  <img src="https://github.com/pankhis/reimplementation-front-end/assets/142809941/d8109e06-1c1f-4a49-a38c-cc9cc22845f5" alt="Old Refactor" width="500" height="auto">
  <img src="https://github.com/pankhis/reimplementation-front-end/assets/142809941/55f5e9bb-b1ab-4ec7-9a6b-f3c58d5164a0" alt="New Refactor" width="500" height="auto">
</div>

<div style="display: flex;">
  <img src="https://github.com/pankhis/reimplementation-front-end/assets/142809941/45ea5bd5-daf4-40fb-a9cc-de8f0d46d4bb" alt="Old Refactor" width="500" height="auto">
  <img src="https://github.com/pankhis/reimplementation-front-end/assets/142809941/c15ff801-1db2-4832-bf02-26af77ae38d3" alt="New Refactor" width="400" height="auto">
</div>


## Files Modified

- [Course.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/Course.tsx)
- [CourseColumns.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseColumns.tsx)
- [CourseCopy.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseCopy.tsx)
- [CourseDelete.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseDelete.tsx)
- [CourseDetails.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseDetails.tsx)
- [CourseEditor.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseEditor.tsx)
- [CourseUtil.tsx](https://github.com/pankhis/reimplementation-front-end/blob/main/src/pages/Courses/CourseUtil.ts)
- [interfaces.ts](https://github.com/pankhis/reimplementation-front-end/blob/main/src/utils/interfaces.ts)

## Design Patterns

### Single Responsibility Principle (SRP)

A class should have only one reason to change, meaning it should have only one responsibility.  
**Implementation:** Each component or class in the codebase is designed to handle a single responsibility, such as managing course data, rendering UI components, or handling user authentication.

### Separation of Concerns (SoC)

The principle of separating a computer program into distinct sections, such that each section addresses a separate concern.  
**Implementation:** The codebase is structured to separate concerns related to data management, user interface rendering, and business logic, promoting modular and maintainable code.

### Strategy Pattern

A behavioral design pattern that defines a family of algorithms, encapsulates each algorithm, and makes them interchangeable.  
**Implementation:** The strategy pattern is applied to customize page headers dynamically based on the user's role. Different strategies for header customization are defined and selected at runtime based on the current user's role.

### Observer Pattern

A behavioral design pattern where an object, known as the subject, maintains a list of its dependents, called observers, and notifies them of any state changes.  
**Implementation:** The observer pattern is used to implement hover effects on action buttons. Observers are registered to listen for mouse hover events, and when triggered, they update the UI to provide visual feedback to users.

### Decorator Pattern

A structural design pattern that allows behavior to be added to individual objects dynamically, without affecting the behavior of other objects from the same class.  
**Implementation:** The decorator pattern is employed to add hover effects to action buttons without modifying their core behavior. Hover functionality is dynamically added to button components, enhancing their visual appearance.

### Template Method Pattern

A behavioral design pattern that defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps of the algorithm without changing its structure.  
**Implementation:** The template method pattern is utilized in rendering page headers based on the user's role. A template method defines the overall structure of the header, while specific methods are overridden in subclasses to customize header content for different user roles.

## Test Plan

Since the changes revolve around UI implementation, the features need to be manually checked on the webpages.

1. Check if instructor column is visible when logged in as an admin/superadmin
2. Check if the buttons show some text on hovering the icons
3. Verify that the page header changes based on the role of the logged-in user
4. Verify if the search functionality is working for Searching Instructors
5. Check if there is a link on the course name to view the course information
6. Check if only instructors are seen in the drop-down while creating the course

## Important Links

- [Pull Request](https://github.com/expertiza/reimplementation-front-end/pull/43)
- [GitHub Repo](https://github.com/pankhis/reimplementation-front-end/tree/main)

## Team

### Mentor
- Riya Gori

### Members
- Aniket Singh Shaktawat <ashakta@ncsu.edu>
- Pankhi Saini <psaini@ncsu.edu>
- Siddharth Shah <ssshah26@ncsu.edu>

# CSC/ECE 517 Fall 2023 - E2361. Create a page to create and update a Questionnaire in ReactJS

## Expertiza
Expertiza is a Ruby on Rails based open source project. Instructors have the ability to add new projects, assignments, etc., as well as edit existing ones. Later on, they can view student submissions and grade them. Students can also use Expertiza to organize into teams to work on different projects and assignments and submit their work. They can also review other students' submissions.

## Problem Statement
The current user interface for the page that encompasses Questionnaire metadata and associated Questions presents several usability and functionality issues. To enhance the user experience and streamline the interface, the following problems need to be addressed:

### For the Questionnaire Metadata Section:

- The current layout displays fields in a row format, which is not user-friendly. All fields (Min Score, Max Score, and Private) should be arranged in a single column for improved clarity and usability.
- Min Score and Max Score inputs should only accept numerical values to ensure data integrity and prevent incorrect data entry.
- The "Is this Review private" field, currently presented as a dropdown, should be converted into a checkbox for a more intuitive and straightforward selection.

### For the Associated Questions Section:
- The process of adding a new question involves an unnecessary sequence of input fields, including an "Add" button. This should be simplified by placing the "Add" button at the bottom of the list of available questions for a more streamlined user experience.
- The "Remove" button for each question should be relocated to the end of the row to avoid accidental deletion and enhance the user interface's consistency.
- The "Seq" field, which represents the sequence of questions, should be disabled for editing to prevent unintentional changes.
- The "Type" field should be transformed into a dropdown menu, allowing users to select the question type during the question creation process.
- The "Weight" field should only accept numeric values to ensure data accuracy and prevent incorrect data entry.
- The alignment of the "Edit/View Advice" button needs to be adjusted for improved visual consistency.
- The "Edit/View Advice" page can remain as it is, without any significant changes.
- The "Import" and "Export" buttons at the bottom of the page should trigger a modal dialog instead of opening a new page, as referenced in UserEditor.tsx of the repository.
- The Import and Export functionalities should handle data in the required format, without the need to add data to the backend. This simplifies data management and improves overall usability.
- It is also suggested to remove the "Add question weight" button as it does not serve a practical purpose, and the "text area size" field should be pre-populated with default values (e.g., 80 and 1) to enhance user convenience.

## Database
Since we do not have a database to implement in the reimplementation_front_end GitHub repo, we had to mock the databases and the API. Firstly, we created a new JSON object. For these we created a dictionary having the relevant data and appropriate structure. We added dummy data for each question and passed this list of dictionary to our front-end application.

The structure is as follows:

![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/1f2623c5-21ca-4f2e-9631-e9026a432e52)

## Tasks that were accomplished:

### Part 1

- Created a UI Page for editing Questionnaire
- All the fields should be are displayed in row format instead of column format as is the case in the old UI (Min Score, Max Score, and Private)
- Min Score, Max Score can now only be numbers
- Review private field is now a checkbox instead of dropdown.

### Part 2

- Add button is now at the bottom of the questionnaire
- Remove button for a Question is now at the end of that row and not at the start
- Seq field is now disabled for edit
- Type field is now a dropdown and the user can select the type while creating the Question
- Weight field is now numeric
- Edit/View Advice button is now aligned properly
- Edit/View Advice page is as it is.
- Import and Export buttons at the bottom now display a Modal instead of showing a new page.
- Import and Export functionality now get or export the data in a format that is required.

## Features Implemented
Added a new option in manage tab to route the user to our edit questionnaire page.
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/69c8c0d4-cc61-4100-a9f9-82cbe286013a)


Implemented the UI according to requirements given under task 1:
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/f39579f0-774e-4c5d-8c64-587111c06b36)


Implemented the UI according to requirements given under task 2:
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/d1bafff1-9c73-4e6c-8847-7230f9e15e54)
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/c7dc72f5-5b2b-44de-919d-f672a2355abb)

Implemented import modal:
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/b6070758-3a91-4445-8708-6d3d59566808)


Implemented export modal:
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/3520d73c-f3f7-4052-8aac-9c2f443be7da)


The final implementation:
![image](https://github.com/subhang51011/reimplementation-front-end/assets/56782318/0ca2ffcc-a960-4518-b351-479d01e6c827)


## Team
### Mentor
Kartiki Bhandakkar

### Members
- Shreya Vaidya <svaidya6@ncsu.edu>
- Shonil Bhide <sbhide@ncsu.edu>
- Subhang Boorlagadda <sboorla@ncsu.edu>

To learn React, check out the [React documentation](https://reactjs.org/).

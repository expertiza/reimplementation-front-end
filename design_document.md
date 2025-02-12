# Design guidelines for Reimplementation of Expertiza

This document outlines the common design features to be followed when developing views in the Expertiza environment.

## Icon Library

Icons are available in four sizes: 16, 24, 32, and 48. However, it is possible that not all icons are available in every size. Edit the size number as needed; everything else will remain the same.
**Sr. No.** | **Element Name** | **Image** | **Guide**	
|---|---|---|---|
|  1 |  Add assignment | ![Add Assignment](public/assets/icons/add-assignment-24.png)  | To add 'add assignment' icon, use path **```/public/assets/icons/add-assignment-24.png```** |
|  2 |  Add Teaching assistant | ![Add TA](public/assets/icons/add-ta-24.png)  | To add 'add TA' icon, use path **```public/assets/icons/add-ta-24.png```** |
|  3 |  Add Private | ![Add Private](public/assets/icons/add-private-24.png)  | To add 'add private' icon, use path **```public/assets/icons/add-private-24.png```** |
|  4 |  Add Public | ![Add Public](public/assets/icons/add-public-24.png)  | To add 'add public' icon, use path **```public/assets/icons/add-public-24.png```** |
|  5 |  Add Signup Sheet | ![Add Signup sheet](public/assets/icons/add-signup-sheet-24.png)  | To add 'add signup sheet' icon, use path **```public/assets/icons/add-signup-sheet-24.png```** |
|  6 |  Assign Course Blue | ![Assign Course Blue](public/assets/icons/assign-course-blue-24.png)  | To add 'Assign Course Blue' icon, use path **```public/assets/icons/assign-course-blue-24.png```** |
|  7 |  Assign Course Green | ![Assign Course Green](public/assets/icons/assign-course-green-24.png)  | To add 'Assign Course Green' icon, use path **```public/assets/icons/assign-course-green-24.png```** |
|  8 |  Assign survey to | ![Assign survey to](public/assets/icons/assign-survey-24.png)  | To add 'Assign survey to' icon, use path **```public/assets/icons/assign-survey-24.png```** |
|  9 |  Check | ![Check](public/assets/icons/Check-icon.png) | To add 'Check' icon, use path **```public/assets/icons/Check-icon.png```** |
|  10 | Copy | ![Copy](public/assets/icons/Copy-icon-24.png)  | To add "Copy" icon, use path **```public/assets/icons/Copy-icon-24.png```** |
|  11 |  Create Team | ![Create Team](public/assets/icons/create-teams-24.png)  | To add 'Create Team' icon, use path **```public/assets/icons/create-teams-24.png```** |
|  12 |  Delete | ![Delete](public/assets/icons/delete-icon-24.png)  | To add "Delete" icon, use path **```public/assets/icons/delete-icon-24.png```** |
|  13 |  (General) Edit | ![Edit](public/assets/icons/edit-icon-24.png)  | To add "Edit" icon, use path **```public/assets/icons/edit-icon-24.png```** |
|  14 |  Edit Signup sheet | ![Edit Signup sheet](public/assets/icons/edit-signup-sheet-24.png)  | To add "Edit Signup sheet" icon, use path **```public/assets/icons/edit-signup-sheet-24.png```** |
|  15 |  Info | ![Info](public/assets/icons/info.png) | To add "Info" icon, use path **```public/assets/icons/info.png```** |
|  16 | List All | ![List All](public/assets/icons/image8.png)  | To add "List All" icon, add class as "glyphicon glyphicon-list-alt" |
|  17 |  List Submissions | ![List Submissions](public/assets/icons/List-submisstions-24.png)  | To add "List Submissions" icon, use path **```public/assets/icons/List-submissions-24.png```** |
|  18 |  Make public from private | ![Make public from private](public/assets/icons/lock-off-disabled-icon-24.png)  | To add "Make public from private" icon,  use path **```public/assets/icons/lock-off-disabled-icon-24.png```**   |
|  19 |  Private | ![Private](public/assets/icons/lock-disabled-icon-24.png)  | To add "Private" icon,  use path **```public/assets/icons/lock-disabled-icon-24.png```**   |
|  20 |  Remove from Course | ![Remove from Course](public/assets/icons/remove-from-course-24.png)  | To add "Remove from Course" icon,  use path **```public/assets/icons/remove-from-course-24.png```**   |
|  21 |  Run Lottery | ![Run Lottery](public/assets/icons/run-lottery.png)  | To add "Run Lottery" icon,  use path **```public/assets/icons/run-lottery.png```**   |
|  22 | Signup | ![Signup](public/assets/icons/signup.png) | To add "Signup" icon, use path **```public/assets/icons/signup.png```** |
|  23 |  Search in data | ![Search in data](public/assets/icons/view-publish-rights-24.png)  | To add "Search in data" icon,  use path **```public/assets/icons/view-publish-rights-24.png```**   |
|  24 | Uncheck | ![Uncheck](public/assets/icons/Uncheck-icon.png) | To add "Uncheck" icon, use path **```public/assets/icons/Uncheck-icon.png```** |
|  25 | View Delayed Mailer | ![View Delayed Mailer](public/assets/icons/view-delayed-mailer.png) | To add "View Delayed Mailer" icon, use path **```public/assets/icons/view-delayed-mailer.png```** |
|  26 |  View Review Report | ![View Review Report](public/assets/icons/view-review-report-24.png)  | To add "View Review Report " icon,  use path **```public/assets/icons/view-review-report-24.png```**   |
|  27 |  View Scores | ![View Scores](public/assets/icons/view-scores-24.png)  | To add "View Score" icon,  use path **```public/assets/icons/view-scores-24.png```**   |
|  28 |  View Suggestions | ![View Suggestions](public/assets/icons/view-suggestion-24.png)  | To add "View Suggestions" icon,  use path **```public/assets/icons/view-suggestion-24.png```**   |
|  29 |  View Survey | ![View Survey](public/assets/icons/view-survey-24.png)  | To add "View Survey" icon,  use path **```public/assets/icons/view-survey-24.png```**   |
|  30 | View Grade Summary | ![View Grade Summary](public/assets/icons/360-dashboard-24.png)  | To add "View Grade Summary" icon, use path **```public/assets/icons/360-dashboard-24.png```** |
---

## Buttons : 

The default color for buttons is red 

**Sr. No.** | **Element Name** | **Image** | **Guide** | **Class**	
|---|---|---|---|---|
|  1 |  Button - Default style | *to be added*  | Default button | ```btn btn-default btn-md``` |
|  2 |  Button - Success style | *to be added*  | For accepting. | ```btn btn-success btn-md``` |
|  3 |  Button - Danger style | *to be added*  | For rejecting. | ```btn btn-danger btn-md``` |
|  4 |  Button - New style | *to be added*  | For create buttons alone. | ```btn btn-primary pull-right new-button btn-md``` |

---

## Tables :

For the tables, we recommend using bootstrap table class to make tables looks unified. We already include bootstrap reference, feel free to reference that table styles. For react.js tables, we can still use [react-bootstrap-table](http://allenfang.github.io/react-bootstrap-table/) to make tables unified.

The class to be used in a table tag is ```table table-striped```.

---

## Notifications :

**Sr. No.** | **Element Name** | **Image** | **Guide**	
|---|---|---|---|
|  1 |  Success | *to be added*  | For notification, add class as ```flash_note alert alert-success``` |
|  2 |  Error | *to be added*  | For notification, add class as ```flash_note alert alert-danger``` |
|  3 |  Info | *to be added*  | For notification, add class as ```flash_note alert alert-info``` |
|  3 |  Warn | *to be added*  | For notification, add class as ```flash_note alert alert-warning``` |

---

## Text :

* General Font name: ```verdana,arial,helvetica,sans-serif```

* Headings
Headings/ Main title of page should be given in ```<h2>Title</h2>``` tag

* Capitalization:
    - Use camel case for headings.
    - Other text should have only the first letter of the first word capitalized, with all subsequent words in lowercase.

* Font Sizes & Line Heights:
   - Standard Text:
        - Font size: 13px
        - Line height: 30px
   - Subheadings:
        - Font size: 1.2em
        - Line height: 18px 
   - Table Data:
        - Font size: 15px
        - Line height: 1.428em 

* Color
	- Menu bar - #FFFFFF; //for menubar with red background
	- Other titles/ text - #333; 
	- Text on red buttons - #fff;

## Forms :

All form elements must have the class ```form-control```

If it is a online form (an input with a submit button), the form must be given a class ```form-inline```. And appropriate width must be added to that element to make it uniform with the page.


## Dropdowns and Toggling dropdowns :

## Pagination: 

Disable pagination components when fewer than 10 items are displayed on the page.

Pagination Component is already included in the Repository under **```src\components\Table\Pagination.tsx```**. We recommend using this component to maintain consistency.

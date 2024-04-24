export interface ReviewItem {
  id: number;
  question: string;
  score: number;
  comment: string;
}

interface Reviews {
  [key: string]: ReviewItem[];
}

const reviews : Reviews = {
  "1": [
    {
      id: 1,
      question: 'The code is written in a clean and readable way. (Mention any relevant details.) [Max points: 5]',
      score: 5,
      comment: 'The code has a clear structure with appropriate indentation and spacing. It is easy to visually parse and understand the code\'s flow. There are appropriate comments where expected\n\nJust one negative point: Quite a lot dead(commented out) code is present. This could have been removed in a refactor',
    },
    {
      id: 2,
      question: 'Each method is performing only one task. (One method should only handle one task, if there are multiple tasks, there should be function calls. Mention any relevant details.) [Max points: 5]',
      score: 5,
      comment: 'They managed task organization very well by providing distinctive methods to implement various functionalities within their code logic.',
    },
    {
      id: 3,
      question: 'Variable and method names are indicative of what the variables are storing/handling. (Mention any relevant details.) [Max points: 5]',
      score: 5,
      comment: 'They provided indictive way of using variable and method names here in the code for instance they used date, category, price_min, price_max, event_name which follows perfect naming convention for storing and handling the necessary data.',
    },
    {
      id: 4,
      question: 'Commit messages are indicative of what changes were made in the commit. (Mention any relevant details.) [Max points: 5]',
      score: 3,
      comment: 'Most of the messages are good, but there are some commits which add multiple unrelated changes and their message is not clearly indicative of the change.\n\nFor example: "Added Room Booking Part" has a lot of file changes, and it is not clear if the commit added event creation or ticket booking feature.',
    },
    {
      id: 5,
      question: 'This system works as it is supposed to. (If you found any problems in the first round, did the authors fix them? Comment on any functionality that is still failing.) [Max points: 5]',
      score: 3,
      comment: 'Some issues mentioned in round 1 that were not fixed:\n1) URL manipulation:\nI was able to edit the review written by another attendee by manipulating the URL\nI was able to delete a room as an attendee\n\n2) In ReviewIndex view, filtering is done based on user email. But user email is not visible in each review, hence it is not clear if the filter was succesfully applied\n\n3) The project document mentions that every instance of event ticket must have its own confirmation number. But when I purchase bulk tickets, all of them are having the same confirmation number',
    },
    {
      id: 6,
      question: 'This team made commits in round 2.',
      score: 0,
      comment: 'No, the team did not made any commits in the second round',
    },
    {
      id: 7,
      question: 'The README file contains all the information needed, and the code is well documented, with adequate comments to explain the coding. [Max points: 5]',
      score: 5,
      comment: 'The README is exceptionally detailed and contains all the required information. Great job!',
    },
    {
      id: 8,
      question: 'Has the testing been done properly for at least one model? [Max points: 5]',
      score: 5,
      comment: 'They did testing perfectly well for two models here for both admin and user modal tests',
    },
    {
      id: 9,
      question: 'Has the testing been done properly for at least one controller? [Max points: 5]',
      score: 5,
      comment: 'Thorough testing has been conducted on three key controllers: admins_controller, home_controller, and users_controller',
    },
  ],
  "2": [
    {
      id: 1,
      question: 'Each method is performing only one task. (One method should only handle one task, if there are multiple tasks, there should be function calls. Mention any relevant details.) [Max points: 5]',
      score: 5,
      comment: '',
    },
  ],
};

const feedbacks : Reviews = {
  "1": [
    {
      id: 1,
      question: 'This reviewer appeared to understand my work. [Max points: 5]',
      score: 5,
      comment: 'Yes, the reviewer understood the work correctly',
    },
    {
      id: 2,
      question: 'This reviewer\'s comments helped me improve my work. [Max points: 5]',
      score: 5,
      comment: 'Yes, the reviewers comment helped me to improve my work.',
    },
    {
      id: 3,
      question: 'The tone of this review was respectful [Max points: 5]',
      score: 5,
      comment: 'Yes, the tone was good',
    },
    ]
};



export const getReviewItems = (setId: string): ReviewItem[] => {
  return reviews[setId] || [];
};

export const getFeedbackItems = (setId: string): ReviewItem[] => {
  return feedbacks[setId] || [];
};

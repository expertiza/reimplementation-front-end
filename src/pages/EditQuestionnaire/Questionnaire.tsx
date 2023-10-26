const Questionnaire = () => {
  const sample_questionnaire = {
    title: "Edit Teammate Review",
    seq: [1.0, 2.0, 3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0, 11.0],
    questions: [
      "How many times was this person late to meetings?",
      "How many times did this person not show up?",
      "How much did this person offer to do in this project?",
      "What fraction of the work assigned to this person did s(he) do?",
      "Did this person do assigned work on time?",
      "How much initiative did this person take on this project?",
      "Did this person try to avoid doing any task that was necessary?",
      "How many of the useful ideas did this person come up with?",
      "What fraction of the coding did this person do?",
      "What fraction of the documentation did this person write?",
      "How important is this person to the team?",
    ],
    type: [
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
      "Criterion",
    ],
    weight: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    text_area_size: [
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
      "50, 30",
    ],
    max_label: [
      "almost never",
      "almost never",
      "100%-80%",
      "100%-80%",
      "always",
      "a whole lot",
      "not at all",
      "100%-80%",
      "100%-80%",
      "100%-80%",
      "indispensable",
    ],
    min_label: [
      "almost always",
      "almost always",
      "20%-0%",
      "20%-0%",
      "never",
      "total deadbeat",
      "absolutely",
      "20%-0%",
      "20%-0%",
      "20%-0%",
      "redundant",
    ],
  };
  return (
    <div>
      <div className="container">
        <h1 className="mt-4">{sample_questionnaire.title}</h1>
        <div className="row m-2">
          <div className="col-1">Name:</div>
          <div className="col-4">
            <input
              className="form-control"
              type="text"
              placeholder="Copy of copy of new teammate review"
            ></input>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-2">Min item score:</div>
          <div className="col-2">
            <input className="form-control" type="text" placeholder="0"></input>
          </div>
          <div className="col-2">Max item score:</div>
          <div className="col-2">
            <input className="form-control" type="text" placeholder="5"></input>
          </div>
          <div className="col-2">Is this Teammate review private:</div>
          <div className="col-2">
            <select className="form-select">
              <option value="yes">yes</option>
              <option value="no" selected>
                no
              </option>
            </select>
          </div>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default Questionnaire;

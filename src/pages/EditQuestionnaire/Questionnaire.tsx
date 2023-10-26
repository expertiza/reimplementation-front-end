const Questionnaire = () => {
  const sample_questionnaire = {
    title: "Edit Teammate Review",
    data: [
      {
        seq: 1.0,
        question: "How many times was this person late to meetings?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
      {
        seq: 2.0,
        question: "How many times did this person not show up?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "almost never",
        min_label: "almost always",
      },
      {
        seq: 3.0,
        question: "How much did this person offer to do in this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 4.0,
        question: "What fraction of the work assigned to this person did s(he) do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 4.5,
        question: "Did this person do assigned work on time?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "always",
        min_label: "never",
      },
      {
        seq: 5.0,
        question: "How much initiative did this person take on this project?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "a whole lot",
        min_label: "total deadbeat",
      },
      {
        seq: 6.0,
        question: "Did this person try to avoid doing any task that was necessary?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "not at all",
        min_label: "absolutely",
      },
      {
        seq: 7.0,
        question: "How many of the useful ideas did this person come up with?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 8.0,
        question: "What fraction of the coding did this person do?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 9.0,
        question: "What fraction of the documentation did this person write?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "100%-80%",
        min_label: "20%-0%",
      },
      {
        seq: 11.0,
        question: "How important is this person to the team?",
        type: "Criterion",
        weight: 1,
        text_area_size: "50, 30",
        max_label: "indispensable",
        min_label: "redundant",
      },
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
        <div className="row m-2">
          <div className="col-1">
            <button type="button" className="btn btn-primary">
              Add
            </button>
          </div>
          more
          <div className="col-2">
            <select className="form-select">
              <option value="Criterion" selected>
                Criterion
              </option>
            </select>
          </div>
          question(s)
          <div className="mr-6 col-2">Add question weight</div>
          <div className="col-1">
            <input className="form-control" type="text" placeholder="1"></input>
          </div>
        </div>
<br/>
<div className="row m-2">
              <div className="col-1">Action</div>
              <div className="col-1">
                Seq
              </div>
              <div className="col-3">
                Question
              </div>
              <div className="col-1">
                Type
              </div>
              <div className="col-1">
                Weight
              </div>
            </div>
        {sample_questionnaire.data.map((item) => {
          return (
            <div className="row m-2">
              <div className="col-1"><a href="/">Remove</a></div>
              <div className="col-1">
                <input className="form-control" type="text" value={item.seq}></input>
              </div>
              <div className="col-3">
                <input className="form-control" type="text" value={item.question}></input>
              </div>
              <div className="col-1">
                <input className="form-control" type="text" value={item.type}></input>
              </div>
              <div className="col-1">
                <input className="form-control" type="text" value={item.weight}></input>
              </div>
              text_area_size
              <div className="col-1">
                 <input className="form-control" type="text" value={item.text_area_size}></input>
              </div>
              max_label
              <div className="col-1">
                 <input className="form-control" type="text" value={item.max_label}></input>
              </div>
              min_label
              <div className="col-1">
                 <input className="form-control" type="text" value={item.min_label}></input>
              </div>
            </div>
          );
        })}
        <div className="col-2 m-2">
            <button type="button" className="btn btn-primary">
              Save all questions
            </button>
          </div>
        <hr/>
        <div><a href="/">Import Questionnaire</a> | <a href="/">Export Questionnaire</a></div>
      </div>
    </div>
  );
};

export default Questionnaire;

import React, { useState } from "react";
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
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div>
      <div className="container">
        <h1 className="mt-4">{sample_questionnaire.title}</h1>
        <div className="row m-2">
          <div className="col-6">
            Min item score:
            <input
              className="form-control"
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              // Using parseInt to convert the input value to a number
            ></input>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            Max item score:
            <input
              className="form-control"
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value, 10))}
              // Using parseInt to convert the input value to a number
            ></input>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            Is this Teammate review private:
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
          </div>
        </div>
        <div className="row m-2">
          <div className="col-6">
            <button
              type="button"
              style={{ borderColor: "black" }}
              className="btn btn-light m-2"
            >
              Update questionnaire parameters
            </button>
          </div>
        </div>
        <hr />
        <div className="row m-2">
          <div className="col-1">
            <button
              type="button"
              style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" }}
              className="btn btn-primary"
            >
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
        <br />
        <div className="row m-2">
          <div className="col-1">
            <strong>Action</strong>
          </div>
          <div className="col-1">
            <strong>Seq</strong>
          </div>
          <div className="col-3">
            <strong>Question</strong>
          </div>
          <div className="col-1">
            <strong>Type</strong>
          </div>
          <div className="col-1">
            <strong>Weight</strong>
          </div>
        </div>
        {sample_questionnaire.data.map((item) => {
          return (
            <div className="row m-2">
              <div className="col-1">
                <a href="/" style={{ color: "#b28b66", textDecoration: "none" }}>
                  Remove
                </a>
              </div>
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.seq}
                ></input>
              </div>
              <div className="col-3">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.question}
                ></input>
              </div>
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.type}
                  disabled
                ></input>
              </div>
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.weight}
                ></input>
              </div>
              text_area_size
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.text_area_size}
                ></input>
              </div>
              max_label
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.max_label}
                ></input>
              </div>
              min_label
              <div className="col-1">
                <input
                  className="form-control"
                  style={{ borderColor: "black" }}
                  type="text"
                  value={item.min_label}
                ></input>
              </div>
            </div>
          );
        })}
        <div className="row m-2">
        <div className="col-6">
          <button
            type="button"
            style={{ backgroundColor: "#4d8ac0", borderColor: "#4d8ac0" }}
            className="btn btn-primary"
          >
            Save all questions
          </button>
        </div>
        <div className="col-6">
          <button
            type="button"
            style={{ borderColor: "black" }}
            className="btn btn-light"
          >
            Edit/View Advice
          </button>
        </div>
        </div>
        <hr />
        <div>
          <a href="/" style={{ color: "#b28b66", textDecoration: "none" }}>
            Import Questionnaire
          </a>{" "}
          |{" "}
          <a href="/" style={{ color: "#b28b66", textDecoration: "none" }}>
            Export Questionnaire
          </a>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
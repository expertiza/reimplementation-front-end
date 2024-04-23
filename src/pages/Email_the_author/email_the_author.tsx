import React from "react";
import "./email_the_author.css";
const Email_the_author: React.FC = () => {
  return (
    <div id="div1">
      <h2>Email the author</h2>
      <div>
        <label htmlFor="subject">Subject:</label>
        <input type="text" id="subject" name="subject" />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea id="description" name="description" ></textarea>
      </div>
      <button id="b1">Send</button>
    </div>
  );
};

export default Email_the_author;

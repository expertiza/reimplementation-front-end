import React from "react";
import "./email_the_author.css";
import { useTranslation } from "react-i18next"; // Importing useTranslation hook

const Email_the_author: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation hook

  return (
    <div id="div1">
      <h2>{t('email_the_author.title')}</h2>
      <div>
        <label htmlFor="subject">{t('email_the_author.subject')}</label>
        <input type="text" id="subject" name="subject" />
      </div>
      <div>
        <label htmlFor="description">{t('email_the_author.description')}</label>
        <textarea id="description" name="description"></textarea>
      </div>
      <button id="b1">{t('email_the_author.send')}</button>
    </div>
  );
};

export default Email_the_author;
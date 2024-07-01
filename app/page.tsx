"use client"

import styles from "./page.module.css";
import React from 'react';

const FeedbackForm: React.FC = () => {
  return (
    <div className={styles.container}>
    <div className={styles.profile}>
      <img src="/profile.png" alt="Profile" className={styles['profile-image']} />
    </div>
    <div className={styles.feedback}>
      <div className={styles['thumbs-up']}>
        <img src="/thumbs-up.png" alt="Thumbs Up" />
      </div>
      <div className={styles['thumbs-down']}>
        <img src="/thumbs-down.png" alt="Thumbs Down" />
      </div>
    </div>
    <div className={styles.message}>
      <label htmlFor="message">메세지 소개</label>
      <textarea id="message" placeholder="Type your message here"></textarea>
      <p>Your message will be copied to the support team.</p>
    </div>
  </div>
  );
};

export default FeedbackForm;
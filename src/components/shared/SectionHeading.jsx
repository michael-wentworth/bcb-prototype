import React from 'react';
import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, description, actions, as: As = 'h2' }) {
  return (
    <header className={styles.root}>
      <div className={styles.text}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <As className={styles.title}>{title}</As>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

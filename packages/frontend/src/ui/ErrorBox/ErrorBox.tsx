import styles from "./ErrorBox.module.scss";

import React from "react";
import clsx from "clsx";

interface IErrorBoxProps {
  className?: string;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const ErrorBox: React.VFC<IErrorBoxProps> = React.memo((props) => {
  const { className, title, message, children } = props;

  return (
    <div className={clsx(className, styles.root)}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
});

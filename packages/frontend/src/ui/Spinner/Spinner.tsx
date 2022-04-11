import styles from "./Spinner.module.scss";

import React from "react";
import clsx from "clsx";

interface ISpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner: React.VFC<ISpinnerProps> = React.memo((props) => {
  const { className, size = 16 } = props;

  return (
    <svg className={clsx(className, styles.loader)} viewBox="0 0 50 50" width={size} height={size}>
      <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
    </svg>
  );
});

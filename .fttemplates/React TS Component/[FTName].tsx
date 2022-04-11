import styles from "./[FTName].module.scss";

import React from "react";
import clsx from "clsx";

interface I[FTName]Props {
  className?: string;
  children?: React.ReactNode;
}

export const [FTName]: React.VFC<I[FTName]Props> = React.memo((props) => {
  const { className, children } = props;

  return (
    <div className={clsx(className, styles.root)}>
      <p>[FTName]</p>
      {children}
    </div>
  );
});

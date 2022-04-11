import styles from "./Button.module.scss";

import React from "react";
import clsx from "clsx";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.VFC<IButtonProps> = React.memo((props) => {
  const { className, children, disabled = false, ...buttonProps } = props;

  return (
    <button className={clsx(className, styles.root)} disabled={disabled} {...buttonProps}>
      {children}
    </button>
  );
});

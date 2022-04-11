import styles from "./Input.module.scss";

import React from "react";
import clsx from "clsx";

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "search" | "date";
}

export const Input: React.VFC<IInputProps> = React.memo((props) => {
  const { className, type = "text", ...inputProps } = props;

  return <input className={clsx(className, styles.root)} type={type} {...inputProps} />;
});

import styles from "./InputComponet.module.css";

interface InputProps {
  type?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
}

const InputComponent = ({
  type = "text",
  required = false,
  ...props
}: InputProps) => {
  const input: React.JSX.Element = (
    <input
      type={type}
      required={required}
      {...props}
      className={styles.input}
    />
  );

  return input;
};

export default InputComponent;

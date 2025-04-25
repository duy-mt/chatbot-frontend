// import React from "react";
import TextField from "@mui/material/TextField";
import { useState } from "react";
type Props = {
  name: string;
  type: string;
  label: string;
  onSubmit: (value: string) => void;
};
const CustomizedInput = (props: Props) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (value.trim()) {
        props.onSubmit(value)
        setValue("")
      }
    }
  }

  return (
    <TextField
      margin="normal"
      fullWidth
      minRows={3}
      maxRows={10}
      InputLabelProps={{ style: { color: "white" } }}
      name={props.name}
      label={props.label}
      type={props.type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      InputProps={{
        style: {
          width: "100%",
          borderRadius: 10,
          fontSize: 20,
          color: "white",
          whiteSpace: "pre-wrap"
        },
      }}
    />
  );
};

export default CustomizedInput;

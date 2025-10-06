import React from "react";

interface FileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onChange }) => {
  return (
    <input
      className="lj-input lj-file"
      type="file"
      accept="image/*"
      onChange={onChange}
    />
  );
};

export default FileInput;

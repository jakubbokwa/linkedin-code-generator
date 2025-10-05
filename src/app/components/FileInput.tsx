const FileInput = ({ onChange }) => {
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

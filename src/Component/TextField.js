import React from 'react';

export default ({
  type, name, placeholder, required, onChange,
}) => {
  const onChangeHandler = (event) => {
    onChange(event.target);
  };

  return (
    <div className="form-group">
      <input
        type={type}
        name={name}
        className="form-control"
        placeholder={placeholder}
        onChange={onChangeHandler}
        required={required}
      />
    </div>
  );
};

import React from 'react';

export default ({
  type, name, placeholder, required, onChange,
}) => (
  <div className="form-group">
    <input
      type={type}
      name={name}
      className="form-control"
      placeholder={placeholder}
      onChange={onChange}
      required={required}
    />
  </div>
);

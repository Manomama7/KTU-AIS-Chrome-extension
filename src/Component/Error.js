import React from 'react';

export default ({
  show, message,
}) => (
  <div className={`alert alert-danger${show ? ' show-alert' : ''}`}>
    <i className="fas fa-exclamation-circle" />
    {message}
  </div>
);

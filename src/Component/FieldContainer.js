import React from 'react';

export default ({
  disabled, minimized, children,
}) => (
  <fieldset disabled={disabled}>
    <div className={`login-form ${minimized ? 'minimized' : ''}`}>
      {children}
    </div>
  </fieldset>
);

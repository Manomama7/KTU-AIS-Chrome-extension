import React from 'react';

export default ({
  loading, success, handleSubmit, successText, headerText, children,
}) => (
  <div className={`login-container${loading ? ' logging-in' : ''}`}>
    <form
      className={`form-signin text-center ${success ? 'logged-in' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="d-flex mb-3 justify-content-start logo-container">
        <div className="login-success-bubble">
          {successText}
          <div className="arrow" />
        </div>

        <h1 className="login-header">
          {headerText}
        </h1>

        <div className="ml-4 text-white d-flex align-items-center loading-spinner">
          <i className="fas fa-pulse fa-spinner fa-2x" />
        </div>
      </div>

      {children}
    </form>
  </div>
);

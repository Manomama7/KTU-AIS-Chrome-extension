import React from 'react';
import './Login.css';
import Button from './Button';
import TextField from './TextField';
import ErrorBox from './Error';
import FancyForm from './FancyForm';

export default ({
  loading, success, error, handleFieldChange, handleSubmit,
}) => (
  <FancyForm
    loading={loading}
    success={success}
    handleSubmit={handleSubmit}
    successText="Hi, student!"
    headerText="Login"
  >
    <div className="mb-4">
      <TextField
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleFieldChange}
        required
      />

      <TextField
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleFieldChange}
        required
      />
    </div>

    <ErrorBox
      show={error}
      message="Wrong username or password"
    />

    <Button text="Log in" />
  </FancyForm>
);

import React from 'react';

const InputBox = ({ label, placeholder, value, onChange, type }) => {
  return (
    <div className="input-container">
      <label htmlFor={label}>{label}:</label>
      <input
        type={type}
        id={label}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
      />
    </div>
  );
}

export default InputBox;

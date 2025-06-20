import React from "react";

const ErrorDisplay = ({ error, className = "" }) => {
  if (!error) return null;

  return (
    <div className={`alert alert-danger d-flex align-items-center ${className}`} role="alert" style={{ marginBottom: 8, fontWeight: 500, fontSize: 15 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.964 0L.165 13.233c-.457.778.091 1.767.982 1.767h13.707c.89 0 1.438-.99.982-1.767L8.982 1.566zm-.982.874a.565.565 0 0 1 .964 0l6.853 11.667A.565.565 0 0 1 15.707 14H.293a.565.565 0 0 1-.49-.893L6.657 2.44zM8 5c-.535 0-.954.462-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 5zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
      </svg>
      {error}
    </div>
  );
};

export default ErrorDisplay; 
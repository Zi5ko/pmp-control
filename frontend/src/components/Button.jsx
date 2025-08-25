export function Button({ children, onClick, disabled = false, type = "button", className = "" }) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded text-white font-medium transition duration-150 
          ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} 
          ${className}`}
      >
        {children}
      </button>
    );
  }
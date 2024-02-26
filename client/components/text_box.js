import React, { useState } from 'react';




function TextInput({ parentVar,  onChange }) {
  // State to store the input value
  const [inputValue, setInputValue] = useState("");

  // Function to update the state based on input changes

  return (
    <div>
      <input
       type="text"
       value={parentVar}
       onChange={onChange}
       placeholder="great white shark"
      />
      <p></p>
    </div>
  );
}

export default TextInput;
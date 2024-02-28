import React, { useState } from 'react';

function TextBoxAdderPositive({ onValueChange }) {
  const [inputs, setInputs] = useState(['']);

  const addInput = () => {
    if (inputs.length < 3){
      setInputs([...inputs, '']);

    }
    else {
      alert('Number of descriptions limited to 3 for now.');
    }
  };

  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
    onValueChange(newInputs); // Assuming you want to lift state up to the parent
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <div key={index}>
        <input
          placeholder="An angry potato waving a pitchfork"
          type="text"
          style={{ width: '30vw' , borderRadius: '10px' , padding : "20px", fontSize : '20px'}}
          value={input}
          onChange={(event) => handleInputChange(index, event)}
        />
        </div>
      ))}
      
    </div>
  );
}
//<button onClick={addInput}>Add Description</button>

export default TextBoxAdderPositive;

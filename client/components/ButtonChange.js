import React, { useState } from 'react';


function ColorChangeButton({ base, change }) {
  const [buttonColor, setButtonColor] = useState(base); // Default color
  const [originalColor, setOriginalColor] = useState(change);
  const handleClick = () => {
    setButtonColor(change); // Change to a new color on click

    setTimeout(() => {
      setButtonColor(originalColor); // Revert to original color after 500ms
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      style={{color:buttonColor}}
    >
    </button>
  );
}

export default ColorChangeButton;

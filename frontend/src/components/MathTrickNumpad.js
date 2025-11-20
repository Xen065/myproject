import React from 'react';
import './MathTrick.css';

function MathTrickNumpad({ onInput, disabled }) {
  const handleClick = (value) => {
    if (!disabled) {
      onInput(value);
    }
  };

  return (
    <div className={`mathtrick-numpad ${disabled ? 'disabled' : ''}`}>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => handleClick('7')}>7</button>
        <button className="numpad-btn" onClick={() => handleClick('8')}>8</button>
        <button className="numpad-btn" onClick={() => handleClick('9')}>9</button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => handleClick('4')}>4</button>
        <button className="numpad-btn" onClick={() => handleClick('5')}>5</button>
        <button className="numpad-btn" onClick={() => handleClick('6')}>6</button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => handleClick('1')}>1</button>
        <button className="numpad-btn" onClick={() => handleClick('2')}>2</button>
        <button className="numpad-btn" onClick={() => handleClick('3')}>3</button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => handleClick('.')}>.</button>
        <button className="numpad-btn" onClick={() => handleClick('0')}>0</button>
        <button className="numpad-btn backspace" onClick={() => handleClick('backspace')}>
          ←
        </button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn negative" onClick={() => handleClick('-')}>
          -
        </button>
        <button className="numpad-btn clear" onClick={() => handleClick('clear')}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default MathTrickNumpad;

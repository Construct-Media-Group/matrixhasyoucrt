import { click } from "../sound/index.js";
import { boot } from "./screens.js";
import { stopSpeaking } from "./speak.js";
import pause from "./pause.js";

let terminalIsOn = false; 	

/**
 * Initializes and turns on the terminal.
 */
async function on() {
	if (terminalIsOn) {
	  console.log("Terminal is already on.");
	  return;
	}
  
	// Simulate a button click to start the terminal
	click();
  
	// Wait for the power to turn on
	await togglePower();
  
	// Boot the terminal system
	boot();
  
	terminalIsOn = true;
  }

/**
 * Deactivates the terminal.
 * It simulates a click, stops any ongoing speech synthesis,
 * and powers off the terminal.
 */
function off() {
	if (!terminalIsOn) {
	  console.log("Terminal is already off.");
	  return;
	}
  
	// Simulate a click action
	click();
  
	// Cease any speech synthesis
	stopSpeaking();
  
	// Turn off the terminal power
	togglePower(false);
  
	terminalIsOn = false;
  }

/**
 * Toggles the power state of a UI monitor element.
 * 
 * @param {boolean} on - Desired power state, defaults to true (on).
 */
async function togglePower(on = true) {
	// Short reference to avoid exceeding character limit
	const monitor = document.getElementById("monitor");
  
	// Toggle slider class to indicate power state
	document.querySelector("#slider").classList.toggle("on", on);
  
	// Set switch state opposite to power state
	document.querySelector("#switch").checked = !on;
  
	// Short pause for UI effect
	await pause(0.1);
  
	// Toggle monitor classes for on/off visual state
	monitor.classList.toggle("turn-off", !on);
	monitor.classList.toggle("off", !on);
  }

export { togglePower as power, on, off };

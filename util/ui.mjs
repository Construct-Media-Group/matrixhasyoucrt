import { on, off } from "./power.js";
import { click } from "../sound/index.js";
import { setVolume } from "./speak.js";
import { toggleFullscreen } from "./screens.js";

/**
 * Toggles the power state of the monitor.
 */
function togglePower() {
	// Get the monitor element
	const monitor = document.getElementById("monitor");
	// Check if the monitor is off
	const isOff = monitor.classList.contains("off");
	
	// Turn the monitor on or off based on its current state
	isOff ? on() : off();
  }


/**
 * Toggles the 'fly' class on the event's target element.
 * @param {Event} event - The event object provided by the listener.
 */
function fly(event) {
	// Access the element that triggered the event
	const targetElement = event.target;
	
	// Toggle the 'fly' class on the target element
	targetElement.classList.toggle("fly");
  }

/**
 * Handles click events by preventing the default action and
 * setting focus to the contenteditable element.
 *
 * @param {Event} event - The event object from the click.
 */
function handleClick(event) {
  // Prevent default event action if event object exists
  if (event) event.preventDefault();
  
  // Select the contenteditable element
  let input = document.querySelector("[contenteditable='true']");
  
  // If the element exists, set the focus to it
  if (input) input.focus();
}


/**
 * Sets the volume based on the event's target value.
 * @param {Object} event - The event object from the volume control.
 */
function handleVolume(event) {
	// Extract the volume value from the event target
	let value = event.target.value;
	// Update the volume to the new value
	setVolume(value);
  }

/**
 * Activates the selected theme and updates the body class to reflect the change.
 *
 * @param {Event} event - The event object from the click event on a theme button.
 * @param {string} name - The name of the theme to be activated.
 */
function theme(event, name) {
	// Trigger a click effect or analytics tracking
	click();

	// Deactivate all the elements with the class "theme"
	[...document.getElementsByClassName("theme")].forEach((element) =>
		element.classList.toggle("active", false)
	);

	// Activate the clicked theme button
	event.target.classList.add("active");

	// Update the body class to apply the selected theme
	document.body.classList = "theme-" + name;

	// Handle additional click behavior
	handleClick();
}

/**
 * Toggles fullscreen mode for the page.
 *
 * @param {Event} event - The event object from the click event on the fullscreen button.
 */
function fullscreen(event) {
	// Toggle the fullscreen state
	toggleFullscreen();

	// Remove focus from the target element after the action is performed
	event.target.blur();
}

/**
 * Global keydown listener that provides keyboard shortcuts for toggling fullscreen mode.
 *
 * @param {KeyboardEvent} event - The KeyboardEvent object from the keydown event.
 */
function globalListener(event) {
	const { keyCode } = event;

	if (keyCode === 122) { // F11 key code
		// Toggle fullscreen on F11 key press
		toggleFullscreen();
	} else if (keyCode === 27) { // ESC key code
		// Exit fullscreen on ESC key press
		toggleFullscreen(false);
	}
}

/**
 * Registers event handlers for various UI elements.
 */
function registerHandlers() {
	// Global keydown listener
	document.addEventListener("keydown", globalListener);
  
	// Theme handlers
	const setThemeRed = (e) => theme(e, 'red');
	const setThemeGreen = (e) => theme(e, 'green');
	const setThemeBlue = (e) => theme(e, 'blue');
  
	document.getElementById('theme-red').addEventListener('click', setThemeRed);
	document.getElementById('theme-green').addEventListener('click', setThemeGreen);
	document.getElementById('theme-blue').addEventListener('click', setThemeBlue);
  
	// Power handlers
	const switchToggle = document.getElementById('switch');
	const sliderToggle = document.getElementById('slider');
  
	switchToggle.addEventListener('click', togglePower);
	sliderToggle.addEventListener('click', togglePower);
  
	// Other UI handlers
	document.getElementById('fullscreen').addEventListener('click', fullscreen);
	document.getElementById('crt').addEventListener('click', handleClick);
	document.getElementById('sticky').addEventListener('click', fly);
	document.getElementById("dial").addEventListener("input", handleVolume);
  }

export { registerHandlers };
/* eslint "no-unused-expressions": "off" */
import { typeSound } from "../sound/index.js";
import say from "./speak.js";
import pause from "./pause.js";
import { loadTemplates } from "./screens.js";

// Command history
let prev = getHistory();
let historyIndex = -1;
let tmp = "";

/**
 * Retrieves the command history from the local storage.
 * @returns {Array} The command history.
 */
function getHistory() {
	// Retrieve the command history from local storage
	let storage = localStorage.getItem("commandHistory");
  
	let prev;
  
	if (storage) {
	  try {
		// Parse the stored data as JSON
		let json = JSON.parse(storage);
  
		// If the parsed data is an array, assign it to prev, otherwise assign an empty array
		prev = Array.isArray(json) ? json : [];
	  } catch (e) {
		// If there is an error parsing the JSON, assign an empty array to prev
		prev = [];
	  }
	} else {
	  // If there is no stored data, assign an empty array to prev
	  prev = [];
	}
  
	// Return the command history
	return prev;
  }


/**
 * Add command to history.
 *
 * @param {string} cmd - The command to be added to history.
 */
function addToHistory(cmd) {
  // Add command to the beginning of the history array
  prev = [cmd, ...prev];

  // Reset history index
  historyIndex = -1;

  // Clear temporary input
  tmp = "";

  try {
    // Store updated command history in local storage
    localStorage.setItem("commandHistory", JSON.stringify(prev));
  } catch (e) {
    // Ignore any errors that occur during storage
  }
}

/**
 * Converts a character that needs to be typed into something that can be shown on the screen.
 * Newlines become <br>,
 * Tabs become three spaces, and
 * Spaces become &nbsp;.
 * 
 * @param {string} char - The character to convert.
 * @returns {HTMLElement} - The converted character as an HTML element.
 */
function getChar(char) {
	let result;
  
	// Check if the input is a string
	if (typeof char === "string") {
	  // Check if the character is a newline
	  if (char === "\n") {
		result = document.createElement("br");
	  }
	  // Check if the character is a tab
	  else if (char === "\t") {
		let tab = document.createElement("span");
		tab.innerHTML = "&nbsp;&nbsp;&nbsp;";
		result = tab;
	  }
	  // Check if the character is a space
	  else if (char === " ") {
		let space = document.createElement("span");
		space.innerHTML = "&nbsp;";
		space.classList.add("char");
		result = space;
	  }
	  // If the character is neither a newline, tab, nor space, create a span element and set the text content to the character
	  else {
		let span = document.createElement("span");
		span.classList.add("char");
		span.textContent = char;
		result = span;
	  }
	}
  
	return result;
  }

/**
 * Simulates the typing of text within a given container element on the web page.
 * 
 * This function can handle both strings and arrays of strings, simulating the typing of 
 * text character by character, including configurable delays between characters and lines.
 * When given an array of strings, it types each string on a new line, waiting for a 
 * specified amount of time before typing the next line. It can also clear the container before typing,
 * add a CSS class to the container, and stop blinking cursor effect after typing is completed.
 * 
 * @param {String|Array<String>} text - The text to be typed. Can be a single string or an array of strings.
 * @param {Object} [options] - Configuration options for the typing effect.
 * @param {Number} [options.wait=30] - Time in milliseconds to wait between typing each character.
 * @param {Number} [options.initialWait=1000] - Time in milliseconds to wait before starting to type.
 * @param {Number} [options.lineWait=100] - Time in milliseconds to wait between typing each line (when text is an array).
 * @param {Number} [options.finalWait=500] - Time in milliseconds to wait after finishing typing all text.
 * @param {String} [options.typerClass=""] - CSS class to add to the typing container for styling purposes.
 * @param {Boolean} [options.useContainer=false] - Whether to type inside the given container element or to create a new div for typing.
 * @param {Boolean} [options.stopBlinking=true] - Whether to stop the blinking cursor effect after typing is finished.
 * @param {Boolean} [options.processChars=true] - Whether to preprocess spaces, tabs, and newlines to corresponding HTML entities.
 * @param {Boolean} [options.clearContainer=false] - Whether to clear the container before starting to type.
 * @param {Element} [container=document.querySelector(".terminal")] - The DOM element where the text will be typed.
 * @returns {Promise<void>} A promise that resolves when typing is complete.
 */
async function type(
	text,
	options = {},
	container = document.querySelector(".terminal")
) {
	if (!text) return Promise.resolve();

	let {
		wait = 30,
		initialWait = 1000,
		finalWait = 500,
		lineWait = 100,
		typerClass = "",
		useContainer = false,
		stopBlinking = true,
		processChars = true,
		clearContainer = false
	} = options;

	// If text is an array, e.g. type(['foo', 'bar'])
	if (processChars && Array.isArray(text)) {
		for (const t of text)
			await type(
				t,
				{
					...options,
					initialWait: lineWait,
					finalWait: lineWait
				},
				container
			);
		return;
	}

	let interval;
	return new Promise(async (resolve) => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
		// Create a div where all the characters can be appended to (or use the given container)
		let typer = useContainer
			? container
			: document.createElement("div");
		typer.classList.add("typer", "active");

		if (typerClass) {
			typer.classList.add(typerClass);
		}
		// Handy if reusing the same container
		if (clearContainer) {
			container.innerHTML = "&nbsp;";
		}

		if (!useContainer) {
			container.appendChild(typer);
		}

		if (initialWait) {
			await pause(initialWait / 1000);
		}

		let queue = text;
		if (processChars) {
			queue = text.split("");
		}

		let prev;

		// @TODO should move this out of the typer
		say(text);

		// Use an interval to repeatedly pop a character from the queue and type it on screen
		interval = setInterval(async () => {
			if (queue.length) {
				let char = queue.shift();

				// This is an optimisation for typing a large number of characters on the screen.
				// It seems the performance degrades when trying to add 500+ DOM elements rapidly on the screen.
				// So the content of the previous element is moved to the typer container and removed, which
				// reduces the amount of DOM elements.
				// This may cause issues when the element is removed while the character is still animating (red screen)
				if (processChars && prev) {
					prev.remove();
					if (
						prev.firstChild &&
						prev.firstChild.nodeType ===
							Node.TEXT_NODE
					) {
						typer.innerText +=
							prev.innerText;
					} else {
						typer.appendChild(prev);
					}
				}
				let element = processChars
					? getChar(char)
					: char;
				if (element) {
					typer.appendChild(element);

					if (element.nodeName === "BR") {
						scroll(container);
					}
				}
				prev = element;
			} else {
				// When the queue is empty, clean up the interval
				clearInterval(interval);
				await pause(finalWait / 1000);
				if (stopBlinking) {
					typer.classList.remove("active");
				}
				resolve();
			}
		}, wait);
	});
}

/**
 * Check if a keycode corresponds to a printable character.
 * This includes numbers, letters, spacebar, numpad, and some symbol keys.
 * 
 * @param {number} keycode - The keycode to check.
 * @returns {boolean} True if the keycode is for a printable char, else false.
 */
function isPrintable(keycode) {
	// Number keys
	const isNumber = keycode > 47 && keycode < 58;
	// Spacebar
	const isSpacebar = keycode === 32;
	// Letter keys
	const isLetter = keycode > 64 && keycode < 91;
	// Numpad keys
	const isNumpad = keycode > 95 && keycode < 112;
	// Symbol keys: ;=,-./`
	const isSymbol1 = keycode > 185 && keycode < 193;
	// Symbol keys: [\]'
	const isSymbol2 = keycode > 218 && keycode < 223;

	return isNumber || isSpacebar || isLetter ||
	       isNumpad || isSymbol1 || isSymbol2;
}

/**
 * Moves the caret (cursor) to the end of the content in the
 * specified element.
 * @param {HTMLElement} el - The DOM element to target.
 */
function moveCaretToEnd(el) {
  var range, selection;
  if (document.createRange) {
    range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(el); //Select the entire contents of the element with the range
    range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection(); //get the selection object (allows you to change selection)
    selection.removeAllRanges(); //remove any selections already made
    selection.addRange(range); //make the range you have just created the visible selection
  }
  // Create a new range object
  range = document.createRange();
  // Select the content of the provided element
  range.selectNodeContents(el);
  // Collapse the range to its end point
  range.collapse(false);
  // Get the window's selection object
  selection = window.getSelection();
  // Remove any existing selections
  selection.removeAllRanges();
  // Add the created range as the new selection
  selection.addRange(range);
}

/** 
 * Shows an input field and returns a promise with the text on <enter>.
 * @param {boolean} pw - If true, input is treated as a password.
 */
async function input(pw) {
	return new Promise((resolve) => {
		/** Handles all user input events */
		const onKeyDown = (event) => {
			typeSound();
			switch(event.keyCode) {
				case 13: // ENTER
					preventAndSetContentEditable(event);
					let enterResult = processEnter(event);
					resolve(enterResult);
					break;
				case 38: // UP
					processHistoryUp(event);
					break;
				case 40: // DOWN
					processHistoryDown(event);
					break;
				case 8: // BACKSPACE
					preventDefaultOnSingleChar(event);
					break;
				default:
					if (isPrintable(event.keyCode) && !event.ctrlKey) {
						preventAndDisplayChar(event, pw);
					}
			}
		};

		const preventAndSetContentEditable = (event) => {
			event.preventDefault();
			event.target.setAttribute("contenteditable", false);
		};

		const processEnter = (event) => {
			let result = cleanInput(event.target.textContent);
			addToHistory(result);
			return result;
		};

		const processHistoryUp = (event) => {
			if (historyIndex === -1) tmp = event.target.textContent;
			historyIndex = Math.min(prev.length - 1, historyIndex + 1);
			event.target.textContent = prev[historyIndex];
		};

		const processHistoryDown = (event) => {
			historyIndex = Math.max(-1, historyIndex - 1);
			let text = prev[historyIndex] || tmp;
			event.target.textContent = text;
		};

		const preventDefaultOnSingleChar = (event) => {
			if (event.target.textContent.length === 1) {
				event.preventDefault();
				event.target.innerHTML = "";
			}
		};

		const preventAndDisplayChar = (event, pw) => {
			event.preventDefault();
			let span = document.createElement("span");
			span.textContent = getCharFromKeyCode(event.keyCode);
			span.classList.add("char");
			event.target.appendChild(span);

			if (pw) {
				showAsterisksInPwField(event.target);
			}
			moveCaretToEnd(event.target);
		};

		const getCharFromKeyCode = (keyCode) => {
			let chrCode = keyCode - 48 * Math.floor(keyCode / 48);
			return String.fromCharCode(96 <= keyCode ? chrCode : keyCode);
		};

		const showAsterisksInPwField = (target) => {
			let length = target.textContent.length;
			target.setAttribute("data-pw", Array(length).fill("*").join(""));
		};

		const createInput = (pw) => {
			let input = document.createElement("span");
			input.setAttribute("id", "input");
			input.setAttribute("contenteditable", true);

			if (pw) {
				input.classList.add("password");
			}

			input.addEventListener("keydown", onKeyDown);
			return input;
		};

		// Add input to terminal and focus
		let terminal = document.querySelector(".terminal");
		let inputEl = createInput(pw);
		terminal.appendChild(inputEl);
		inputEl.focus();
	});
}

/**
 * Asynchronously processes user input and executes a command.
 * @param {string} input - The raw input from the user.
 */
async function parse(input) {
	// Clean and validate the input
	input = cleanInput(input);
	if (!input) return;
  
	// Match command and arguments from the input
	let matches = String(input)
	  .match(/^(\w+)(?:\s((?:\w+(?:\s\w+)*)))?$/);
	if (!matches) throw new Error("Invalid command");
  
	// Extract command and arguments
	let [_, command, args] = matches;
  
	// List of prohibited words
	let naughty = ["fuck", "shit", "die", "ass", "cunt"];
	if (naughty.some(word => command.includes(word))) {
	  throw new Error("Please don't use that language");
	}
  
	let module; // Holds the imported command module
  
	// Attempt to import the command module
	try {
	  module = await import(`../commands/${command}/index.mjs`);
	} catch (e) {
	  console.error(e);
	  e.message = e instanceof TypeError
		? `Unknown command: ${command}`
		: "Error while executing command";
	  throw e;
	}
  
	// Load stylesheets if any
	module.stylesheets?.forEach(name =>
	  addStylesheet(`commands/${command}/${name}.css`));
  
	// Load HTML templates if any
	module.templates?.forEach(async name => {
	  await loadTemplates(`commands/${command}/${name}.html`);
	});
  
	// Output any command output
	await type(module.output);
	await pause();
  
	// Execute the command
	await module.default?.(args);
  }

/**
 * Converts the input string to lowercase and trims whitespace.
 * @param {string} input - The string to be cleaned.
 * @return {string} The cleaned string.
 */
function cleanInput(input) {
	// Convert to lowercase
	const lowerCased = input.toLowerCase();
	// Trim whitespace from both ends of the string
	const trimmed = lowerCased.trim();
	// Return the cleaned string
	return trimmed;
  }

/**
 * Scrolls the element to its bottom.
 * @param {Element} el - The DOM element to scroll. 
 * Defaults to the first element with class 'terminal'.
 */
function scroll(el) {
	// If no element is provided, select the .terminal element
	el = el || document.querySelector('.terminal');
	// Set the scrollTop to the scrollHeight to scroll to bottom
	el.scrollTop = el.scrollHeight;
  }

/**
 * Asynchronously prompts the user by typing a message and waiting for input.
 * @param {string} text - The text to type out for the prompt.
 * @param {boolean} pw - Indicates if the input is a password.
 * @returns {Promise<string>} The user's input response.
 */
async function prompt(text, pw = false) {
	// Type out the prompt message
	await type(text);
	// Return the user input, handling passwords if needed
	return input(pw);
  }

/**
 * Waits for a key press or a click event before resolving.
 * @returns {Promise<void>} A promise that resolves when a key is pressed or a click event occurs.
 */
async function waitForKey() {
	// Helper function to resolve the promise and clean up event listeners
	const handleEvent = () => {
	  // Remove event listeners to avoid memory leaks
	  document.removeEventListener('keyup', handleEvent);
	  document.removeEventListener('click', handleEvent);
	  // Resolve the promise
	  resolve();
	};
  
	return new Promise((resolve) => {
	  // Set up event listeners for keyup and click events
	  document.addEventListener('keyup', handleEvent);
	  document.addEventListener('click', handleEvent);
	});
  }

/**
 * This function adds a new stylesheet to the document's head.
 * @param {string} href - The URL of the stylesheet to be added.
 */
function addStylesheet(href) {
	// Get the first head element from the document
	let head = document.head;
  
	// Create a link element for the stylesheet
	let link = document.createElement('link');
  
	// Set the link element's attributes
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('href', href);
  
	// Append the link element to the head
	head.appendChild(link);
  }
export { prompt, input, cleanInput, type, parse, scroll, waitForKey };

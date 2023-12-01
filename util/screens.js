import { parse, type, prompt, input } from "./io.js";
import pause from "./pause.js";
import alert from "./alert.js";
import say from "./speak.js";

const USER = "admin";
const PW = "admin";

/**
 * Displays a boot screen and performs user authentication check.
 * @returns {Promise<void>}
 */
async function boot() {
	clear();

	// Display welcome message
	await type("Welcome Construct Sound terminal", { initialWait: 3000 });

	// Display loading animation
	await type(["> SET TERMINAL/BOOT", "Loading........................"], {
		lineWait: 1000
	});

	// Display loading progress animation
	await type(
		[
			".....",
			"Please wait........",
			"..........",
			"...",
			".",
			".",
			".",
			".",
			"."
		],
		{ lineWait: 250 }
	);

	await type(["OK.", " "]);

	// Display user authentication check message
	await type(["> SET TERMINAL/LOGON", "USER AUTHENTICATION CHECK"], {
		lineWait: 1000,
		finalWait: 3000
	});

	await pause();
	clear();
	postBootWelcomeMessage();
	await new Promise(resolve => setTimeout(resolve, 6000));
	return main();
}

/**
 * Prompts the user for their username and password and performs authentication.
 * If authentication is successful, the main function is called.
 * If authentication fails, the user is prompted to try again.
 */
async function login() {
	clear();
	let user = await prompt("Username:");
	let password = await prompt("Password:", true);

	if (user === USER && password === PW) {
		await pause();
		say("AUTHENTICATION SUCCESSFUL");
		await alert("AUTHENTICATION SUCCESSFUL");
		clear();
		return main();
	} else {
		await type([
			"Incorrect user and/or password.",
			"Please try again"
		]);
		await pause(3);
		clear();
		return login();
	}
}
async function postBootWelcomeMessage() {
	await type(["Welcome to the Construct"], {lineWait: 500});
	await type(["In order to interact with this console please type out one of the following commands:"], {lineWait: 500});
	await type(["chat - Chat with the Oracle themself, help - Get an extended list of commands"], {lineWait: 500});

}
/**
 * Main input terminal, recursively calls itself.
 * 
 * This function is responsible for continuously reading input from the user,
 * parsing the input, and handling any errors that occur during parsing.
 * 
 * @returns {Promise<void>}
 */
async function main() {
    // Read the input from the user
    let command = await input();

    try {
        // Parse the command
        await parse(command);
    } catch (e) {
        if (e.message) {
            // Display the error message
            await type(e.message);
        }
    }

    // Recursively call the main function
    main();
}

/**
 * Add multiple classes to an element.
 *
 * @param {HTMLElement} el - The element to which the classes will be added.
 * @param {...string} cls - The classes to be added.
 */
function addClasses(el, ...cls) {
	// Filter out any falsy values from the classes array
	let list = [...cls].filter(Boolean);
  
	// Add the filtered classes to the element's class list
	el.classList.add(...list);
  }

  function getScreen(...cls) {
	let div = document.createElement("div");
	addClasses(div, "fullscreen", ...cls);
	document.querySelector("#crt").appendChild(div);
	return div;
}


/**
 * Toggles the fullscreen mode of the document body.
 * @param {boolean} isFullscreen - Indicates whether to enable or disable fullscreen mode.
 */
function toggleFullscreen(isFullscreen) {
	// Toggle the "fullscreen" class on the document body based on the isFullscreen parameter
	document.body.classList.toggle("fullscreen", isFullscreen);
  }

/**
 * Attempts to load template HTML from the given path and includes them in the <head>.
 * @param {string} path - The path to the template HTML.
 * @returns {Promise<void>} - A promise that resolves once the templates are loaded.
 */
async function loadTemplates(path) {
	// Fetch the template HTML from the given path
	let txt = await fetch(path).then((res) => res.text());
  
	// Parse the template HTML into a document object
	let html = new DOMParser().parseFromString(txt, "text/html");
  
	// Get all the templates from the parsed HTML
	let templates = html.querySelectorAll("template");
  
	// Append each template to the <head> element
	templates.forEach((template) => {
	  document.head.appendChild(template);
	});
  }

/**
 * Clones the template and adds it to the container.
 * @param {string} id - The id of the template.
 * @param {HTMLElement} container - The container element to add the clone to.
 * @param {object} options - Optional options for the cloning process.
 * @returns {NodeList} - The child nodes of the container after adding the clone.
 */
async function addTemplate(id, container, options = {}) {
	// Find the template element with the given id
	let template = document.querySelector(`template#${id}`);
	
	// Throw an error if the template is not found
	if (!template) {
	  throw Error("Template not found");
	}
	
	// Clone the template
	let clone = document.importNode(template.content, true);
	
	// If the template has a data-type attribute, apply typing animation
	if (template.dataset.type) {
	  await type(clone.textContent, options, container);
	} else {
	  // Otherwise, simply append the clone to the container
	  container.appendChild(clone);
	}
	
	// Return the child nodes of the container after adding the clone
	return container.childNodes;
  }

/**
 * Creates a new screen and loads the given template into it.
 * @param {string} id - The ID of the template.
 * @returns {Promise<Screen>} - The newly created screen.
 */
async function showTemplateScreen(id) {
  // Get the screen with the given ID
  let screen = getScreen(id);
  
  // Add the template to the screen
  await addTemplate(id, screen);
  
  // Return the newly created screen
  return screen;
}

/**
 * Creates an element and adds it to the given container (or terminal screen if undefined).
 * @param {String} type - The type of element to create.
 * @param {Element} [container=document.querySelector(".terminal")] - The container to add the created element to.
 * @param {String} [cls=""] - The class to apply to the created element.
 * @param {Object} attrs - Extra attributes to set on the element.
 * @returns {Element} - The created element.
 */
function el(type, container = document.querySelector(".terminal"), cls = "", attrs) {
	// Create the element
	let el = document.createElement(type);
  
	// Add classes to the created element
	addClasses(el, cls);
  
	// Append the created element to the container
	container.appendChild(el);
  
	// Set attributes on the created element
	if (attrs) {
	  Object.entries(attrs).forEach(([key, value]) => {
		el.setAttribute(key, value);
	  });
	}
  
	// Return the created element
	return el;
  }

/**
 * Creates a `div` element and appends it to the specified container.
 * 
 * @param {Element} container - The container to append the `div` element to.
 * @param {string} cls - The class to apply to the `div` element.
 * @returns {Element} The created `div` element.
 */
function createDiv(container, cls) {
	const divElement = document.createElement("div");
	divElement.className = cls;
	container.appendChild(divElement);
	return divElement;
  }
  function clear(screen = document.querySelector(".terminal")) {
	console.log("Clearing screen...");
	screen.innerHTML = "";
	console.log("Screen cleared.");
}

export {
	boot,
	login,
	main,
	clear,
	getScreen,
	toggleFullscreen,
	createDiv as div,
	el,
	loadTemplates,
	addTemplate,
	showTemplateScreen
};

BASE_URL = 'https://textrpgapp2022.herokuapp.com';
// BASE_URL = 'http://localhost:8080

TextRPGScenarios = [];

const scenarioCreatorAddButton = document.querySelector("#scenario-add-button");
scenarioCreatorAddButton.onclick = function() {
	const scenarioNameInput = document.querySelector("#scenario-name-input");
	const scenarioPromptInput = document.querySelector("#scenario-prompt-input");
	
	PostEntry(scenarioNameInput.value, scenarioPromptInput.value);
	
	scenarioNameInput.value = '';
	scenarioPromptInput.value = '';
};

// views
const signupViewDiv = document.querySelector("#signup-view");
const loginViewDiv = document.querySelector("#login-view");
const appViewDiv = document.querySelector("#app-view");

// nav
const signupViewButton = document.querySelector("#signup-view-button");
const loginViewButton = document.querySelector("#login-view-button");
const logoutViewButton = document.querySelector("#logout-button");

signupViewButton.onclick = function() {
	signupViewDiv.style.display = "block";
	loginViewDiv.style.display = "none";
	
	signupViewButton.className = "active";
	loginViewButton.className = "";
}

loginViewButton.onclick = function() {
	signupViewDiv.style.display = "none";
	loginViewDiv.style.display = "block";
	
	signupViewButton.className = "";
	loginViewButton.className = "active";
}

logoutViewButton.onclick = function() {
	signupViewButton.style.display = "block";
	loginViewButton.style.display = "block";
	logoutViewButton.style.display = "none";
	
	fetch(`${BASE_URL}/sessions`, {
		credentials: "include",
		method: "DELETE",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
		.then(response => {
			LogOut();
		});
}

function LogOut() {
	signupViewDiv.style.display = "none";
	loginViewDiv.style.display = "block";
	appViewDiv.style.display = "none";
	
	signupViewButton.className = "";
	loginViewButton.className = "active";
	
	signupViewButton.style.display = "block";
	loginViewButton.style.display = "block";
	logoutViewButton.style.display = "none";
}

// signup / login buttons
const signupButton = document.querySelector("#signup-button");
signupButton.onclick = function() {
	const fname = document.querySelector("#fname").value;
	const lname = document.querySelector("#lname").value;
	const email = document.querySelector("#signup-email").value;
	const pass = document.querySelector("#signup-password").value;
	
	let textBody = `fname=${fname}&lname=${lname}&email=${email}&password=${pass}`;
	
	const signupStatus = document.querySelector("#signup-status");
	
	fetch(`${BASE_URL}/users`, {
		credentials: "include",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 201) {
				signupStatus.innerHTML = "Signup Success!";
			} else if (response.status === 422) {
				signupStatus.innerHTML = "Signup Error! Email is already in use!";
			}
		})
		.catch(err => signupStatus.innerHTML = "Server Error!");
}

const loginButton = document.querySelector("#login-button");
loginButton.onclick = function() {
	const email = document.querySelector("#login-email").value;
	const pass = document.querySelector("#login-password").value;
	
	let textBody = `email=${email}&password=${pass}`;
	
	const loginStatus = document.querySelector("#login-status");
	
	fetch(`${BASE_URL}/sessions`, {
		credentials: "include",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 201) {
				LoadScenarios();
			} else {
				loginStatus.innerHTML = "Incorrect Login information!";
			}
		})
		.catch(err => loginStatus.innerHTML = "Server Error!");
}

// app stuff
function UpdateUI() {
	const scenarioHolder = document.querySelector("#scenario-holder");
	scenarioHolder.innerHTML = "";
	
	TextRPGScenarios.forEach(Entry => {
		const scenarioID = TextRPGScenarios.indexOf(Entry);
		
		// create sub-div to hold all
		const scenarioDiv = document.createElement("div");
		scenarioDiv.id = `scenario${scenarioID}`;
		scenarioHolder.appendChild(scenarioDiv);
		
		// scenario header
		const scenarioH = document.createElement("h2");
		scenarioH.id = `scenario${scenarioID}-header`;
		scenarioH.innerHTML = "Scenario";
		scenarioDiv.appendChild(scenarioH);
		
		// scenario container
		const scenarioContainer = document.createElement("div");
		scenarioContainer.id = `scenario${scenarioID}-container`;
		// delayed append
		
		// subtract/expand button
		const expandButton = document.createElement("button");
		expandButton.id = `scenario${scenarioID}-expand`;
		expandButton.className = "radio";
		expandButton.innerHTML = "-";
		if (Entry["expanded"]) {
			expandButton.innerHTML = Entry["expanded"];
			if (expandButton.innerHTML === "-")
				scenarioContainer.style.display = "block";
			else
				scenarioContainer.style.display = "none";
		}
		expandButton.onclick = function() {
			if (expandButton.innerHTML === "-") {
				scenarioContainer.style.display = "none";
				expandButton.innerHTML = "+";
			} else {
				scenarioContainer.style.display = "block";
				expandButton.innerHTML = "-";
			}
			Entry["expanded"] = expandButton.innerHTML;
		};
		scenarioH.appendChild(expandButton);
		
		// delete button
		if (Entry["entry_id"] !== undefined) {
			const deleteButton = document.createElement("button");
			deleteButton.id = `scenario${scenarioID}-delete`;
			deleteButton.innerHTML = "Delete";
			deleteButton.onclick = function() {
				if (confirm("Are you sure you want to delete this entry?"))
					DeleteEntry(Entry["entry_id"]);
			};
			scenarioH.appendChild(deleteButton);
		}
		
		// append after for proper ordering
		scenarioDiv.appendChild(scenarioContainer);
		
		// scenario [name, prompt] edit
		new DynamicEditSystem(`scenario${scenarioID}`, scenarioContainer, ["name", "prompt"], Entry, PutEntry);
		
		// create scenario-action-input
		const scenarioActionInput = document.createElement("input");
		scenarioActionInput.id = `scenario${scenarioID}-action-input`;
		scenarioActionInput.placeholder = `Input Action Name`;
		
		// create scenario-response-input
		const scenarioResponseInput = document.createElement("input");
		scenarioResponseInput.id = `scenario${scenarioID}-response-input`;
		scenarioResponseInput.placeholder = `Input Response`;
		
		// create add button
		const scenarioActionResponseAddButton = document.createElement("button");
		scenarioActionResponseAddButton.id = `scenario${scenarioID}-action-response-add-button`;
		scenarioActionResponseAddButton.innerHTML = `Action-Response Add`;
		scenarioActionResponseAddButton.onclick = function() {
			PostAction(Entry["entry_id"], scenarioActionInput.value, scenarioResponseInput.value);
		};
		
		// only edit if not submitted
		scenarioContainer.appendChild(scenarioActionInput);
		scenarioContainer.appendChild(scenarioResponseInput);
		scenarioContainer.appendChild(scenarioActionResponseAddButton);
		
		// handle already created Action-responses
		Entry["actions"].forEach(Action => {
			const action_id = Entry["actions"].indexOf(Action);
			
			// Action name and response headers
			const ActionH = document.createElement("h3");
			ActionH.id = `scenario${scenarioID}-action${action_id}-action-header`;
			ActionH.innerHTML = "Action";
			//ActionH.style.display = "inline";
			scenarioContainer.appendChild(ActionH);
			
			// Action container
			const ActionContainer = document.createElement("div");
			ActionContainer.id = `scenario${scenarioID}-action${action_id}-container`;
			// delayed append
			
			// subtract/expand button
			const expandActionButton = document.createElement("button");
			expandActionButton.id = `scenario${scenarioID}-action${action_id}-expand`;
			expandActionButton.className = "radio";
			expandActionButton.innerHTML = "-";
			if (Action["expanded"]) {
				expandActionButton.innerHTML = Action["expanded"];
				if (expandActionButton.innerHTML === "-")
					ActionContainer.style.display = "block";
				else
					ActionContainer.style.display = "none";
			}
			expandActionButton.onclick = function() {
				if (expandActionButton.innerHTML === "-") {
					ActionContainer.style.display = "none";
					expandActionButton.innerHTML = "+";
				} else {
					ActionContainer.style.display = "block";
					expandActionButton.innerHTML = "-";
				}
				Action["expanded"] = expandActionButton.innerHTML;
			};
			ActionH.appendChild(expandActionButton);
			
			// delete button
			const deleteActionButton = document.createElement("button");
			deleteActionButton.id = `scenario${scenarioID}-action${action_id}-delete`;
			deleteActionButton.innerHTML = "Delete";
			deleteActionButton.onclick = function() {
				if (confirm("Are you sure you want to delete this action?"))
					DeleteAction(Entry["entry_id"], Action["action_id"]);
			};
			ActionH.appendChild(deleteActionButton);
			
			// append after for proper ordering
			scenarioContainer.appendChild(ActionContainer);
			
			// Action [name, response] edit
			new DynamicEditSystem(`scenario${scenarioID}-action${action_id}`, ActionContainer, ["name", "response", "next_entry_id"], Action, PutAction);
			
			// requirement header
			const reqsH = document.createElement("h4");
			reqsH.id = `scenario${scenarioID}-action${action_id}-reqs-header`;
			reqsH.innerHTML = "Requirements";
			ActionContainer.appendChild(reqsH);
			
			// requirements input, add/remove buttons
			const reqsInput	= document.createElement("input");
			reqsInput.id = `scenario${scenarioID}-action${action_id}-reqs-input`;
			reqsInput.placeholder = `Input a Requirement`;
			
			const reqsAdd = document.createElement("button");
			reqsAdd.id = `scenario${scenarioID}-action${action_id}-reqs-add-button`;
			reqsAdd.innerHTML = `Requirement Add`;
			reqsAdd.onclick = function() {
				Action['requirements'].push(reqsInput.value);
				PutAction(Action);
			};
			
			const reqsRemove = document.createElement("button");
			reqsRemove.id = `scenario${scenarioID}-action${action_id}-reqs-remove-button`;
			reqsRemove.innerHTML = `Requirement Remove`;
			reqsRemove.onclick = function() {
				Action['requirements'] = Action['requirements'].filter(item => item !== reqsInput.value);
				PutAction(Action);
			};
			
			// append
			ActionContainer.appendChild(reqsInput);
			ActionContainer.appendChild(reqsAdd);
			ActionContainer.appendChild(reqsRemove);
			
			// requirements list
			const reqsList = document.createElement("ul");
			reqsList.id = `scenario${scenarioID}-action${action_id}-reqs-list`;
			ActionContainer.appendChild(reqsList);
			
			Action["requirements"].forEach(req => {
				const reqItem = document.createElement("li");
				reqItem.id = `scenario${scenarioID}-action${action_id}-${req}`;
				reqItem.innerHTML = req;
				reqsList.appendChild(reqItem);
			});
			
			// consequences header
			const consH = document.createElement("h4");
			consH.id = `scenario${scenarioID}-action${action_id}-cons-header`;
			consH.innerHTML = "Consequences";
			ActionContainer.appendChild(consH);
			
			// consequences input, add/remove buttons
			const consInput	= document.createElement("input");
			consInput.id = `scenario${scenarioID}-action${action_id}-cons-input`;
			consInput.placeholder = `Input a Consequence`;
			
			const consAdd = document.createElement("button");
			consAdd.id = `scenario${scenarioID}-action${action_id}-cons-add-button`;
			consAdd.innerHTML = `Consequence Add`;
			consAdd.onclick = function() {
				Action['consequences'].push(consInput.value);
				PutAction(Action);
			};
			
			const consRemove = document.createElement("button");
			consRemove.id = `scenario${scenarioID}-action${action_id}-cons-remove-button`;
			consRemove.innerHTML = `Consequence Remove`;
			consRemove.onclick = function() {
				Action['consequences'] = Action['consequences'].filter(item => item !== consInput.value);
				PutAction(Action);
			};
			
			// append
			ActionContainer.appendChild(consInput);
			ActionContainer.appendChild(consAdd);
			ActionContainer.appendChild(consRemove);
			
			// consequences list
			const consList = document.createElement("ul");
			consList.id = `scenario${scenarioID}-action${action_id}-cons-list`;
			ActionContainer.appendChild(consList);
			
			Action["consequences"].forEach(cons => {
				const consItem = document.createElement("li");
				consItem.id = `scenario${scenarioID}-action${action_id}-${cons}`;
				consItem.innerHTML = cons;
				consList.appendChild(consItem);
			});
		});
	});
}

class DynamicEditSystem {
	constructor(groupName, parentElem, editKeys, objectWithValues, putFunc) {
		this.object = objectWithValues;
		this.putFunc = putFunc;
		
		this.editGroupDiv = document.createElement("div");
		this.editGroupDiv.id = `${groupName}-edit-group`;
		
		this.editKeys = editKeys;
		this.editInputGroups = [];
		editKeys.forEach(editKey => {
			if (editKeys.indexOf(editKey) > 0)
				this.editGroupDiv.appendChild(document.createElement("br"));
			
			let headerElem = document.createElement("h5");
			headerElem.id = `${groupName}-edit-header}`;
			headerElem.innerHTML = editKey[0].toUpperCase() + editKey.slice(1);
			headerElem.style.display = "inline";
			// this.headerElem.style.paddingLeft = "0";
			
			let editElem = document.createElement("p");
			editElem.id = `${groupName}-${editKey}-edit-p}`;
			editElem.innerHTML = objectWithValues[editKey];
			editElem.style.display = "inline";
			
			let inputElem = document.createElement("input");
			inputElem.id = `${groupName}-${editKey}-input`;
			inputElem.style.display = "none";
			inputElem.style.width = "50%";
			
			this.editInputGroups.push({
				edit: editElem,
				input: inputElem
			});
			
			this.editGroupDiv.appendChild(headerElem);
			this.editGroupDiv.appendChild(editElem);
			this.editGroupDiv.appendChild(inputElem);
		});
		this.editButton = document.createElement("button");
		this.editButton.id = `${groupName}-edit-button`;
		this.editButton.innerHTML = "Edit";
		this.editButton.onclick = this.buttonClick(this);
		
		this.editGroupDiv.appendChild(this.editButton);
		parentElem.appendChild(this.editGroupDiv);
		
		this.editing = false;
	}
	
	buttonClick(me) {
		return function() {
			if (!me.editing) {
				me.editing = true;
				me.editInputGroups.forEach(editInputGroup => {
					editInputGroup.edit.style.display = "none";
					editInputGroup.input.style.display = "inline";
					editInputGroup.input.value = editInputGroup.edit.innerHTML;
				});
			} else {
				for (let i = 0; i < me.editKeys.length; i++)
					me.object[me.editKeys[i]] = me.editInputGroups[i].input.value;
				
				me.putFunc(me.object);
			}
		}
	}
}

// fetch methods

// GET
function LoadScenarios() {
	fetch(`${BASE_URL}/entries`, {
		credentials: "include"
	})
		.then(response => {
			if (response.status === 200) {
				signupViewButton.style.display = "none";
				loginViewButton.style.display = "none";
				logoutViewButton.style.display = "block";
				
				signupViewDiv.style.display = "none";
				loginViewDiv.style.display = "none";
				appViewDiv.style.display = "block";
				
				return response.json();
			}
			else if (response.status === 401) {
				LogOut();
			}
		})
		.then(data => {
			// handle data
			if (data)
				TextRPGScenarios = data;
			
			UpdateUI();
		})
		.catch(error => document.querySelector("#serverdown-view").style.display = "block");
}

// POST
function PostEntry(name, aPrompt) {
	let textBody = "";
	textBody += `name=${encodeURIComponent(name)}`;
	textBody += "&";
	textBody += `prompt=${encodeURIComponent(aPrompt)}`;
	
	fetch(`${BASE_URL}/entries`, {
		credentials: "include",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 201) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

function PostAction(entry_id, name, response) {
	let textBody = "";
	textBody += `name=${encodeURIComponent(name)}`;
	textBody += "&";
	textBody += `response=${encodeURIComponent(response)}`;
	
	fetch(`${BASE_URL}/entries/${entry_id}/actions`, {
		credentials: "include",
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 201) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

// PUT
function PutEntry(entry) {
	let textBody = "";
	textBody += `name=${encodeURIComponent(entry['name'])}`;
	textBody += "&";
	textBody += `prompt=${encodeURIComponent(entry['prompt'])}`;
	
	fetch(`${BASE_URL}/entries/${entry['entry_id']}`, {
		credentials: "include",
		method: "PUT",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 200) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

function PutAction(action) {
	console.log(action);
	let textBody = "";
	textBody += `name=${encodeURIComponent(action["name"])}`;
	textBody += `&`;
	textBody += `response=${encodeURIComponent(action["response"])}`;
	textBody += `&`;
	textBody += `next_entry_id=${encodeURIComponent(action["next_entry_id"])}`;
	action["requirements"].forEach(requirement => {
		textBody += `&`;
		textBody += `requirements=${encodeURIComponent(requirement)}`;
	});
	action["consequences"].forEach(consequence => {
		textBody += `&`;
		textBody += `consequences=${encodeURIComponent(consequence)}`;
	});
	
	fetch(`${BASE_URL}/entries/${action['entry_id']}/actions/${action['action_id']}`, {
		credentials: "include",
		method: "PUT",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: textBody
	})
		.then(response => {
			if (response.status === 200) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

// DELETE
function DeleteEntry(entry_id) {
	fetch(`${BASE_URL}/entries/${entry_id}`, {
		credentials: "include",
		method: "DELETE",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
		.then(response => {
			if (response.status === 200) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

function DeleteAction(entry_id, action_id) {
	fetch(`${BASE_URL}/entries/${entry_id}/actions/${action_id}`, {
		credentials: "include",
		method: "DELETE",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
		.then(response => {
			if (response.status === 200) {
				LoadScenarios();
			} else if (response.status === 401) {
				LogOut();
			}
		});
}

window.onload = LoadScenarios;
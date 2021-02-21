// Client ID and API key from the Developer Console
const SPREADSHEET_ID = "1Fn9w47wZ1E-fJ8S4GCon7n2sjH-DjH6OKaop6EEmkqE";
const API_KEY = "AIzaSyDyDXCY04HC_vH0VpB5KOT2hba8w1crrhI";
const CLIENT_ID = "587671854360-5b2mppi4vhmr7el8i46t9mkam6fk5vug.apps.googleusercontent.com";
const CLIENT_KEY = "FXYzrEDkvLX_xWDF8a4G8UrO";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets"/*"https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets"*/;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

const name = $("#autoname");
const submit1 = $("#submit1");
const submit2 = $("#submit2");
const form = $("#form");

const rowHeaders = [
	"Submit_Date",
	"Invite_Pool",
	"First_Name",
	"Last_Name",
	"Email",
	"RSVP_Welcome",
	"RSVP_Wedding",
	"RSVP_Brunch",
	"Food_restrictions",
	"Song_requests",
	"Questions"
];

let data = {};
let pools = {};
let names = [];

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/*
add : not in the list? contact us
submit : crée autant de champs qu'il a de personnes dans le poole
formulaires pour les questions générales
mettre à jour la sheets
*/

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	console.log("init client");
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		scope: SCOPES,
		discoveryDocs: DISCOVERY_DOCS
	}).then(() => {
		console.log("client initiated");
		login();
		/*gapi.auth2.getAuthInstance().signIn();*/
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	}, (error) => {
		console.log(JSON.stringify(error, null, 2));
	});
}

function login(){
	gapi.auth.authorize({
		client_id: API_KEY,
		scope: SCOPES,
		immediate: false
	}, updateSigninStatus());
}


/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	console.log("update sign in status");
	if (isSignedIn) {
		submit1.click(ev => {
			ev.preventDefault();
			generateForm(name.val());
		});
		submit2.click(ev => {
			ev.preventDefault();
			sendData();
		});
		getData();
		// addRow();
	} else {
		console.log("not signed in :'(");
	}
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	const pre = document.getElementById('content');
	const textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}


function getData() {
	console.log("get data");
	gapi.client.sheets.spreadsheets.values.get({
		spreadsheetId: SPREADSHEET_ID,
		range: 'Sheet1',
	}).then(response => {
		const range = response.result;
		if (range.values.length > 0) {
			for (let i = 1; i < range.values.length; i++) {
				const row = range.values[i];

				let name = `${row[2]} ${row[3] ?? ""}`;

				if (row[1]){
					if (! pools.hasOwnProperty(row[1])){
						pools[row[1]] = [];
					}
					pools[row[1]].push(name);
				}

				if (name !== "Your +1? "){
					names.push(name);
					data[name] = row;
					data[name].rowNb = i;
				} else {
					data[`${name}${row[1]}`] = row;
					data[`${name}${row[1]}`].rowNb = i;
				}
			}
			name.autocomplete({
				source: names
			});
		} else {
			console.log('No data found.');
		}
	}, function(response) {
		console.log('Error: ' + response.result.error.message);
	}).then(() => {

	});
}

function generatePersonForm(name, rowNb) {
	console.log("generate person form");
	let f;
	if (name.startsWith("Your +1?")){
		name = "Your +1?";
		f = `<div id="${rowNb}">
				   <h3>${name}</h3>
				   <label for="firstname-${rowNb}">First Name</label>
				   <input id="firstname-${rowNb}" type="text">
				   <label for="lastname-${rowNb}">Last Name</label>
				   <input id="lastname-${rowNb}" type="text">
				   <label for="email-${rowNb}">E-mail</label>
				   <input id="email-${rowNb}" type="email">
			   </div>`;
	} else {
		f = `<div id="${rowNb}">
				   <h3>${name}</h3>
				   <label for="email-${rowNb}">E-mail</label>
				   <input id="email-${rowNb}" type="email">
			   </div>`;
	}
	form.append(f);
}

function generateEventForm(i, pool) {
	console.log("generate event info");
	const eventInfo = [
		{name: "Rehearsal Dinner", date: "Thursday, June 9, 2022", time: "6:30 pm – 10:00 pm", place: "Resto de Juju, Aix-en-Provence<br>France"},
		{name: "Wedding", date: "Thursday, June 9, 2022", time: "6:30 pm – 10:00 pm", place: "Resto de Juju, Aix-en-Provence<br>France"},
		{name: "Brunch", date: "Thursday, June 9, 2022", time: "6:30 pm – 10:00 pm", place: "Resto de Juju, Aix-en-Provence<br>France"}
	];

	let persons = "";
	pool.map(person => {
		persons += `<h3>${person}</h3>
					<table>
						 <tr>
							  <td>
								  <label class="btn-label">
									   <input class="button-trigger" checked type="radio" name="event-${i}" value="yes">
									   <button class="button-trigger">Will attend</button>
								  </label>
							  </td>
							 <td>
								  <label class="btn-label">
									   <input class="button-trigger" type="radio" name="event-${i}" value="no">
									   <button class="button-trigger">Will not attend</button>
								  </label>
							  </td>
							  <td>
								  <label class="btn-label">
									   <input class="button-trigger" type="radio" name="event-${i}" value="maybe">
									   <button class="button-trigger">Still unsure</button>
								  </label>
							  </td>
						 </tr>
					</table>`;
	});

	const e = `<div id="event-${i}">
				   <h2>${eventInfo[i].name}</h2>
				   <h3>${eventInfo[i].date}</h3>
				   <h3>${eventInfo[i].time}</h3>
				   <h4>${eventInfo[i].place}</h4>
				   ${persons}
			   </div>`;
	form.append(e);
}

function generateGeneralForm() {
	console.log("generate general form");
	form.append(`<div id="general">
					 <label for="food">Food restriction</label>
					 <input type="text" id="food">
					 <label for="music">Song requests</label>
					 <input type="text" id="music">
					 <label for="question">Questions?</label>
					 <input type="text" id="question">
				 </div>`);
}

/* en cas de +1 : possibilité de changer pour soumettre le nom de la personne*/

function generateForm(name) {
	console.log("generate form");
	const pool = pools[data[name][1]];

	pool.map(name => generatePersonForm(name, data[name].rowNb));

	generateEventForm(0, pool);
	generateEventForm(1, pool);
	generateEventForm(2, pool);

	generateGeneralForm();

	form.append(`<button id="submit2" type="submit" value="Submit" />`)
}

function sendData(){

}

function updateRow(rowNb, rowContent) {

}

/**
 *
 * @param rows => [['now', 'AA', 'sego', 'albou']]
 */
function addRow(rows) {
	gapi.client.sheets.spreadsheets.values.append({
		spreadsheetId: SPREADSHEET_ID,
		range: 'Sheet1',
		valueInputOption: 'RAW',
		resource: {
			values: rows
		},
		insertDataOption: 'INSERT_ROWS'
	}).then((response) => {
		const result = response.result;
		console.log(`${result.updatedCells} cells updated.`);
	});
}


function signIn(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function signOut(event) {
	gapi.auth2.getAuthInstance().signOut();
}


document.addEventListener("DOMContentLoaded", function () {


const patientList =
document.getElementById("patient-list");

const patientName =
document.getElementById("doctor-patient-name");

const patientId =
document.getElementById("doctor-patient-id");

const patientAge =
document.getElementById("doctor-patient-age");

const latestStatus =
document.getElementById("doctor-latest-status");

const totalCheckins =
document.getElementById("total-checkins");

const lowCount =
document.getElementById("low-count");

const moderateCount =
document.getElementById("moderate-count");

const highCount =
document.getElementById("high-count");

const doctorHistory =
document.getElementById("doctor-history");

const trendMood =
document.getElementById("trend-mood");

const trendStress =
document.getElementById("trend-stress");

const trendAnxiety =
document.getElementById("trend-anxiety");

const trendDirection =
document.getElementById("trend-direction");

const distressAlert =
document.getElementById("distress-alert");

const distressAlertList =
document.getElementById("distress-alert-list");

const activeAlertCount =
document.getElementById("active-alert-count");

const riskTimeline =
document.getElementById("risk-timeline");

const alertHistory =
document.getElementById("alert-history");


/* =========================
   PATIENT DATA
========================= */

function getPatients() {

const saved =
localStorage.getItem("heksaaPatients");

if (!saved) return [];

try {

const data =
JSON.parse(saved);

return Array.isArray(data)
? data
: [];

} catch {

return [];

}

}


let patients = getPatients();

let selectedPatientId =
patients.length
? patients[0].id
: null;


/* =========================
   HELPERS
========================= */

function formatValue(value) {

if (!value) return "No Data";

return String(value)
.replace(/-/g," ")
.replace(/\b\w/g,
letter => letter.toUpperCase());

}


function formatDate(value) {

if (!value)
return "Time unavailable";

const date =
new Date(value);

if (isNaN(date.getTime()))
return "Time unavailable";

return date.toLocaleString(
"en-IN",
{
day:"2-digit",
month:"short",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
}
);

}


function getStatusClass(status) {

if (status === "Low Concern")
return "status-low";

if (status === "Moderate Concern")
return "status-moderate";

if (status === "High Concern")
return "status-high";

return "";

}


function getTimelineClass(status) {

if (status === "Low Concern")
return "low";

if (status === "Moderate Concern")
return "moderate";

return "high";

}


function getScore(status) {

if (status === "Low Concern")
return 1;

if (status === "Moderate Concern")
return 2;

if (status === "High Concern")
return 3;

return 0;

}


/* =========================
   ACKNOWLEDGED ALERTS
========================= */

function getAcknowledgedAlerts() {

try {

return JSON.parse(
localStorage.getItem(
"heksaaAcknowledgedAlerts"
)
) || {};

} catch {

return {};

}

}


function saveAcknowledgedAlerts(data) {

localStorage.setItem(
"heksaaAcknowledgedAlerts",
JSON.stringify(data)
);

}


function getAlertKey(patient, checkin) {

return patient.id + "_" + checkin.date;

}


/* =========================
   PATIENT LIST
========================= */

function displayPatientList() {

patientList.innerHTML = "";

if (!patients.length) {

patientList.innerHTML =
"No patients available.";

return;

}


patients.forEach(patient => {

const history =
Array.isArray(patient.history)
? patient.history
: [];

const latest =
history.length
? history[0]
: null;

const status =
latest
? latest.overallStatus
: "No Data";


const card =
document.createElement("div");

card.className =
"patient-card";


if (patient.id === selectedPatientId)
card.classList.add("active");


card.innerHTML = `

<div class="patient-list-avatar">
👤
</div>

<div class="patient-card-info">

<strong>
${patient.name}
</strong>

<span>
${patient.id} • Age ${patient.age}
</span>

</div>

<div class="patient-card-status
${getStatusClass(status)}">

${status}

</div>

`;


card.onclick = function () {

selectedPatientId =
patient.id;

displayPatientList();

displaySelectedPatient();

};


patientList.appendChild(card);

});

}


/* =========================
   ALERT CENTER
========================= */

function displayDistressAlerts() {

const acknowledged =
getAcknowledgedAlerts();


distressAlertList.innerHTML = "";


let pending = 0;

const alerts = [];


patients.forEach(patient => {

const history =
Array.isArray(patient.history)
? patient.history
: [];


if (!history.length)
return;


const latest =
history[0];


if (
latest.overallStatus !==
"High Concern"
)
return;


const key =
getAlertKey(patient,latest);


const reviewed =
Boolean(acknowledged[key]);


if (!reviewed)
pending++;


alerts.push({
patient,
latest,
key,
reviewed
});

});


activeAlertCount.textContent =
pending +
(pending === 1
? " Active Alert"
: " Active Alerts");


if (pending)
activeAlertCount.classList.add(
"has-alerts"
);
else
activeAlertCount.classList.remove(
"has-alerts"
);


if (!alerts.length) {

distressAlertList.innerHTML = `

<div class="history-empty">

<h4>
✅ No Active Distress Alerts
</h4>

<p>
No patient's latest check-in
is currently classified as
High Concern.
</p>

</div>

`;

return;

}


alerts.forEach(alert => {

const card =
document.createElement("div");

card.className =
"alert-item";


if (alert.reviewed)
card.classList.add("acknowledged");


card.innerHTML = `

<div class="alert-main">

<div class="alert-icon">

${alert.reviewed ? "✓" : "⚠️"}

</div>

<div class="alert-details">

<strong>
${alert.patient.name}
</strong>

<span>
ID: ${alert.patient.id}
• High Concern
</span>

<span class="alert-time">

Latest check-in:
${formatDate(alert.latest.date)}

</span>

<span class="alert-status
${alert.reviewed
? "reviewed"
: "pending"}">

${alert.reviewed
? "✓ Acknowledged"
: "⚠ Awaiting Review"}

</span>

</div>

</div>

<div class="alert-actions">

<button
class="alert-view-button">
View Patient
</button>

<button
class="alert-details-button">
View Details
</button>

<button
class="alert-acknowledge-button"
${alert.reviewed ? "disabled" : ""}>

${alert.reviewed
? "Acknowledged"
: "Acknowledge Alert"}

</button>

</div>

<div class="alert-details-panel">

<div
class="alert-data-grid">

<div class="alert-data-box">

<span>Mood</span>

<strong>
${formatValue(alert.latest.mood)}
</strong>

</div>

<div class="alert-data-box">

<span>Stress</span>

<strong>
${formatValue(alert.latest.stress)}
</strong>

</div>

<div class="alert-data-box">

<span>Anxiety</span>

<strong>
${formatValue(alert.latest.anxiety)}
</strong>

</div>

</div>

</div>

`;


const viewButton =
card.querySelector(
".alert-view-button"
);

viewButton.onclick =
function () {

selectedPatientId =
alert.patient.id;

displayPatientList();

displaySelectedPatient();

window.scrollTo({
top:0,
behavior:"smooth"
});

};


const detailsButton =
card.querySelector(
".alert-details-button"
);

const detailsPanel =
card.querySelector(
".alert-details-panel"
);

detailsButton.onclick =
function () {

const show =
detailsPanel.classList
.toggle("show");

detailsButton.textContent =
show
? "Hide Details"
: "View Details";

};


const acknowledgeButton =
card.querySelector(
".alert-acknowledge-button"
);


if (!alert.reviewed) {

acknowledgeButton.onclick =
function () {

const data =
getAcknowledgedAlerts();


data[alert.key] = {

patientId:
alert.patient.id,

patientName:
alert.patient.name,

acknowledgedAt:
new Date().toISOString()

};


saveAcknowledgedAlerts(data);

displayDistressAlerts();

displayAlertHistory();

};

}


distressAlertList.appendChild(card);

});

}


/* =========================
   SELECTED PATIENT
========================= */

function displaySelectedPatient() {

const patient =
patients.find(
p => p.id === selectedPatientId
);

if (!patient) return;


const history =
Array.isArray(patient.history)
? patient.history
: [];


patientName.textContent =
patient.name;

patientId.textContent =
patient.id;

patientAge.textContent =
patient.age;


latestStatus.className =
"doctor-status";


if (history.length) {

const status =
history[0].overallStatus;

latestStatus.textContent =
status;

latestStatus.classList.add(
getStatusClass(status)
);


if (status === "High Concern")
distressAlert.style.display =
"block";
else
distressAlert.style.display =
"none";

} else {

latestStatus.textContent =
"No Data";

distressAlert.style.display =
"none";

}


/* SUMMARY */

totalCheckins.textContent =
history.length;


let low = 0;
let moderate = 0;
let high = 0;


history.forEach(item => {

if (item.overallStatus ===
"Low Concern")
low++;

if (item.overallStatus ===
"Moderate Concern")
moderate++;

if (item.overallStatus ===
"High Concern")
high++;

});


lowCount.textContent = low;
moderateCount.textContent = moderate;
highCount.textContent = high;


displayHistory(history);

displayTrend(history);

displayRiskTimeline(history);

displayAlertHistory();

}


/* =========================
   CHECK-IN HISTORY
========================= */

function displayHistory(history) {

doctorHistory.innerHTML = "";


if (!history.length) {

doctorHistory.innerHTML = `

<div class="history-empty">

📋 No patient check-ins available.

</div>

`;

return;

}


history.forEach(item => {

const card =
document.createElement("div");

card.className =
"doctor-checkin";


card.innerHTML = `

<div class="doctor-checkin-header">

<div>

<h4>
Patient Check-in
</h4>

<span class="doctor-date">

${formatDate(item.date)}

</span>

</div>

<span class="doctor-status
${getStatusClass(
item.overallStatus
)}">

${item.overallStatus}

</span>

</div>

<div class="doctor-data">

<div class="doctor-data-item">

<span>Mood</span>

<strong>
${formatValue(item.mood)}
</strong>

</div>

<div class="doctor-data-item">

<span>Stress</span>

<strong>
${formatValue(item.stress)}
</strong>

</div>

<div class="doctor-data-item">

<span>Anxiety</span>

<strong>
${formatValue(item.anxiety)}
</strong>

</div>

</div>

`;


doctorHistory.appendChild(card);

});

}


/* =========================
   TREND
========================= */

function displayTrend(history) {

if (!history.length) {

trendMood.textContent =
"No Data";

trendStress.textContent =
"No Data";

trendAnxiety.textContent =
"No Data";

trendDirection.textContent =
"No Data";

return;

}


const latest =
history[0];


trendMood.textContent =
formatValue(latest.mood);

trendStress.textContent =
formatValue(latest.stress);

trendAnxiety.textContent =
formatValue(latest.anxiety);


if (history.length < 2) {

trendDirection.textContent =
"Not enough data";

return;

}


const current =
getScore(history[0].overallStatus);

const previous =
getScore(history[1].overallStatus);


if (current > previous) {

trendDirection.textContent =
"Increasing Concern";

trendDirection.className =
"trend-warning";

} else if (current < previous) {

trendDirection.textContent =
"Improving";

trendDirection.className =
"trend-good";

} else {

trendDirection.textContent =
"Stable";

trendDirection.className =
"trend-stable";

}

}


/* =========================
   RISK TIMELINE
========================= */

function displayRiskTimeline(history) {

riskTimeline.innerHTML = "";


if (!history.length) {

riskTimeline.innerHTML = `

<div class="history-empty">

No risk timeline data available.

</div>

`;

return;

}


history.forEach((item,index) => {

const type =
getTimelineClass(
item.overallStatus
);


const itemElement =
document.createElement("div");

itemElement.className =
"timeline-item";


itemElement.innerHTML = `

<div class="timeline-line"></div>

<div class="timeline-dot ${type}">

${type === "high"
? "🔴"
: type === "moderate"
? "🟡"
: "🟢"}

</div>

<div class="timeline-content">

<div class="timeline-header">

<div>

<strong>
Check-in ${history.length - index}
</strong>

<div class="timeline-date">

${formatDate(item.date)}

</div>

</div>

<div class="timeline-status ${type}">

${item.overallStatus}

</div>

</div>

<div class="timeline-data">

<div>

<span>Mood</span>

<strong>
${formatValue(item.mood)}
</strong>

</div>

<div>

<span>Stress</span>

<strong>
${formatValue(item.stress)}
</strong>

</div>

<div>

<span>Anxiety</span>

<strong>
${formatValue(item.anxiety)}
</strong>

</div>

</div>

</div>

`;


riskTimeline.appendChild(itemElement);

});

}


/* =========================
   ALERT HISTORY
========================= */

function displayAlertHistory() {

alertHistory.innerHTML = "";


const acknowledged =
getAcknowledgedAlerts();


const patient =
patients.find(
p => p.id === selectedPatientId
);


if (!patient) return;


const history =
Array.isArray(patient.history)
? patient.history
: [];


const alerts =
history.filter(
item =>
item.overallStatus ===
"High Concern"
);


if (!alerts.length) {

alertHistory.innerHTML = `

<div class="history-empty">

✅ No high-concern alerts
for this patient.

</div>

`;

return;

}


alerts.forEach(item => {

const key =
getAlertKey(
patient,
item
);


const reviewed =
Boolean(acknowledged[key]);


const element =
document.createElement("div");

element.className =
"history-alert-item";


element.innerHTML = `

<div class="history-alert-header">

<strong>

🚨 High Concern Alert

</strong>

<span class="alert-status
${reviewed
? "reviewed"
: "pending"}">

${reviewed
? "✓ Acknowledged"
: "⚠ Pending"}

</span>

</div>

<div class="history-alert-meta">

${formatDate(item.date)}

</div>

<div class="history-alert-data">

<span>
Mood: ${formatValue(item.mood)}
</span>

<span>
Stress: ${formatValue(item.stress)}
</span>

<span>
Anxiety: ${formatValue(item.anxiety)}
</span>

</div>

`;


alertHistory.appendChild(element);

});

}


/* =========================
   START
========================= */

displayPatientList();

displayDistressAlerts();

displaySelectedPatient();

});

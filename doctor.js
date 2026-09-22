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

const riskScore =
document.getElementById("risk-score");

const riskLevel =
document.getElementById("risk-level");

const riskDescription =
document.getElementById("risk-description");

const riskMeterFill =
document.getElementById("risk-meter-fill");

const riskLatest =
document.getElementById("risk-latest");

const riskPattern =
document.getElementById("risk-pattern");

const riskHighRate =
document.getElementById("risk-high-rate");


/* =========================
   LOAD PATIENTS
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
.replace(/-/g, " ")
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
   DYNAMIC RISK ENGINE
========================= */

function calculateRisk(history) {

if (!history.length) {

return {
score:0,
level:"Low Risk",
description:
"Insufficient data for a meaningful risk estimate.",
pattern:"No Data",
highRate:0
};

}


/*
   Latest concern score
   Low      = 20
   Moderate = 55
   High     = 90
*/

const latest =
history[0];

let latestRisk = 0;


if (latest.overallStatus ===
"Low Concern") {

latestRisk = 20;

} else if (
latest.overallStatus ===
"Moderate Concern"
) {

latestRisk = 55;

} else if (
latest.overallStatus ===
"High Concern"
) {

latestRisk = 90;

}


/*
   Recent history
*/

const recent =
history.slice(
0,
Math.min(5, history.length)
);


let totalScore = 0;

recent.forEach(item => {

totalScore +=
getScore(item.overallStatus);

});


const averageScore =
totalScore / recent.length;


/*
   Convert average to risk
*/

let patternRisk =
(averageScore / 3) * 100;


/*
   High concern frequency
*/

const highCount =
recent.filter(
item =>
item.overallStatus ===
"High Concern"
).length;


const highRate =
Math.round(
(highCount / recent.length) * 100
);


/*
   Trend
*/

let trendAdjustment = 0;


if (recent.length >= 2) {

const current =
getScore(recent[0].overallStatus);

const previous =
getScore(recent[1].overallStatus);


if (current > previous) {

trendAdjustment = 10;

} else if (current < previous) {

trendAdjustment = -10;

}

}


/*
   Final score

   50% latest
   30% recent pattern
   20% high-concern frequency
*/

let finalScore =
(latestRisk * 0.50) +
(patternRisk * 0.30) +
(highRate * 0.20) +
trendAdjustment;


/*
   Keep score between 0 and 100
*/

finalScore =
Math.round(
Math.max(
0,
Math.min(100, finalScore)
)
);


/*
   Risk level
*/

let level;
let description;
let pattern;


if (finalScore >= 70) {

level = "High Risk";

description =
"Recent check-ins indicate a high level of distress and require closer monitoring.";

} else if (finalScore >= 40) {

level = "Moderate Risk";

description =
"Recent check-ins indicate moderate distress and should be monitored for changes.";

} else {

level = "Low Risk";

description =
"Recent check-ins currently indicate a lower level of reported distress.";

}


if (recent.length < 2) {

pattern = "Limited data";

} else if (
getScore(recent[0].overallStatus) >
getScore(recent[1].overallStatus)
) {

pattern = "Increasing concern";

} else if (
getScore(recent[0].overallStatus) <
getScore(recent[1].overallStatus)
) {

pattern = "Improving";

} else {

pattern = "Stable";

}


return {
score:finalScore,
level:level,
description:description,
pattern:pattern,
highRate:highRate
};

}


/* =========================
   DISPLAY RISK
========================= */

function displayRiskPrediction(history) {

const result =
calculateRisk(history);


riskScore.textContent =
result.score;


riskLevel.textContent =
result.level;


riskDescription.textContent =
result.description;


riskPattern.textContent =
result.pattern;


riskHighRate.textContent =
result.highRate + "%";


riskLatest.textContent =
history.length
? history[0].overallStatus
: "No Data";


/* Remove old classes */

riskLevel.classList.remove(
"risk-low",
"risk-moderate",
"risk-high"
);


riskScore.parentElement.style
.background = "#dcfce7";

riskScore.parentElement.style
.borderColor = "#bbf7d0";


riskMeterFill.style.width =
result.score + "%";


/* Risk colours */

if (result.level === "High Risk") {

riskLevel.classList.add(
"risk-high"
);

riskScore.parentElement.style
.background = "#fee2e2";

riskScore.parentElement.style
.borderColor = "#fecaca";

riskMeterFill.style.background =
"#ef4444";


} else if (
result.level === "Moderate Risk"
) {

riskLevel.classList.add(
"risk-moderate"
);

riskScore.parentElement.style
.background = "#fef3c7";

riskScore.parentElement.style
.borderColor = "#fde68a";

riskMeterFill.style.background =
"#f59e0b";


} else {

riskLevel.classList.add(
"risk-low"
);

riskScore.parentElement.style
.background = "#dcfce7";

riskScore.parentElement.style
.borderColor = "#bbf7d0";

riskMeterFill.style.background =
"#22c55e";

}

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


if (
patient.id ===
selectedPatientId
) {

card.classList.add("active");

}


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


card.onclick =
function () {

selectedPatientId =
patient.id;

displayPatientList();

displaySelectedPatient();

};


patientList.appendChild(card);

});

}


/* =========================
   DISTRESS ALERTS
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
getAlertKey(
patient,
latest
);


const reviewed =
Boolean(
acknowledged[key]
);


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
(
pending === 1
? " Active Alert"
: " Active Alerts"
);


if (pending) {

activeAlertCount.classList.add(
"has-alerts"
);

} else {

activeAlertCount.classList.remove(
"has-alerts"
);

}


if (!alerts.length) {

distressAlertList.innerHTML = `

<div class="history-empty">

<h4>
✅ No Active Distress Alerts
</h4>

<p>
No patient's latest check-in is
currently classified as High Concern.
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

${alert.reviewed
? "✓"
: "⚠️"}

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
${alert.reviewed
? "disabled"
: ""}>

${alert.reviewed
? "Acknowledged"
: "Acknowledge Alert"}

</button>

</div>


<div class="alert-details-panel">

<div class="alert-data-grid">

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


if (!patient)
return;


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


distressAlert.style.display =
status === "High Concern"
? "block"
: "none";

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

if (
item.overallStatus ===
"Low Concern"
)
low++;

else if (
item.overallStatus ===
"Moderate Concern"
)
moderate++;

else if (
item.overallStatus ===
"High Concern"
)
high++;

});


lowCount.textContent = low;

moderateCount.textContent =
moderate;

highCount.textContent =
high;


displayRiskPrediction(history);

displayHistory(history);

displayTrend(history);

displayRiskTimeline(history);

displayAlertHistory();

}


/* =========================
   HISTORY
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
getScore(
history[0].overallStatus
);

const previous =
getScore(
history[1].overallStatus
);


if (current > previous) {

trendDirection.textContent =
"Increasing Concern";

trendDirection.className =
"trend-warning";

} else if (
current < previous
) {

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


const element =
document.createElement("div");

element.className =
"timeline-item";


element.innerHTML = `

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


riskTimeline.appendChild(element);

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


if (!patient)
return;


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
Boolean(
acknowledged[key]
);


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
   INITIALIZE
========================= */

displayPatientList();

displayDistressAlerts();

displaySelectedPatient();

});

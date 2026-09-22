document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       ELEMENTS
    ========================= */

    const patientList = document.getElementById("patient-list");
    const patientName = document.getElementById("doctor-patient-name");
    const patientId = document.getElementById("doctor-patient-id");
    const patientAge = document.getElementById("doctor-patient-age");
    const latestStatus = document.getElementById("doctor-latest-status");

    const totalCheckins = document.getElementById("total-checkins");
    const lowCount = document.getElementById("low-count");
    const moderateCount = document.getElementById("moderate-count");
    const highCount = document.getElementById("high-count");

    const doctorHistory = document.getElementById("doctor-history");

    const trendMood = document.getElementById("trend-mood");
    const trendStress = document.getElementById("trend-stress");
    const trendAnxiety = document.getElementById("trend-anxiety");
    const trendDirection = document.getElementById("trend-direction");

    const distressAlert = document.getElementById("distress-alert");
    const distressAlertList =
        document.getElementById("distress-alert-list");

    const activeAlertCount =
        document.getElementById("active-alert-count");


    /* =========================
       DATA
    ========================= */

    function getPatients() {

        const saved =
            localStorage.getItem("heksaaPatients");

        if (!saved) {
            return [];
        }

        try {

            const data = JSON.parse(saved);

            return Array.isArray(data) ? data : [];

        } catch (error) {

            console.error(
                "HEKSAA: Unable to read patients",
                error
            );

            return [];
        }
    }


    let patients = getPatients();

    let selectedPatientId =
        patients.length > 0
            ? patients[0].id
            : null;


    /* =========================
       UTILITIES
    ========================= */

    function formatValue(value) {

        if (!value) {
            return "No Data";
        }

        return String(value)
            .replace(/-/g, " ")
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
    }


    function formatDate(value) {

        if (!value) {
            return "Time unavailable";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "Time unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }


    function statusClass(status) {

        if (status === "Low Concern") {
            return "status-low";
        }

        if (status === "Moderate Concern") {
            return "status-moderate";
        }

        if (status === "High Concern") {
            return "status-high";
        }

        return "";
    }


    function concernScore(status) {

        if (status === "Low Concern") {
            return 1;
        }

        if (status === "Moderate Concern") {
            return 2;
        }

        if (status === "High Concern") {
            return 3;
        }

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

        } catch (error) {

            return {};
        }
    }


    function saveAcknowledgedAlerts(data) {

        localStorage.setItem(
            "heksaaAcknowledgedAlerts",
            JSON.stringify(data)
        );
    }


    function alertKey(patient, checkin) {

        return (
            String(patient.id) +
            "_" +
            String(checkin.date)
        );
    }


    /* =========================
       DISTRESS ALERT CENTER
    ========================= */

    function displayDistressAlerts() {

        if (!distressAlertList) {
            console.error(
                "HEKSAA: distress-alert-list not found"
            );
            return;
        }


        const acknowledged =
            getAcknowledgedAlerts();


        /* Find patients whose latest
           check-in is High Concern */

        const highConcernPatients =
            patients.filter(function (patient) {

                const history =
                    Array.isArray(patient.history)
                        ? patient.history
                        : [];


                if (history.length === 0) {
                    return false;
                }


                return (
                    history[0].overallStatus ===
                    "High Concern"
                );

            });


        /* Count pending alerts */

        let pendingCount = 0;


        highConcernPatients.forEach(
            function (patient) {

                const latest =
                    patient.history[0];

                const key =
                    alertKey(
                        patient,
                        latest
                    );

                if (!acknowledged[key]) {
                    pendingCount++;
                }

            }
        );


        /* Update counter */

        if (activeAlertCount) {

            activeAlertCount.textContent =
                pendingCount +
                (
                    pendingCount === 1
                        ? " Active Alert"
                        : " Active Alerts"
                );


            if (pendingCount > 0) {

                activeAlertCount.classList.add(
                    "has-alerts"
                );

            } else {

                activeAlertCount.classList.remove(
                    "has-alerts"
                );

            }
        }


        /* Clear old cards */

        distressAlertList.innerHTML = "";


        /* No high-concern patients */

        if (highConcernPatients.length === 0) {

            distressAlertList.innerHTML = `

                <div class="alert-empty">

                    <div class="alert-empty-icon">
                        ✅
                    </div>

                    <h4>
                        No Active Distress Alerts
                    </h4>

                    <p>
                        No patient's latest
                        check-in is currently
                        classified as High Concern.
                    </p>

                </div>

            `;

            return;
        }


        /* =========================
           CREATE ALERT CARDS
        ========================= */

        highConcernPatients.forEach(
            function (patient) {

                const latest =
                    patient.history[0];


                const key =
                    alertKey(
                        patient,
                        latest
                    );


                const isAcknowledged =
                    Boolean(
                        acknowledged[key]
                    );


                /* Main card */

                const card =
                    document.createElement("div");

                card.className =
                    "alert-item";


                if (isAcknowledged) {
                    card.classList.add(
                        "acknowledged"
                    );
                }


                /* Main row */

                const main =
                    document.createElement("div");

                main.className =
                    "alert-main";


                /* Icon */

                const icon =
                    document.createElement("div");

                icon.className =
                    "alert-icon";

                icon.textContent =
                    isAcknowledged
                        ? "✓"
                        : "⚠️";


                /* Details */

                const details =
                    document.createElement("div");

                details.className =
                    "alert-details";


                const name =
                    document.createElement("strong");

                name.textContent =
                    patient.name || "Patient";


                const idStatus =
                    document.createElement("span");

                idStatus.textContent =
                    "ID: " +
                    patient.id +
                    " • High Concern";


                const time =
                    document.createElement("span");

                time.className =
                    "alert-time";

                time.textContent =
                    "Latest check-in: " +
                    formatDate(latest.date);


                const reviewStatus =
                    document.createElement("span");

                reviewStatus.className =
                    "alert-status " +
                    (
                        isAcknowledged
                            ? "reviewed"
                            : "pending"
                    );


                reviewStatus.textContent =
                    isAcknowledged
                        ? "✓ Acknowledged"
                        : "⚠ Awaiting Review";


                details.appendChild(name);
                details.appendChild(idStatus);
                details.appendChild(time);
                details.appendChild(reviewStatus);


                main.appendChild(icon);
                main.appendChild(details);


                /* =========================
                   BUTTONS
                ========================= */

                const actions =
                    document.createElement("div");

                actions.className =
                    "alert-actions";


                /* View Patient */

                const viewButton =
                    document.createElement("button");

                viewButton.type =
                    "button";

                viewButton.className =
                    "alert-view-button";

                viewButton.textContent =
                    "View Patient";


                viewButton.addEventListener(
                    "click",
                    function () {

                        selectedPatientId =
                            patient.id;

                        displayPatientList();

                        displaySelectedPatient();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );


                /* View Details */

                const detailsButton =
                    document.createElement("button");

                detailsButton.type =
                    "button";

                detailsButton.className =
                    "alert-details-button";

                detailsButton.textContent =
                    "View Details";


                /* Acknowledge */

                const acknowledgeButton =
                    document.createElement("button");

                acknowledgeButton.type =
                    "button";

                acknowledgeButton.className =
                    "alert-acknowledge-button";


                if (isAcknowledged) {

                    acknowledgeButton.textContent =
                        "Acknowledged";

                    acknowledgeButton.disabled =
                        true;

                } else {

                    acknowledgeButton.textContent =
                        "Acknowledge Alert";


                    acknowledgeButton.addEventListener(
                        "click",
                        function () {

                            const current =
                                getAcknowledgedAlerts();


                            current[key] = {
                                patientId:
                                    patient.id,

                                patientName:
                                    patient.name,

                                acknowledgedAt:
                                    new Date()
                                        .toISOString()
                            };


                            saveAcknowledgedAlerts(
                                current
                            );


                            displayDistressAlerts();

                        }
                    );

                }


                actions.appendChild(viewButton);
                actions.appendChild(detailsButton);
                actions.appendChild(
                    acknowledgeButton
                );


                /* =========================
                   DETAILS PANEL
                ========================= */

                const detailsPanel =
                    document.createElement("div");

                detailsPanel.className =
                    "alert-details-panel";


                const title =
                    document.createElement("div");

                title.className =
                    "alert-details-title";

                title.textContent =
                    "Check-in Details";


                const grid =
                    document.createElement("div");

                grid.className =
                    "alert-data-grid";


                function createDataBox(
                    label,
                    value
                ) {

                    const box =
                        document.createElement("div");

                    box.className =
                        "alert-data-box";


                    const labelElement =
                        document.createElement("span");

                    labelElement.textContent =
                        label;


                    const valueElement =
                        document.createElement("strong");

                    valueElement.textContent =
                        formatValue(value);


                    box.appendChild(
                        labelElement
                    );

                    box.appendChild(
                        valueElement
                    );


                    return box;
                }


                grid.appendChild(
                    createDataBox(
                        "Mood",
                        latest.mood
                    )
                );


                grid.appendChild(
                    createDataBox(
                        "Stress",
                        latest.stress
                    )
                );


                grid.appendChild(
                    createDataBox(
                        "Anxiety",
                        latest.anxiety
                    )
                );


                detailsPanel.appendChild(title);
                detailsPanel.appendChild(grid);


                detailsButton.addEventListener(
                    "click",
                    function () {

                        const open =
                            detailsPanel.classList
                                .toggle("show");


                        detailsButton.textContent =
                            open
                                ? "Hide Details"
                                : "View Details";

                    }
                );


                /* =========================
                   BUILD CARD
                ========================= */

                card.appendChild(main);
                card.appendChild(actions);
                card.appendChild(detailsPanel);


                distressAlertList.appendChild(
                    card
                );

            }
        );

    }


    /* =========================
       PATIENT LIST
    ========================= */

    function displayPatientList() {

        if (!patientList) {
            return;
        }


        patientList.innerHTML = "";


        if (patients.length === 0) {

            patientList.innerHTML = `

                <div class="patient-list-empty">
                    No patients available.
                </div>

            `;

            return;
        }


        patients.forEach(function (patient) {

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


            const history =
                Array.isArray(patient.history)
                    ? patient.history
                    : [];


            const latest =
                history.length > 0
                    ? history[0]
                    : null;


            const status =
                latest
                    ? latest.overallStatus
                    : "No Data";


            card.innerHTML = `

                <div class="patient-list-avatar">
                    👤
                </div>

                <div class="patient-card-info">

                    <strong>
                        ${patient.name}
                    </strong>

                    <span>
                        ${patient.id}
                        • Age ${patient.age}
                    </span>

                </div>

                <div
                    class="patient-card-status
                    ${statusClass(status)}"
                >
                    ${status}
                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    selectedPatientId =
                        patient.id;

                    displayPatientList();

                    displaySelectedPatient();

                }
            );


            patientList.appendChild(card);

        });

    }


    /* =========================
       SELECTED PATIENT
    ========================= */

    function displaySelectedPatient() {

        const patient =
            patients.find(function (item) {

                return (
                    item.id ===
                    selectedPatientId
                );

            });


        if (!patient) {
            return;
        }


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


        latestStatus.classList.remove(
            "status-low",
            "status-moderate",
            "status-high"
        );


        if (history.length > 0) {

            const status =
                history[0].overallStatus;


            latestStatus.textContent =
                status;


            latestStatus.classList.add(
                statusClass(status)
            );


            if (status === "High Concern") {

                distressAlert.style.display =
                    "block";

            } else {

                distressAlert.style.display =
                    "none";

            }

        } else {

            latestStatus.textContent =
                "No Data";

            distressAlert.style.display =
                "none";
        }


        /* Statistics */

        totalCheckins.textContent =
            history.length;


        let low = 0;
        let moderate = 0;
        let high = 0;


        history.forEach(function (item) {

            if (
                item.overallStatus ===
                "Low Concern"
            ) {

                low++;

            } else if (
                item.overallStatus ===
                "Moderate Concern"
            ) {

                moderate++;

            } else if (
                item.overallStatus ===
                "High Concern"
            ) {

                high++;

            }

        });


        lowCount.textContent =
            low;


        moderateCount.textContent =
            moderate;


        highCount.textContent =
            high;


        displayHistory(history);

        displayTrend(history);

    }


    /* =========================
       HISTORY
    ========================= */

    function displayHistory(history) {

        if (!doctorHistory) {
            return;
        }


        doctorHistory.innerHTML = "";


        if (history.length === 0) {

            doctorHistory.innerHTML = `

                <div class="doctor-empty">

                    <div class="empty-icon">
                        📋
                    </div>

                    <h4>
                        No patient check-ins available
                    </h4>

                    <p>
                        Patient check-in information
                        will appear here when available.
                    </p>

                </div>

            `;

            return;
        }


        history.forEach(function (item) {

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

                    <span
                        class="doctor-status
                        ${statusClass(
                            item.overallStatus
                        )}"
                    >
                        ${item.overallStatus}
                    </span>

                </div>


                <div class="doctor-data">

                    <div class="doctor-data-item">

                        <span>
                            Mood
                        </span>

                        <strong>
                            ${formatValue(item.mood)}
                        </strong>

                    </div>


                    <div class="doctor-data-item">

                        <span>
                            Stress
                        </span>

                        <strong>
                            ${formatValue(item.stress)}
                        </strong>

                    </div>


                    <div class="doctor-data-item">

                        <span>
                            Anxiety
                        </span>

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

        if (history.length === 0) {

            trendMood.textContent = "No Data";
            trendStress.textContent = "No Data";
            trendAnxiety.textContent = "No Data";
            trendDirection.textContent = "No Data";

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

            trendDirection.className = "";

            return;
        }


        const latestScore =
            concernScore(
                history[0].overallStatus
            );


        const previousScore =
            concernScore(
                history[1].overallStatus
            );


        if (latestScore > previousScore) {

            trendDirection.textContent =
                "Increasing Concern";

            trendDirection.className =
                "trend-warning";

        } else if (
            latestScore < previousScore
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
       INITIALIZE
    ========================= */

    displayPatientList();

    displayDistressAlerts();

    displaySelectedPatient();

});

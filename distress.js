document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEKSAA DISTRESS ALERT SYSTEM
    ===================================================== */

    const ALERT_STORAGE_KEY = "heksaaDistressAlerts";


    /* =====================================================
       STORAGE
    ===================================================== */

    function getAlerts() {

        try {

            const saved =
                localStorage.getItem(ALERT_STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const data = JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            return [];

        }

    }


    function saveAlerts(alerts) {

        localStorage.setItem(
            ALERT_STORAGE_KEY,
            JSON.stringify(alerts)
        );

    }


    /* =====================================================
       PROFILE
    ===================================================== */

    function getPatientProfile() {

        try {

            const saved =
                localStorage.getItem(
                    "heksaaPatientProfile"
                );

            if (!saved) {
                return null;
            }

            return JSON.parse(saved);

        } catch (error) {

            return null;

        }

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "Time unavailable";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "Time unavailable";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       PATIENT SIDE
    ===================================================== */

    function createPatientDistressCard() {

        const checkinCard =
            document.querySelector(".checkin-card");

        if (!checkinCard) {
            return;
        }


        /* Prevent duplicate card */

        if (
            document.getElementById(
                "patient-distress-card"
            )
        ) {
            return;
        }


        const card =
            document.createElement("div");

        card.id =
            "patient-distress-card";

        card.className =
            "patient-distress-card";


        card.innerHTML = `

            <div class="distress-patient-icon">
                🚨
            </div>

            <div class="distress-patient-content">

                <h3>
                    Feeling Distressed?
                </h3>

                <p>
                    If you are currently experiencing
                    severe emotional distress or feel
                    that you need immediate support,
                    you can send a distress alert to
                    your doctor or counselor.
                </p>

                <button
                    type="button"
                    id="distress-help-button"
                    class="distress-help-button"
                >
                    🚨 I Need Help
                </button>

                <p
                    id="distress-help-message"
                    class="distress-help-message"
                ></p>

            </div>

        `;


        /*
           Put the card after the check-in card
        */

        checkinCard.insertAdjacentElement(
            "afterend",
            card
        );


        const button =
            document.getElementById(
                "distress-help-button"
            );

        const message =
            document.getElementById(
                "distress-help-message"
            );


        button.addEventListener(
            "click",
            function () {

                const profile =
                    getPatientProfile();


                if (!profile) {

                    message.textContent =
                        "Please save your patient profile first.";

                    message.className =
                        "distress-help-message error";

                    return;

                }


                /*
                   Prevent accidental repeated alerts
                */

                const alerts =
                    getAlerts();


                const existing =
                    alerts.find(
                        alert =>
                            alert.patientId === profile.id &&
                            alert.status === "Pending"
                    );


                if (existing) {

                    message.textContent =
                        "Your distress alert is already active. Your doctor has been notified.";

                    message.className =
                        "distress-help-message success";

                    return;

                }


                /*
                   Create alert
                */

                const alert = {

                    alertId:
                        "DIST-" +
                        Date.now(),

                    patientName:
                        profile.name || "Patient",

                    patientId:
                        profile.id || "Unknown",

                    patientAge:
                        profile.age || "Unknown",

                    createdAt:
                        new Date().toISOString(),

                    status:
                        "Pending",

                    acknowledgedAt:
                        null

                };


                alerts.unshift(alert);

                saveAlerts(alerts);


                message.textContent =
                    "✓ Distress alert sent. Your doctor/counselor can now see this alert.";

                message.className =
                    "distress-help-message success";


                button.textContent =
                    "✓ Alert Sent";

                button.disabled =
                    true;

                button.classList.add(
                    "distress-sent"
                );


            }
        );

    }


    /* =====================================================
       DOCTOR SIDE
    ===================================================== */

    function createDoctorDistressSection() {

        const alertList =
            document.getElementById(
                "distress-alert-list"
            );

        if (!alertList) {
            return;
        }


        const alerts =
            getAlerts();


        /*
           Remove previously generated
           self-report cards
        */

        document
            .querySelectorAll(
                ".self-distress-alert"
            )
            .forEach(
                element =>
                    element.remove()
            );


        /*
           Sort newest first
        */

        alerts.sort(
            function (a, b) {

                return new Date(b.createdAt)
                    - new Date(a.createdAt);

            }
        );


        /*
           Create alerts
        */

        alerts.forEach(
            function (alert) {

                const card =
                    document.createElement("div");

                card.className =
                    "alert-item self-distress-alert";


                if (
                    alert.status ===
                    "Acknowledged"
                ) {

                    card.classList.add(
                        "acknowledged"
                    );

                }


                card.innerHTML = `

                    <div class="alert-main">

                        <div class="alert-icon">

                            ${
                                alert.status ===
                                "Acknowledged"
                                ? "✓"
                                : "🚨"
                            }

                        </div>


                        <div class="alert-details">

                            <strong>
                                ${alert.patientName}
                            </strong>

                            <span>
                                ID: ${alert.patientId}
                                • Self-Reported Distress
                            </span>

                            <span class="alert-time">
                                Reported:
                                ${formatDate(
                                    alert.createdAt
                                )}
                            </span>


                            <span
                                class="alert-status ${
                                    alert.status ===
                                    "Acknowledged"
                                    ? "reviewed"
                                    : "pending"
                                }"
                            >

                                ${
                                    alert.status ===
                                    "Acknowledged"
                                    ? "✓ Acknowledged"
                                    : "🚨 Patient Requested Help"
                                }

                            </span>

                        </div>

                    </div>


                    <div class="alert-actions">

                        <button
                            class="self-view-patient"
                        >
                            View Patient
                        </button>


                        <button
                            class="self-view-details"
                        >
                            View Details
                        </button>


                        <button
                            class="self-acknowledge"
                            ${
                                alert.status ===
                                "Acknowledged"
                                ? "disabled"
                                : ""
                            }
                        >

                            ${
                                alert.status ===
                                "Acknowledged"
                                ? "Acknowledged"
                                : "Acknowledge Alert"
                            }

                        </button>

                    </div>


                    <div
                        class="alert-details-panel"
                    >

                        <div
                            class="alert-data-grid"
                        >

                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Patient
                                </span>

                                <strong>
                                    ${alert.patientName}
                                </strong>

                            </div>


                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Patient ID
                                </span>

                                <strong>
                                    ${alert.patientId}
                                </strong>

                            </div>


                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Age
                                </span>

                                <strong>
                                    ${alert.patientAge}
                                </strong>

                            </div>

                        </div>

                    </div>

                `;


                /*
                   View Details
                */

                const detailsButton =
                    card.querySelector(
                        ".self-view-details"
                    );

                const detailsPanel =
                    card.querySelector(
                        ".alert-details-panel"
                    );


                detailsButton.onclick =
                    function () {

                        const visible =
                            detailsPanel.classList.toggle(
                                "show"
                            );

                        detailsButton.textContent =
                            visible
                            ? "Hide Details"
                            : "View Details";

                    };


                /*
                   Acknowledge
                */

                const acknowledgeButton =
                    card.querySelector(
                        ".self-acknowledge"
                    );


                if (
                    alert.status !==
                    "Acknowledged"
                ) {

                    acknowledgeButton.onclick =
                        function () {

                            const currentAlerts =
                                getAlerts();


                            const target =
                                currentAlerts.find(
                                    item =>
                                        item.alertId ===
                                        alert.alertId
                                );


                            if (!target) {
                                return;
                            }


                            target.status =
                                "Acknowledged";


                            target.acknowledgedAt =
                                new Date()
                                    .toISOString();


                            saveAlerts(
                                currentAlerts
                            );


                            createDoctorDistressSection();

                        };

                }


                /*
                   View Patient
                */

                const viewPatientButton =
                    card.querySelector(
                        ".self-view-patient"
                    );


                viewPatientButton.onclick =
                    function () {

                        /*
                           Try to find patient
                           card in doctor dashboard
                        */

                        const patientCards =
                            document.querySelectorAll(
                                ".patient-card"
                            );


                        let found = false;


                        patientCards.forEach(
                            function (patientCard) {

                                if (
                                    patientCard.textContent
                                        .includes(
                                            alert.patientId
                                        )
                                ) {

                                    patientCard.click();

                                    found = true;

                                }

                            }
                        );


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });


                    };


                alertList.appendChild(
                    card
                );

            }
        );


        updateDoctorAlertCount();

    }


    /* =====================================================
       UPDATE ALERT COUNT
    ===================================================== */

    function updateDoctorAlertCount() {

        const counter =
            document.getElementById(
                "active-alert-count"
            );


        if (!counter) {
            return;
        }


        const selfAlerts =
            getAlerts();


        const pendingSelfAlerts =
            selfAlerts.filter(
                alert =>
                    alert.status ===
                    "Pending"
            ).length;


        /*
           Existing HEKSAA alerts
        */

        const existingPending =
            document.querySelectorAll(
                "#distress-alert-list .alert-item:not(.acknowledged):not(.self-distress-alert)"
            ).length;


        const total =
            pendingSelfAlerts +
            existingPending;


        counter.textContent =
            total +
            (
                total === 1
                ? " Active Alert"
                : " Active Alerts"
            );


        if (total > 0) {

            counter.classList.add(
                "has-alerts"
            );

        } else {

            counter.classList.remove(
                "has-alerts"
            );

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    createPatientDistressCard();

    createDoctorDistressSection();


    /*
       Refresh doctor alerts periodically
       for prototype demonstration.
    */

    if (
        document.getElementById(
            "distress-alert-list"
        )
    ) {

        setInterval(
            function () {

                createDoctorDistressSection();

            },
            3000
        );

    }

});

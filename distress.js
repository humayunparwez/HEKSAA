document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEKSAA DISTRESS ALERT SYSTEM
    ===================================================== */

    const ALERT_STORAGE_KEY = "heksaaDistressAlerts";

    /*
       Stores which alert's details are currently open.
       This prevents the 3-second refresh from closing it.
    */
    let openDetailAlertId = null;


    /* =====================================================
       STORAGE
    ===================================================== */

    function getAlerts() {

        try {

            const saved =
                localStorage.getItem(
                    ALERT_STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const data =
                JSON.parse(saved);

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
       PATIENT PROFILE
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
       DATE FORMAT
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "Time unavailable";
        }

        const date =
            new Date(value);

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
            document.querySelector(
                ".checkin-card"
            );

        if (!checkinCard) {
            return;
        }


        /*
           Prevent duplicate card
        */

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
           Insert after check-in card
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


        /* =================================================
           SEND DISTRESS ALERT
        ================================================= */

        button.addEventListener(
            "click",
            function () {

                const profile =
                    getPatientProfile();


                /*
                   Profile required
                */

                if (!profile) {

                    message.textContent =
                        "Please save your patient profile first.";

                    message.className =
                        "distress-help-message error";

                    return;
                }


                /*
                   Get existing alerts
                */

                const alerts =
                    getAlerts();


                /*
                   Prevent duplicate pending alert
                */

                const existing =
                    alerts.find(
                        alert =>
                            alert.patientId ===
                                profile.id &&
                            alert.status ===
                                "Pending"
                    );


                if (existing) {

                    message.textContent =
                        "Your distress alert is already active. Your doctor has been notified.";

                    message.className =
                        "distress-help-message success";

                    return;
                }


                /*
                   Create new distress alert
                */

                const alert = {

                    alertId:
                        "DIST-" +
                        Date.now(),

                    patientName:
                        profile.name ||
                        "Patient",

                    patientId:
                        profile.id ||
                        "Unknown",

                    patientAge:
                        profile.age ||
                        "Unknown",

                    createdAt:
                        new Date()
                            .toISOString(),

                    status:
                        "Pending",

                    acknowledgedAt:
                        null

                };


                /*
                   Add alert to beginning
                */

                alerts.unshift(
                    alert
                );


                saveAlerts(
                    alerts
                );


                /*
                   Confirmation
                */

                message.textContent =
                    "✓ Distress alert sent. Your doctor/counselor can now see this alert.";

                message.className =
                    "distress-help-message success";


                /*
                   Disable button
                */

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


        /*
           Get alerts
        */

        const alerts =
            getAlerts();


        /*
           Remove previously generated
           self-report cards.

           They will be recreated below.
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

                return (
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
                );

            }
        );


        /* =================================================
           CREATE SELF-REPORTED ALERT CARDS
        ================================================= */

        alerts.forEach(
            function (alert) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "alert-item self-distress-alert";


                /*
                   Add acknowledged class
                */

                if (
                    alert.status ===
                    "Acknowledged"
                ) {

                    card.classList.add(
                        "acknowledged"
                    );

                }


                /*
                   Alert HTML
                */

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

                        <!--
                           Same class as the original
                           View Patient button
                        -->

                        <button
                            class="self-view-patient alert-view-button"
                            type="button"
                        >
                            View Patient
                        </button>


                        <!--
                           Same class as the original
                           View Details button
                        -->

                        <button
                            class="self-view-details alert-details-button"
                            type="button"
                        >
                            View Details
                        </button>


                        <!--
                           Same class as the original
                           Acknowledge button
                        -->

                        <button
                            class="self-acknowledge alert-acknowledge-button"
                            type="button"
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


                    <!--
                       Hidden details panel
                    -->

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


                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Alert Type
                                </span>

                                <strong>
                                    Self-Reported Distress
                                </strong>

                            </div>


                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Reported At
                                </span>

                                <strong>
                                    ${formatDate(
                                        alert.createdAt
                                    )}
                                </strong>

                            </div>


                            <div
                                class="alert-data-box"
                            >

                                <span>
                                    Status
                                </span>

                                <strong>
                                    ${alert.status}
                                </strong>

                            </div>


                            ${
                                alert.acknowledgedAt
                                ? `

                                    <div
                                        class="alert-data-box"
                                    >

                                        <span>
                                            Acknowledged At
                                        </span>

                                        <strong>
                                            ${formatDate(
                                                alert.acknowledgedAt
                                            )}
                                        </strong>

                                    </div>

                                `
                                : ""
                            }

                        </div>

                    </div>

                `;


                /* =================================================
                   BUTTON REFERENCES
                ================================================= */

                const detailsButton =
                    card.querySelector(
                        ".self-view-details"
                    );


                const detailsPanel =
                    card.querySelector(
                        ".alert-details-panel"
                    );


                const acknowledgeButton =
                    card.querySelector(
                        ".self-acknowledge"
                    );


                const viewPatientButton =
                    card.querySelector(
                        ".self-view-patient"
                    );


                /* =================================================
                   RESTORE OPEN DETAILS
                   
                   Important:
                   The dashboard refreshes every 3 seconds.
                   If this alert was open before the refresh,
                   open it again automatically.
                ================================================= */

                if (
                    openDetailAlertId ===
                    alert.alertId
                ) {

                    detailsPanel.classList.add(
                        "show"
                    );

                    detailsButton.textContent =
                        "Hide Details";

                }


                /* =================================================
                   VIEW DETAILS
                ================================================= */

                detailsButton.onclick =
                    function () {

                        const currentlyVisible =
                            detailsPanel.classList.contains(
                                "show"
                            );


                        if (
                            currentlyVisible
                        ) {

                            /*
                               Close details
                            */

                            detailsPanel.classList.remove(
                                "show"
                            );

                            detailsButton.textContent =
                                "View Details";

                            openDetailAlertId =
                                null;

                        } else {

                            /*
                               Open details
                            */

                            detailsPanel.classList.add(
                                "show"
                            );

                            detailsButton.textContent =
                                "Hide Details";

                            /*
                               Remember this alert
                            */

                            openDetailAlertId =
                                alert.alertId;

                        }

                    };


                /* =================================================
                   ACKNOWLEDGE ALERT
                ================================================= */

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


                            /*
                               Change status
                            */

                            target.status =
                                "Acknowledged";


                            target.acknowledgedAt =
                                new Date()
                                    .toISOString();


                            /*
                               Save
                            */

                            saveAlerts(
                                currentAlerts
                            );


                            /*
                               Keep details open
                               after rerender
                            */

                            createDoctorDistressSection();

                        };

                }


                /* =================================================
                   VIEW PATIENT
                ================================================= */

                viewPatientButton.onclick =
                    function () {

                        /*
                           Find matching patient card
                        */

                        const patientCards =
                            document.querySelectorAll(
                                ".patient-card"
                            );


                        let found =
                            false;


                        patientCards.forEach(
                            function (
                                patientCard
                            ) {

                                if (
                                    patientCard
                                        .textContent
                                        .includes(
                                            alert.patientId
                                        )
                                ) {

                                    patientCard.click();

                                    found =
                                        true;

                                }

                            }
                        );


                        /*
                           Scroll to patient area
                        */

                        window.scrollTo({

                            top: 0,

                            behavior:
                                "smooth"

                        });

                    };


                /*
                   Add card to alert list
                */

                alertList.appendChild(
                    card
                );

            }
        );


        /*
           Update active alert count
        */

        updateDoctorAlertCount();

    }


    /* =====================================================
       UPDATE ACTIVE ALERT COUNT
    ===================================================== */

    function updateDoctorAlertCount() {

        const counter =
            document.getElementById(
                "active-alert-count"
            );


        if (!counter) {
            return;
        }


        /*
           Self-reported alerts
        */

        const selfAlerts =
            getAlerts();


        const pendingSelfAlerts =
            selfAlerts.filter(
                alert =>
                    alert.status ===
                    "Pending"
            ).length;


        /*
           Existing HEKSAA generated alerts
        */

        const existingPending =
            document.querySelectorAll(
                "#distress-alert-list .alert-item:not(.acknowledged):not(.self-distress-alert)"
            ).length;


        /*
           Total
        */

        const total =
            pendingSelfAlerts +
            existingPending;


        /*
           Display count
        */

        counter.textContent =
            total +
            (
                total === 1
                    ? " Active Alert"
                    : " Active Alerts"
            );


        /*
           Add/remove alert indicator
        */

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


    /* =====================================================
       AUTO REFRESH
       
       Prototype refresh every 3 seconds.
       
       The openDetailAlertId variable makes sure that
       View Details does not disappear during refresh.
    ===================================================== */

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

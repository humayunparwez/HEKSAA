document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEKSAA REAL-TIME ALERT NOTIFICATION SYSTEM
    ===================================================== */

    const ALERT_STORAGE_KEY =
        "heksaaDistressAlerts";

    const ESCALATION_TIME =
        60 * 1000;

    let notifiedAlerts = [];

    let currentNotificationAlertId =
        null;


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
       TIME
    ===================================================== */

    function formatTime(value) {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       NOTIFICATION CONTAINER
    ===================================================== */

    function createNotificationContainer() {

        if (
            document.getElementById(
                "heksaa-alert-notification"
            )
        ) {
            return;
        }


        const notification =
            document.createElement("div");


        notification.id =
            "heksaa-alert-notification";


        notification.className =
            "heksaa-alert-notification";


        notification.innerHTML = `

            <div class="heksaa-notification-icon">
                🚨
            </div>


            <div class="heksaa-notification-content">

                <div
                    id="heksaa-notification-title"
                    class="heksaa-notification-title"
                >
                    New Distress Alert
                </div>


                <div
                    id="heksaa-notification-message"
                    class="heksaa-notification-message"
                ></div>


                <div
                    id="heksaa-notification-time"
                    class="heksaa-notification-time"
                ></div>


                <div class="heksaa-notification-actions">

                    <button
                        type="button"
                        id="heksaa-notification-view"
                    >
                        View Alert
                    </button>


                    <button
                        type="button"
                        id="heksaa-notification-close"
                    >
                        Close
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            notification
        );


        document
            .getElementById(
                "heksaa-notification-close"
            )
            .addEventListener(
                "click",
                function () {

                    hideNotification();

                }
            );


        document
            .getElementById(
                "heksaa-notification-view"
            )
            .addEventListener(
                "click",
                function () {

                    hideNotification();


                    const list =
                        document.getElementById(
                            "distress-alert-list"
                        );


                    if (list) {

                        list.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                }
            );

    }


    /* =====================================================
       SHOW NEW ALERT
    ===================================================== */

    function showNotification(alert) {

        createNotificationContainer();


        const notification =
            document.getElementById(
                "heksaa-alert-notification"
            );


        const title =
            document.getElementById(
                "heksaa-notification-title"
            );


        const message =
            document.getElementById(
                "heksaa-notification-message"
            );


        const time =
            document.getElementById(
                "heksaa-notification-time"
            );


        if (!notification) {
            return;
        }


        currentNotificationAlertId =
            alert.alertId;


        title.textContent =
            "New Distress Alert";


        message.textContent =
            `${alert.patientName} (${alert.patientId}) has reported that they are currently in distress.`;


        time.textContent =
            `Reported at ${formatTime(
                alert.createdAt
            )}`;


        notification.classList.remove(
            "escalated"
        );


        notification.classList.add(
            "show"
        );


        document.title =
            "🚨 New Distress Alert | HEKSAA";


        sendBrowserNotification(
            alert,
            false
        );


        playAlertSound();

    }


    /* =====================================================
       SHOW ESCALATION NOTIFICATION
    ===================================================== */

    function showEscalationNotification(
        alert
    ) {

        createNotificationContainer();


        const notification =
            document.getElementById(
                "heksaa-alert-notification"
            );


        const title =
            document.getElementById(
                "heksaa-notification-title"
            );


        const message =
            document.getElementById(
                "heksaa-notification-message"
            );


        const time =
            document.getElementById(
                "heksaa-notification-time"
            );


        if (!notification) {
            return;
        }


        currentNotificationAlertId =
            alert.alertId;


        title.textContent =
            "⚠️ Distress Alert Escalated";


        message.textContent =
            `${alert.patientName} (${alert.patientId}) has an unacknowledged distress alert.`;


        time.textContent =
            "Escalation threshold reached.";


        notification.classList.add(
            "show",
            "escalated"
        );


        document.title =
            "⚠️ ESCALATED ALERT | HEKSAA";


        sendBrowserNotification(
            alert,
            true
        );


        playAlertSound();

    }


    /* =====================================================
       HIDE NOTIFICATION
    ===================================================== */

    function hideNotification() {

        const notification =
            document.getElementById(
                "heksaa-alert-notification"
            );


        if (notification) {

            notification.classList.remove(
                "show"
            );

        }


        document.title =
            "HEKSAA Doctor Dashboard";

    }


    /* =====================================================
       BROWSER NOTIFICATION
    ===================================================== */

    function sendBrowserNotification(
        alert,
        escalated
    ) {

        if (
            typeof Notification ===
            "undefined"
        ) {
            return;
        }


        if (
            Notification.permission !==
            "granted"
        ) {
            return;
        }


        try {

            new Notification(
                escalated
                    ? "⚠️ HEKSAA Alert Escalated"
                    : "🚨 HEKSAA Distress Alert",
                {
                    body:
                        `${alert.patientName} (${alert.patientId}) ${
                            escalated
                                ? "has an unacknowledged distress alert."
                                : "requested help."
                        }`
                }
            );

        } catch (error) {

            /* Browser notification unavailable */

        }

    }


    /* =====================================================
       REQUEST NOTIFICATION PERMISSION
    ===================================================== */

    function requestNotificationPermission() {

        if (
            typeof Notification ===
            "undefined"
        ) {
            return;
        }


        if (
            Notification.permission ===
            "default"
        ) {

            Notification.requestPermission();

        }

    }


    /* =====================================================
       ALERT SOUND
    ===================================================== */

    function playAlertSound() {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContext) {
                return;
            }


            const audioContext =
                new AudioContext();


            const oscillator =
                audioContext.createOscillator();


            const gain =
                audioContext.createGain();


            oscillator.type =
                "sine";


            oscillator.frequency.value =
                880;


            gain.gain.value =
                0.08;


            oscillator.connect(
                gain
            );


            gain.connect(
                audioContext.destination
            );


            oscillator.start();


            oscillator.stop(
                audioContext.currentTime +
                0.25
            );

        } catch (error) {

            /* Audio may be blocked by browser */

        }

    }


    /* =====================================================
       CHECK NEW ALERTS
    ===================================================== */

    function checkForNewAlerts() {

        const alerts =
            getAlerts();


        if (!alerts.length) {
            return;
        }


        const pendingAlerts =
            alerts
                .filter(
                    alert =>
                        alert.status ===
                        "Pending"
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                );


        if (!pendingAlerts.length) {
            return;
        }


        const newest =
            pendingAlerts[0];


        /*
           Initialize existing alerts without
           treating them as new.
        */

        if (
            notifiedAlerts.length ===
            0
        ) {

            notifiedAlerts =
                alerts.map(
                    alert =>
                        alert.alertId
                );

            checkEscalation(
                alerts
            );

            return;

        }


        const isNew =
            !notifiedAlerts.includes(
                newest.alertId
            );


        if (isNew) {

            notifiedAlerts.push(
                newest.alertId
            );


            showNotification(
                newest
            );

        }


        checkEscalation(
            alerts
        );

    }


    /* =====================================================
       ESCALATION
    ===================================================== */

    function checkEscalation(
        alerts
    ) {

        let changed =
            false;


        const now =
            Date.now();


        alerts.forEach(
            function (alert) {

                /*
                   IMPORTANT:
                   Only pending alerts can escalate.
                */

                if (
                    alert.status !==
                    "Pending"
                ) {
                    return;
                }


                if (
                    alert.escalatedAt
                ) {
                    return;
                }


                const created =
                    new Date(
                        alert.createdAt
                    ).getTime();


                if (
                    isNaN(created)
                ) {
                    return;
                }


                const elapsed =
                    now -
                    created;


                if (
                    elapsed >=
                    ESCALATION_TIME
                ) {

                    alert.escalatedAt =
                        new Date()
                            .toISOString();

                    changed =
                        true;

                }

            }
        );


        if (changed) {

            saveAlerts(
                alerts
            );

        }


        updateEscalatedUI(
            alerts
        );

    }


    /* =====================================================
       ESCALATED CARD UI
    ===================================================== */

    function updateEscalatedUI(
        alerts
    ) {

        alerts.forEach(
            function (alert) {

                /*
                   IMPORTANT:
                   Acknowledged alerts should NEVER
                   show the active escalation badge.
                */

                if (
                    alert.status !==
                    "Pending" ||
                    !alert.escalatedAt
                ) {
                    return;
                }


                const cards =
                    document.querySelectorAll(
                        ".self-distress-alert"
                    );


                cards.forEach(
                    function (card) {

                        if (
                            !card.textContent.includes(
                                alert.patientId
                            )
                        ) {
                            return;
                        }


                        card.classList.add(
                            "distress-escalated"
                        );


                        if (
                            card.querySelector(
                                ".distress-escalated-badge"
                            )
                        ) {
                            return;
                        }


                        const badge =
                            document.createElement(
                                "div"
                            );


                        badge.className =
                            "distress-escalated-badge";


                        badge.innerHTML =
                            `⚠️ ESCALATED — Unacknowledged for more than 1 minute`;


                        /*
                           Put the badge BELOW
                           the patient information,
                           not inside the horizontal
                           alert-main row.
                        */

                        const alertDetails =
                            card.querySelector(
                                ".alert-details"
                            );


                        if (alertDetails) {

                            alertDetails.appendChild(
                                badge
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       ESCALATION NOTIFICATION CHECK
    ===================================================== */

    function checkEscalationNotification() {

        const alerts =
            getAlerts();


        alerts.forEach(
            function (alert) {

                /*
                   Only pending + escalated alerts
                */

                if (
                    alert.status !==
                    "Pending" ||
                    !alert.escalatedAt
                ) {
                    return;
                }


                const escalationKey =
                    "escalation-" +
                    alert.alertId;


                if (
                    notifiedAlerts.includes(
                        escalationKey
                    )
                ) {
                    return;
                }


                notifiedAlerts.push(
                    escalationKey
                );


                showEscalationNotification(
                    alert
                );

            }
        );

    }


    /* =====================================================
       ENABLE BROWSER NOTIFICATIONS
    ===================================================== */

    document.addEventListener(
        "click",
        function () {

            requestNotificationPermission();

        },
        {
            once: true
        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    if (
        !document.getElementById(
            "distress-alert-list"
        )
    ) {
        return;
    }


    createNotificationContainer();


    checkForNewAlerts();


    /*
       Check every second
    */

    setInterval(
        function () {

            checkForNewAlerts();

            checkEscalationNotification();

        },
        1000
    );

});

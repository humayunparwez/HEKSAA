document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEKSAA REAL-TIME ALERT NOTIFICATION SYSTEM
    ===================================================== */

    const ALERT_STORAGE_KEY = "heksaaDistressAlerts";

    const ESCALATION_TIME = 60 * 1000;

    let notifiedAlerts = [];


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

        try {

            localStorage.setItem(
                ALERT_STORAGE_KEY,
                JSON.stringify(alerts)
            );

        } catch (error) {

            console.error(
                "HEKSAA: Unable to save alerts.",
                error
            );

        }

    }


    /* =====================================================
       TIME
    ===================================================== */

    function formatTime(value) {

        if (!value) {
            return "";
        }

        const date = new Date(value);

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


        document.body.appendChild(notification);


        const closeButton =
            document.getElementById(
                "heksaa-notification-close"
            );

        const viewButton =
            document.getElementById(
                "heksaa-notification-view"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function () {

                    hideNotification();

                }
            );

        }


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                function () {

                    const alertId =
                        notification.dataset.alertId;

                    hideNotification();

                    scrollToAlert(alertId);

                }
            );

        }

    }


    /* =====================================================
       SCROLL TO EXACT ALERT
    ===================================================== */

    function scrollToAlert(alertId) {

        if (!alertId) {
            return;
        }


        const card =
            document.querySelector(
                `.self-distress-alert[data-alert-id="${alertId}"]`
            );


        if (card) {

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            card.classList.add(
                "heksaa-alert-highlight"
            );


            setTimeout(
                function () {

                    card.classList.remove(
                        "heksaa-alert-highlight"
                    );

                },
                2500
            );

            return;
        }


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


        notification.dataset.alertId =
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

    function showEscalationNotification(alert) {

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


        notification.dataset.alertId =
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


            oscillator.connect(gain);

            gain.connect(
                audioContext.destination
            );


            oscillator.start();


            oscillator.stop(
                audioContext.currentTime +
                0.25
            );


            oscillator.onended =
                function () {

                    audioContext.close();

                };

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

            checkEscalation(alerts);

            return;

        }


        /*
           First run:
           Register existing alerts without
           treating them as newly created.
        */

        if (
            notifiedAlerts.length ===
            0
        ) {

            notifiedAlerts =
                alerts
                    .map(
                        alert =>
                            alert.alertId
                    )
                    .filter(Boolean);


            checkEscalation(
                alerts
            );

            return;

        }


        /*
           Check all pending alerts instead
           of checking only the newest one.
        */

        pendingAlerts.forEach(
            function (alert) {

                if (!alert.alertId) {
                    return;
                }


                if (
                    !notifiedAlerts.includes(
                        alert.alertId
                    )
                ) {

                    notifiedAlerts.push(
                        alert.alertId
                    );


                    showNotification(
                        alert
                    );

                }

            }
        );


        checkEscalation(
            alerts
        );

    }


    /* =====================================================
       ESCALATION
    ===================================================== */

    function checkEscalation(alerts) {

        let changed =
            false;


        const now =
            Date.now();


        alerts.forEach(
            function (alert) {

                /*
                   Only Pending alerts
                   are allowed to escalate.
                */

                if (
                    alert.status !==
                    "Pending"
                ) {
                    return;
                }


                /*
                   Already escalated.
                */

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

    function updateEscalatedUI(alerts) {

        const cards =
            document.querySelectorAll(
                ".self-distress-alert[data-alert-id]"
            );


        if (!cards.length) {
            return;
        }


        cards.forEach(
            function (card) {

                const cardAlertId =
                    card.dataset.alertId;


                if (!cardAlertId) {
                    return;
                }


                /*
                   Find the exact alert using
                   the unique alertId.
                */

                const alert =
                    alerts.find(
                        item =>
                            item.alertId ===
                            cardAlertId
                    );


                if (!alert) {
                    return;
                }


                /*
                   Only Pending + escalated alerts
                   receive the active escalation UI.
                */

                const shouldBeEscalated =
                    alert.status ===
                    "Pending" &&
                    Boolean(
                        alert.escalatedAt
                    );


                if (
                    shouldBeEscalated
                ) {

                    card.classList.add(
                        "distress-escalated"
                    );


                    if (
                        !card.querySelector(
                            ".distress-escalated-badge"
                        )
                    ) {

                        const badge =
                            document.createElement(
                                "div"
                            );


                        badge.className =
                            "distress-escalated-badge";


                        badge.innerHTML =
                            `⚠️ ESCALATED — Unacknowledged for more than 1 minute`;


                        const alertDetails =
                            card.querySelector(
                                ".alert-details"
                            );


                        if (alertDetails) {

                            alertDetails.appendChild(
                                badge
                            );

                        } else {

                            card.appendChild(
                                badge
                            );

                        }

                    }

                } else {

                    /*
                       Remove escalation UI if the alert
                       has been acknowledged or otherwise
                       stopped being Pending.
                    */

                    card.classList.remove(
                        "distress-escalated"
                    );


                    const badge =
                        card.querySelector(
                            ".distress-escalated-badge"
                        );


                    if (badge) {

                        badge.remove();

                    }

                }

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
                   Only Pending + Escalated alerts
                   can trigger this notification.
                */

                if (
                    alert.status !==
                    "Pending" ||
                    !alert.escalatedAt
                ) {
                    return;
                }


                if (!alert.alertId) {
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

    /*
       This script is intended for the
       Doctor Dashboard.
    */

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
       Check every second.
    */

    setInterval(
        function () {

            checkForNewAlerts();

            checkEscalationNotification();

        },
        1000
    );

});

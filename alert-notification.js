document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEKSAA REAL-TIME ALERT NOTIFICATION SYSTEM
    ===================================================== */

    const ALERT_STORAGE_KEY = "heksaaDistressAlerts";

    /*
       Prototype escalation time.

       60 seconds = 1 minute.

       Later, when backend is connected, this can be
       changed to a server-side escalation rule.
    */
    const ESCALATION_TIME = 60 * 1000;


    /*
       Store alerts that have already generated
       a notification on this doctor session.
    */
    let notifiedAlerts = [];


    /*
       Store currently visible notification
    */
    let currentNotificationAlertId = null;


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
       DATE FORMAT
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
       CREATE NOTIFICATION CONTAINER
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

                <div class="heksaa-notification-title">
                    New Distress Alert
                </div>


                <div
                    id="heksaa-notification-message"
                    class="heksaa-notification-message"
                >
                    A patient has requested help.
                </div>


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


        /*
           Close notification
        */

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


        /*
           View alert
        */

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
       SHOW NOTIFICATION
    ===================================================== */

    function showNotification(alert) {

        createNotificationContainer();


        const notification =
            document.getElementById(
                "heksaa-alert-notification"
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


        /*
           Browser title notification
        */

        document.title =
            "🚨 New Distress Alert | HEKSAA";


        /*
           Try browser notification
           if permission already exists.
        */

        sendBrowserNotification(
            alert
        );


        /*
           Try notification sound
        */

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
        alert
    ) {

        /*
           Only use browser notification if permission
           has already been granted.

           We don't automatically request permission
           because browsers may block it.
        */

        if (
            typeof Notification ===
            "undefined"
        ) {
            return;
        }


        if (
            Notification.permission ===
            "granted"
        ) {

            try {

                new Notification(
                    "HEKSAA — Distress Alert",
                    {
                        body:
                            `${alert.patientName} (${alert.patientId}) requested help.`,
                        icon:
                            "https://humayunparwez.github.io/HEKSAA/favicon.ico"
                    }
                );

            } catch (error) {

                /* Ignore browser notification errors */

            }

        }

    }


    /* =====================================================
       REQUEST BROWSER NOTIFICATION PERMISSION
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

            /*
               Browser may block autoplay audio.
               That's okay.
            */

        }

    }


    /* =====================================================
       FIND NEW ALERTS
    ===================================================== */

    function checkForNewAlerts() {

        const alerts =
            getAlerts();


        if (!alerts.length) {
            return;
        }


        /*
           Find newest pending alert
        */

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
           First alert on page load:
           don't show an old alert as "new".
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


        /*
           Find genuinely new alert
        */

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


        /*
           Check escalation
        */

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
                   Only pending alerts can escalate.
                */

                if (
                    alert.status !==
                    "Pending"
                ) {
                    return;
                }


                /*
                   Don't escalate twice.
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


                /*
                   Escalate after configured time.
                */

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

            updateEscalatedUI(
                alerts
            );

        } else {

            updateEscalatedUI(
                alerts
            );

        }

    }


    /* =====================================================
       UPDATE ESCALATED ALERT UI
    ===================================================== */

    function updateEscalatedUI(
        alerts
    ) {

        alerts.forEach(
            function (alert) {

                if (
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


                        /*
                           Add escalation class
                        */

                        card.classList.add(
                            "distress-escalated"
                        );


                        /*
                           Prevent duplicate badge
                        */

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


                        const alertMain =
                            card.querySelector(
                                ".alert-main"
                            );


                        if (alertMain) {

                            alertMain.appendChild(
                                badge
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       ACTIVE ESCALATION CHECK
    ===================================================== */

    function checkEscalationNotification() {

        const alerts =
            getAlerts();


        alerts.forEach(
            function (alert) {

                if (
                    !alert.escalatedAt
                ) {
                    return;
                }


                /*
                   If escalation just happened,
                   show an escalation notification.
                */

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
       ESCALATION NOTIFICATION
    ===================================================== */

    function showEscalationNotification(
        alert
    ) {

        createNotificationContainer();


        const notification =
            document.getElementById(
                "heksaa-alert-notification"
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


        message.textContent =
            `⚠️ ${alert.patientName} (${alert.patientId}) has an unacknowledged distress alert.`;


        time.textContent =
            "Escalation threshold reached.";


        notification.classList.add(
            "show",
            "escalated"
        );


        document.title =
            "⚠️ ESCALATED DISTRESS ALERT | HEKSAA";


        playAlertSound();


        sendBrowserNotification(
            alert
        );

    }


    /* =====================================================
       REQUEST NOTIFICATION PERMISSION
       
       Clicking the notification area can enable
       browser notifications.
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
       INITIALIZATION
    ===================================================== */

    /*
       Only run on doctor dashboard.
    */

    if (
        !document.getElementById(
            "distress-alert-list"
        )
    ) {
        return;
    }


    createNotificationContainer();


    /*
       Initial check
    */

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

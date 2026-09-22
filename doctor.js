document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       Patient Profile Elements
    ========================= */

    const patientName =
        document.getElementById("doctor-patient-name");

    const patientId =
        document.getElementById("doctor-patient-id");

    const patientAge =
        document.getElementById("doctor-patient-age");

    const latestStatus =
        document.getElementById("doctor-latest-status");


    /* =========================
       Summary Elements
    ========================= */

    const totalCheckins =
        document.getElementById("total-checkins");

    const lowCount =
        document.getElementById("low-count");

    const moderateCount =
        document.getElementById("moderate-count");

    const highCount =
        document.getElementById("high-count");


    /* =========================
       History
    ========================= */

    const doctorHistory =
        document.getElementById("doctor-history");


    /* =========================
       Trend Elements
    ========================= */

    const trendMood =
        document.getElementById("trend-mood");

    const trendStress =
        document.getElementById("trend-stress");

    const trendAnxiety =
        document.getElementById("trend-anxiety");

    const trendDirection =
        document.getElementById("trend-direction");


    /* =========================
       Get Patient Profile
    ========================= */

    function getProfile() {

        const savedProfile =
            localStorage.getItem(
                "heksaaPatientProfile"
            );

        if (!savedProfile) {
            return null;
        }

        try {
            return JSON.parse(savedProfile);
        }

        catch (error) {
            return null;
        }
    }


    /* =========================
       Get Check-in History
    ========================= */

    function getHistory() {

        const savedHistory =
            localStorage.getItem(
                "heksaaCheckinHistory"
            );

        if (!savedHistory) {
            return [];
        }

        try {
            const history =
                JSON.parse(savedHistory);

            return Array.isArray(history)
                ? history
                : [];
        }

        catch (error) {
            return [];
        }
    }


    /* =========================
       Format Values
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


    /* =========================
       Status Class
    ========================= */

    function applyStatusClass(
        element,
        status
    ) {

        if (!element) {
            return;
        }

        element.classList.remove(
            "status-low",
            "status-moderate",
            "status-high"
        );

        if (status === "Low Concern") {

            element.classList.add(
                "status-low"
            );

        }

        else if (
            status === "Moderate Concern"
        ) {

            element.classList.add(
                "status-moderate"
            );

        }

        else if (
            status === "High Concern"
        ) {

            element.classList.add(
                "status-high"
            );
        }
    }


    /* =========================
       Load Patient Profile
    ========================= */

    function loadPatientProfile() {

        const profile =
            getProfile();

        if (!profile) {
            return;
        }

        if (patientName) {
            patientName.textContent =
                profile.name || "Patient";
        }

        if (patientId) {
            patientId.textContent =
                profile.id || "Not available";
        }

        if (patientAge) {
            patientAge.textContent =
                profile.age || "Not available";
        }
    }


    /* =========================
       Concern Score
    ========================= */

    function getConcernScore(status) {

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
       Calculate Trend
    ========================= */

    function calculateTrend(history) {

        if (history.length === 0) {

            if (trendMood) {
                trendMood.textContent = "No Data";
            }

            if (trendStress) {
                trendStress.textContent = "No Data";
            }

            if (trendAnxiety) {
                trendAnxiety.textContent = "No Data";
            }

            if (trendDirection) {
                trendDirection.textContent = "No Data";
                trendDirection.className = "";
            }

            return;
        }


        /* Latest check-in */

        const latest =
            history[0];


        if (trendMood) {
            trendMood.textContent =
                formatValue(latest.mood);
        }


        if (trendStress) {
            trendStress.textContent =
                formatValue(latest.stress);
        }


        if (trendAnxiety) {
            trendAnxiety.textContent =
                formatValue(latest.anxiety);
        }


        /* Need two check-ins */

        if (history.length < 2) {

            if (trendDirection) {

                trendDirection.textContent =
                    "Not enough data";

                trendDirection.className = "";
            }

            return;
        }


        const latestScore =
            getConcernScore(
                latest.overallStatus
            );


        const previous =
            history[1];


        const previousScore =
            getConcernScore(
                previous.overallStatus
            );


        if (latestScore > previousScore) {

            trendDirection.textContent =
                "Increasing Concern";

            trendDirection.className =
                "trend-warning";
        }

        else if (latestScore < previousScore) {

            trendDirection.textContent =
                "Improving";

            trendDirection.className =
                "trend-good";
        }

        else {

            trendDirection.textContent =
                "Stable";

            trendDirection.className =
                "trend-stable";
        }
    }


    /* =========================
       Prototype Distress Alert
    ========================= */

    function displayDistressAlert(history) {

        const existingAlert =
            document.getElementById(
                "heksaa-distress-alert"
            );

        if (existingAlert) {
            existingAlert.remove();
        }


        if (
            history.length === 0 ||
            history[0].overallStatus !==
            "High Concern"
        ) {
            return;
        }


        const alertBox =
            document.createElement("div");

        alertBox.id =
            "heksaa-distress-alert";


        alertBox.style.marginTop =
            "20px";

        alertBox.style.padding =
            "18px";

        alertBox.style.border =
            "1px solid #fecaca";

        alertBox.style.borderRadius =
            "12px";

        alertBox.style.background =
            "#fef2f2";


        alertBox.innerHTML = `
            <div style="
                display:flex;
                align-items:flex-start;
                gap:12px;
            ">

                <div style="
                    font-size:26px;
                ">
                    ⚠️
                </div>

                <div>

                    <h3 style="
                        margin:0 0 6px 0;
                        color:#b91c1c;
                        font-size:18px;
                    ">
                        Attention Required
                    </h3>

                    <p style="
                        margin:0;
                        color:#7f1d1d;
                        line-height:1.5;
                    ">
                        The latest patient check-in
                        has been classified as
                        <strong>High Concern</strong>
                        by the HEKSAA prototype
                        monitoring system.
                    </p>

                    <p style="
                        margin:8px 0 0 0;
                        color:#991b1b;
                        font-size:13px;
                    ">
                        Review the patient's recent
                        check-in information and
                        consider appropriate follow-up.
                    </p>

                </div>

            </div>
        `;


        /*
           Insert alert before the
           Patient Monitoring section.
        */

        if (doctorHistory) {

            const monitoringSection =
                doctorHistory.closest(
                    ".patient-monitoring"
                );

            if (monitoringSection) {

                monitoringSection.parentNode
                    .insertBefore(
                        alertBox,
                        monitoringSection
                    );

            }

        }
    }


    /* =========================
       Display Check-in History
    ========================= */

    function displayHistory(history) {

        if (!doctorHistory) {
            return;
        }


        if (history.length === 0) {
            return;
        }


        doctorHistory.innerHTML = "";


        history.forEach(function (item) {

            const card =
                document.createElement("div");


            card.className =
                "doctor-checkin";


            const date =
                new Date(item.date);


            const formattedDate =
                date.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            card.innerHTML = `

                <div class="doctor-checkin-header">

                    <div>

                        <h4>
                            Patient Check-in
                        </h4>

                        <span class="doctor-date">
                            ${formattedDate}
                        </span>

                    </div>


                    <span class="doctor-status">
                        ${formatValue(
                            item.overallStatus
                        )}
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


            const status =
                card.querySelector(
                    ".doctor-status"
                );


            applyStatusClass(
                status,
                item.overallStatus
            );


            doctorHistory.appendChild(
                card
            );

        });
    }


    /* =========================
       Display Dashboard
    ========================= */

    function displayDashboard() {

        const history =
            getHistory();


        /* =========================
           Total Check-ins
        ========================= */

        if (totalCheckins) {

            totalCheckins.textContent =
                history.length;
        }


        /* =========================
           Count Concern Levels
        ========================= */

        let low = 0;

        let moderate = 0;

        let high = 0;


        history.forEach(function (item) {

            if (
                item.overallStatus ===
                "Low Concern"
            ) {
                low++;
            }

            else if (
                item.overallStatus ===
                "Moderate Concern"
            ) {
                moderate++;
            }

            else if (
                item.overallStatus ===
                "High Concern"
            ) {
                high++;
            }

        });


        if (lowCount) {
            lowCount.textContent =
                low;
        }


        if (moderateCount) {
            moderateCount.textContent =
                moderate;
        }


        if (highCount) {
            highCount.textContent =
                high;
        }


        /* =========================
           Latest Status
        ========================= */

        if (
            latestStatus &&
            history.length > 0
        ) {

            latestStatus.textContent =
                history[0].overallStatus;

            applyStatusClass(
                latestStatus,
                history[0].overallStatus
            );
        }


        /* =========================
           History
        ========================= */

        displayHistory(history);


        /* =========================
           Trend
        ========================= */

        calculateTrend(history);


        /* =========================
           Distress Alert
        ========================= */

        displayDistressAlert(history);
    }


    /* =========================
       Start Dashboard
    ========================= */

    loadPatientProfile();

    displayDashboard();

});

document.addEventListener("DOMContentLoaded", function () {


    /* =========================
       Patient Profile
    ========================= */

    const patientName =
        document.getElementById(
            "doctor-patient-name"
        );

    const patientId =
        document.getElementById(
            "doctor-patient-id"
        );

    const patientAge =
        document.getElementById(
            "doctor-patient-age"
        );

    const latestStatus =
        document.getElementById(
            "doctor-latest-status"
        );


    /* =========================
       Summary
    ========================= */

    const totalCheckins =
        document.getElementById(
            "total-checkins"
        );

    const lowCount =
        document.getElementById(
            "low-count"
        );

    const moderateCount =
        document.getElementById(
            "moderate-count"
        );

    const highCount =
        document.getElementById(
            "high-count"
        );


    const doctorHistory =
        document.getElementById(
            "doctor-history"
        );


    /* =========================
       Trend
    ========================= */

    const trendMood =
        document.getElementById(
            "trend-mood"
        );

    const trendStress =
        document.getElementById(
            "trend-stress"
        );

    const trendAnxiety =
        document.getElementById(
            "trend-anxiety"
        );

    const trendDirection =
        document.getElementById(
            "trend-direction"
        );


    /* =========================
       Get Profile
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

            return JSON.parse(
                savedProfile
            );

        }

        catch (error) {

            return null;

        }

    }


    /* =========================
       Get History
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

            return JSON.parse(
                savedHistory
            );

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


        return value
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
       Calculate Trend
    ========================= */

    function calculateTrend(
        history
    ) {

        if (history.length === 0) {

            if (trendMood) {
                trendMood.textContent =
                    "No Data";
            }

            if (trendStress) {
                trendStress.textContent =
                    "No Data";
            }

            if (trendAnxiety) {
                trendAnxiety.textContent =
                    "No Data";
            }

            if (trendDirection) {
                trendDirection.textContent =
                    "No Data";
            }

            return;

        }


        /* Latest check-in */

        const latest =
            history[0];


        if (trendMood) {

            trendMood.textContent =
                formatValue(
                    latest.mood
                );

        }


        if (trendStress) {

            trendStress.textContent =
                formatValue(
                    latest.stress
                );

        }


        if (trendAnxiety) {

            trendAnxiety.textContent =
                formatValue(
                    latest.anxiety
                );

        }


        /* Need at least 2 check-ins
           to determine direction */

        if (history.length < 2) {

            if (trendDirection) {

                trendDirection.textContent =
                    "Not enough data";

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


        if (
            latestScore >
            previousScore
        ) {

            trendDirection.textContent =
                "Increasing Concern";

            trendDirection.className =
                "trend-warning";

        }

        else if (
            latestScore <
            previousScore
        ) {

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
       Concern Score
    ========================= */

    function getConcernScore(
        status
    ) {

        if (
            status === "Low Concern"
        ) {

            return 1;

        }


        if (
            status === "Moderate Concern"
        ) {

            return 2;

        }


        if (
            status === "High Concern"
        ) {

            return 3;

        }


        return 0;

    }


    /* =========================
       Display Dashboard
    ========================= */

    function displayDashboard() {

        const history =
            getHistory();


        /* Total */

        if (totalCheckins) {

            totalCheckins.textContent =
                history.length;

        }


        /* Counters */

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


        /* Latest Status */

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


        /* Empty History */

        if (
            !doctorHistory ||
            history.length === 0
        ) {

            calculateTrend(
                history
            );

            return;

        }


        doctorHistory.innerHTML = "";


        /* Display History */

        history.forEach(function (item) {


            const card =
                document.createElement(
                    "div"
                );


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
                        ${item.overallStatus}
                    </span>

                </div>


                <div class="doctor-data">


                    <div class="doctor-data-item">

                        <span>
                            Mood
                        </span>

                        <strong>
                            ${formatValue(
                                item.mood
                            )}
                        </strong>

                    </div>


                    <div class="doctor-data-item">

                        <span>
                            Stress
                        </span>

                        <strong>
                            ${formatValue(
                                item.stress
                            )}
                        </strong>

                    </div>


                    <div class="doctor-data-item">

                        <span>
                            Anxiety
                        </span>

                        <strong>
                            ${formatValue(
                                item.anxiety
                            )}
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


        /* Calculate Trend */

        calculateTrend(
            history
        );

    }


    /* =========================
       Start
    ========================= */

    loadPatientProfile();

    displayDashboard();


});            return [];

        }


        try {

            return JSON.parse(
                savedHistory
            );

        }

        catch (error) {

            return [];

        }

    }


    /* =========================
       Format Values
    ========================= */

    function formatValue(value) {

        return value
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

        else if (status === "Moderate Concern") {

            element.classList.add(
                "status-moderate"
            );

        }

        else if (status === "High Concern") {

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
       Display Dashboard
    ========================= */

    function displayDashboard() {

        const history =
            getHistory();


        /* Total */

        if (totalCheckins) {

            totalCheckins.textContent =
                history.length;

        }


        /* Counters */

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
            lowCount.textContent = low;
        }


        if (moderateCount) {
            moderateCount.textContent =
                moderate;
        }


        if (highCount) {
            highCount.textContent = high;
        }


        /* Latest Status */

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


        /* Empty */

        if (
            !doctorHistory ||
            history.length === 0
        ) {

            return;

        }


        doctorHistory.innerHTML = "";


        /* Display History */

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
       Start
    ========================= */

    loadPatientProfile();

    displayDashboard();

});

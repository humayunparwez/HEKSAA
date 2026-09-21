document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector(".checkin-card form");
    const successMessage = document.getElementById("success-message");

    const statusMood = document.getElementById("status-mood");
    const statusStress = document.getElementById("status-stress");
    const statusAnxiety = document.getElementById("status-anxiety");
    const overallStatus = document.getElementById("overall-status");

    if (!form) {
        return;
    }

    function formatValue(value) {
        return value
            .replace(/-/g, " ")
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
    }

    function calculateOverallStatus(mood, stress, anxiety) {

        const moodScore = {
            "very-happy": 0,
            "happy": 1,
            "neutral": 2,
            "sad": 3,
            "very-sad": 4
        };

        const levelScore = {
            "low": 0,
            "moderate": 1,
            "high": 2,
            "very-high": 3
        };

        const totalScore =
            moodScore[mood] +
            levelScore[stress] +
            levelScore[anxiety];

        const averageScore = totalScore / 3;

        if (averageScore <= 1) {
            return "Low Concern";
        }

        if (averageScore <= 2) {
            return "Moderate Concern";
        }

        return "High Concern";
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const mood = document.getElementById("mood").value;
        const stress = document.getElementById("stress").value;
        const anxiety = document.getElementById("anxiety").value;

        if (!mood || !stress || !anxiety) {
            alert("Please complete all the questions before submitting.");
            return;
        }

        // Show success message
        if (successMessage) {
            successMessage.style.display = "block";
        }

        // Update Mental Health Status
        if (statusMood) {
            statusMood.textContent = formatValue(mood);
        }

        if (statusStress) {
            statusStress.textContent = formatValue(stress);
        }

        if (statusAnxiety) {
            statusAnxiety.textContent = formatValue(anxiety);
        }

        // Calculate overall status
        if (overallStatus) {
            overallStatus.textContent =
                calculateOverallStatus(mood, stress, anxiety);
        }

        // Reset form
        form.reset();

    });

});

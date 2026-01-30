(function () {
  const RES_KEY = "aeriallite_resolution";
  const SHOW_CLOCK_KEY = "aeriallite_show_clock";
  const SHOW_LOCATION_KEY = "aeriallite_show_location";

  function loadSettings() {
    const resolution = localStorage.getItem(RES_KEY) || "auto";
    const showClock = localStorage.getItem(SHOW_CLOCK_KEY);
    const showLocation = localStorage.getItem(SHOW_LOCATION_KEY);

    const resSelect = document.getElementById("resolutionSelect");
    const clockCheckbox = document.getElementById("showClockCheckbox");
    const locationCheckbox = document.getElementById("showLocationCheckbox");

    resSelect.value = resolution;
    clockCheckbox.checked = showClock === null ? true : showClock === "true";
    locationCheckbox.checked = showLocation === null ? true : showLocation === "true";
  }

  function saveSettings() {
    const resSelect = document.getElementById("resolutionSelect");
    const clockCheckbox = document.getElementById("showClockCheckbox");
    const locationCheckbox = document.getElementById("showLocationCheckbox");

    localStorage.setItem(RES_KEY, resSelect.value);
    localStorage.setItem(SHOW_CLOCK_KEY, clockCheckbox.checked ? "true" : "false");
    localStorage.setItem(SHOW_LOCATION_KEY, locationCheckbox.checked ? "true" : "false");
  }

  function init() {
    loadSettings();

    const testRunButton = document.getElementById("testRunButton");
    testRunButton.addEventListener("click", () => {
      saveSettings();
      window.location.href = "player.html";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveSettings();
        window.location.href = "player.html";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

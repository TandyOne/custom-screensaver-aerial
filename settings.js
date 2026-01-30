const SHOW_CLOCK_KEY = "aeriallite_show_clock";
const SHOW_LOCATION_KEY = "aeriallite_show_location";

const CLOCK_SIZE_KEY = "aeriallite_clock_size";
const DATE_SIZE_KEY = "aeriallite_date_size";
const CLOCK_DATE_GAP_KEY = "aeriallite_clock_date_gap";
const CLOCK_X_KEY = "aeriallite_clock_x_offset";

const LOCATION_SIZE_KEY = "aeriallite_location_size";
const LOCATION_X_KEY = "aeriallite_location_x_offset";

const TRANSPARENCY_KEY = "aeriallite_text_opacity";

window.onload = () => {
  const clockToggle = document.getElementById("clockToggle");
  const locationToggle = document.getElementById("locationToggle");

  const clockSizeSlider = document.getElementById("clockSizeSlider");
  const dateSizeSlider = document.getElementById("dateSizeSlider");
  const clockDateGapSlider = document.getElementById("clockDateGapSlider");
  const clockXSlider = document.getElementById("clockXSlider");

  const locationSizeSlider = document.getElementById("locationSizeSlider");
  const locationXSlider = document.getElementById("locationXSlider");

  const transparencySlider = document.getElementById("transparencySlider");

  const clockSizeValue = document.getElementById("clockSizeValue");
  const dateSizeValue = document.getElementById("dateSizeValue");
  const clockDateGapValue = document.getElementById("clockDateGapValue");
  const clockXValue = document.getElementById("clockXValue");

  const locationSizeValue = document.getElementById("locationSizeValue");
  const locationXValue = document.getElementById("locationXValue");

  const transparencyValue = document.getElementById("transparencyValue");

  const previewClock = document.getElementById("previewClock");
  const previewDate = document.getElementById("previewDate");
  const previewLocation = document.getElementById("previewLocation");

  const saveBtn = document.getElementById("saveBtn");

  // Load saved settings
  clockToggle.checked = (localStorage.getItem(SHOW_CLOCK_KEY) ?? "true") === "true";
  locationToggle.checked = (localStorage.getItem(SHOW_LOCATION_KEY) ?? "true") === "true";

  clockSizeSlider.value = localStorage.getItem(CLOCK_SIZE_KEY) || "100";
  dateSizeSlider.value = localStorage.getItem(DATE_SIZE_KEY) || "100";
  clockDateGapSlider.value = localStorage.getItem(CLOCK_DATE_GAP_KEY) || "100";
  clockXSlider.value = localStorage.getItem(CLOCK_X_KEY) || "100";

  locationSizeSlider.value = localStorage.getItem(LOCATION_SIZE_KEY) || "100";
  locationXSlider.value = localStorage.getItem(LOCATION_X_KEY) || "100";

  transparencySlider.value = localStorage.getItem(TRANSPARENCY_KEY) || "88";

  // Update labels
  clockSizeValue.textContent = clockSizeSlider.value + "%";
  dateSizeValue.textContent = dateSizeSlider.value + "%";
  clockDateGapValue.textContent = clockDateGapSlider.value + "%";
  clockXValue.textContent = clockXSlider.value + "%";

  locationSizeValue.textContent = locationSizeSlider.value + "%";
  locationXValue.textContent = locationXSlider.value + "%";

  transparencyValue.textContent = transparencySlider.value + "%";

  // Live preview
  function updatePreview() {
    const clockScale = clockSizeSlider.value / 100;
    const dateScale = dateSizeSlider.value / 100;
    const gapScale = clockDateGapSlider.value / 100;
    const clockXScale = clockXSlider.value / 100;

    const locationScale = locationSizeSlider.value / 100;
    const locationXScale = locationXSlider.value / 100;

    const opacity = transparencySlider.value / 100;

    previewClock.style.transform = `scale(${clockScale})`;
    previewDate.style.transform = `scale(${dateScale})`;

    previewDate.style.marginTop = `${0.5 * gapScale}vw`;

    previewClock.style.color = `rgba(255,255,255,${opacity})`;
    previewDate.style.color = `rgba(255,255,255,${opacity - 0.10})`;

    previewLocation.style.transform = `scale(${locationScale})`;
    previewLocation.style.color = `rgba(255,255,255,${opacity - 0.10})`;
  }

  updatePreview();

  // Slider listeners
  [
    [clockSizeSlider, clockSizeValue],
    [dateSizeSlider, dateSizeValue],
    [clockDateGapSlider, clockDateGapValue],
    [clockXSlider, clockXValue],
    [locationSizeSlider, locationSizeValue],
    [locationXSlider, locationXValue],
    [transparencySlider, transparencyValue]
  ].forEach(([slider, label]) => {
    slider.addEventListener("input", () => {
      label.textContent = slider.value + "%";
      updatePreview();
    });
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    localStorage.setItem(SHOW_CLOCK_KEY, clockToggle.checked);
    localStorage.setItem(SHOW_LOCATION_KEY, locationToggle.checked);

    localStorage.setItem(CLOCK_SIZE_KEY, clockSizeSlider.value);
    localStorage.setItem(DATE_SIZE_KEY, dateSizeSlider.value);
    localStorage.setItem(CLOCK_DATE_GAP_KEY, clockDateGapSlider.value);
    localStorage.setItem(CLOCK_X_KEY, clockXSlider.value);

    localStorage.setItem(LOCATION_SIZE_KEY, locationSizeSlider.value);
    localStorage.setItem(LOCATION_X_KEY, locationXSlider.value);

    localStorage.setItem(TRANSPARENCY_KEY, transparencySlider.value);

    window.location.href = "player.html";
  });
};

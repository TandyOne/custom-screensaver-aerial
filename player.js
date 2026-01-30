(function () {
  const RES_KEY = "aeriallite_resolution";

  const SHOW_CLOCK_KEY = "aeriallite_show_clock";
  const SHOW_LOCATION_KEY = "aeriallite_show_location";

  const TRANSPARENCY_KEY = "aeriallite_text_opacity";

  const CLOCK_SIZE_KEY = "aeriallite_clock_size";
  const DATE_SIZE_KEY = "aeriallite_date_size";
  const CLOCK_DATE_GAP_KEY = "aeriallite_clock_date_gap";
  const CLOCK_X_KEY = "aeriallite_clock_x_offset";

  const LOCATION_SIZE_KEY = "aeriallite_location_size";
  const LOCATION_X_KEY = "aeriallite_location_x_offset";

  const VIDEO_PATH = "assets/videos.json";
  const LOCALE_PATH = "assets/locales/en-US.json";

  let videoEl;
  let overlayClock;
  let overlayDate;
  let overlayLocation;
  let debugEl;

  let assets = [];
  let locale = {};
  let playlist = [];
  let history = [];
  let currentIndex = -1;

  let showClock = true;
  let showLocation = true;
  let debugVisible = false;

  let poiTimestamps = [];
  let poiMap = {};
  let defaultLocationKey = null;

  function logDebug(msg) {
    if (!debugEl) return;
    debugEl.textContent += msg + "\n";
  }

  function setDebugVisible(visible) {
    debugVisible = visible;
    if (debugEl) {
      debugEl.style.display = visible ? "block" : "none";
    }
  }

  function loadSettings() {
    const res = localStorage.getItem(RES_KEY) || "auto";

    showClock = (localStorage.getItem(SHOW_CLOCK_KEY) ?? "true") === "true";
    showLocation = (localStorage.getItem(SHOW_LOCATION_KEY) ?? "true") === "true";

    const opacity = (localStorage.getItem(TRANSPARENCY_KEY) || "88") / 100;

    const clockScale = (localStorage.getItem(CLOCK_SIZE_KEY) || "100") / 100;
    const dateScale = (localStorage.getItem(DATE_SIZE_KEY) || "100") / 100;
    const gapScale = (localStorage.getItem(CLOCK_DATE_GAP_KEY) || "100") / 100;
    const clockXScale = (localStorage.getItem(CLOCK_X_KEY) || "100") / 100;

    const locationScale = (localStorage.getItem(LOCATION_SIZE_KEY) || "100") / 100;
    const locationXScale = (localStorage.getItem(LOCATION_X_KEY) || "100") / 100;

    document.documentElement.style.setProperty("--overlay-opacity", opacity);

    document.documentElement.style.setProperty("--clock-scale", clockScale);
    document.documentElement.style.setProperty("--date-scale", dateScale);
    document.documentElement.style.setProperty("--clock-date-gap", gapScale);
    document.documentElement.style.setProperty("--clock-x-offset", clockXScale);

    document.documentElement.style.setProperty("--location-scale", locationScale);
    document.documentElement.style.setProperty("--location-x-offset", locationXScale);

    return res;
  }

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  function pickUrlForAsset(asset, resolutionPref) {
    const candidates = [];

    if (resolutionPref === "4k-hdr") {
      if (asset["url-4K-HDR"]) candidates.push(asset["url-4K-HDR"]);
    } else if (resolutionPref === "4k-sdr") {
      if (asset["url-4K-SDR"]) candidates.push(asset["url-4K-SDR"]);
    } else if (resolutionPref === "1080-hdr") {
      if (asset["url-1080-HDR"]) candidates.push(asset["url-1080-HDR"]);
    } else if (resolutionPref === "1080-sdr") {
      if (asset["url-1080-SDR"]) candidates.push(asset["url-1080-SDR"]);
      if (asset["url-1080-H264"]) candidates.push(asset["url-1080-H264"]);
    } else {
      if (asset["url-4K-HDR"]) candidates.push(asset["url-4K-HDR"]);
      else if (asset["url-4K-SDR"]) candidates.push(asset["url-4K-SDR"]);
      else if (asset["url-1080-HDR"]) candidates.push(asset["url-1080-HDR"]);
      else if (asset["url-1080-SDR"]) candidates.push(asset["url-1080-SDR"]);
      else if (asset["url-1080-H264"]) candidates.push(asset["url-1080-H264"]);
    }

    return candidates[0] || null;
  }

  function buildPlaylist(resolutionPref) {
    playlist = [];
    for (const asset of assets) {
      const url = pickUrlForAsset(asset, resolutionPref);
      if (url) playlist.push({ asset, url });
    }
    if (playlist.length === 0) throw new Error("No playable videos found");

    for (let i = playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }

    currentIndex = 0;
    history = [];
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  function updateClockAndDate() {
    const now = new Date();

    overlayClock.textContent = showClock ? formatTime(now) : "";
    overlayDate.textContent = showClock ? formatDate(now) : "";
  }

  function setupClock() {
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);
  }

  function setupPOIForCurrentItem(item) {
    poiTimestamps = [];
    poiMap = {};
    defaultLocationKey = item.asset.localizedNameKey || null;

    const poiObj = item.asset.pointsOfInterest || null;
    if (poiObj) {
      for (const key of Object.keys(poiObj)) {
        const t = parseInt(key, 10);
        if (!isNaN(t)) {
          poiTimestamps.push(t);
          poiMap[t] = poiObj[key];
        }
      }
      poiTimestamps.sort((a, b) => a - b);
    }

    updateLocationForTime(0);
  }

  function updateLocationForTime(seconds) {
    if (!showLocation) {
      overlayLocation.textContent = "";
      return;
    }

    let labelKey = defaultLocationKey;

    if (poiTimestamps.length > 0) {
      for (let i = poiTimestamps.length - 1; i >= 0; i--) {
        if (seconds >= poiTimestamps[i]) {
          labelKey = poiMap[poiTimestamps[i]] || labelKey;
          break;
        }
      }
    }

    let label = "";
    if (labelKey) {
      if (locale[labelKey]) label = locale[labelKey];
      else if (locale.strings && locale.strings[labelKey]) label = locale.strings[labelKey];
    }

    overlayLocation.textContent = label || "";
  }

  function attachVideoEvents() {
    videoEl.addEventListener("timeupdate", () => {
      const current = Math.floor(videoEl.currentTime || 0);
      updateLocationForTime(current);
    });

    videoEl.addEventListener("ended", () => playNext(true));
  }

  function fadeOutVideo() {
    videoEl.classList.add("video-fade-out");
  }

  function fadeInVideo() {
    videoEl.classList.remove("video-fade-out");
    videoEl.classList.add("video-fade-in");
    setTimeout(() => videoEl.classList.remove("video-fade-in"), 1000);
  }

  function playItem(index, pushHistory) {
    if (index < 0 || index >= playlist.length) return;

    const item = playlist[index];
    if (pushHistory && currentIndex >= 0) history.push(currentIndex);
    currentIndex = index;

    fadeOutVideo();

    setTimeout(() => {
      videoEl.src = item.url;
      setupPOIForCurrentItem(item);
      videoEl.load();
      videoEl.play().catch(err => logDebug("Video play error: " + err.message));
      fadeInVideo();
    }, 800);
  }

  function playNext(pushHistory) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    playItem(nextIndex, pushHistory);
  }

  function playPrevious() {
    if (history.length > 0) {
      playItem(history.pop(), false);
    } else {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = playlist.length - 1;
      playItem(prevIndex, false);
    }
  }

  function handleKeyDown(e) {
    switch (e.key) {
      case "ArrowRight":
        playNext(true);
        break;
      case "ArrowLeft":
        playPrevious();
        break;
      case "Backspace":
      case "Escape":
        window.location.href = "index.html";
        break;
      case "0":
        setDebugVisible(!debugVisible);
        break;
    }
  }

  async function init() {
    videoEl = document.getElementById("aerialVideo");
    overlayClock = document.getElementById("clock");
    overlayDate = document.getElementById("date");
    overlayLocation = document.getElementById("location");
    debugEl = document.getElementById("debug");

    const resolutionPref = loadSettings();

    try {
      const videosData = await loadJSON(VIDEO_PATH);
      assets = videosData.assets || [];
      locale = await loadJSON(LOCALE_PATH);

      buildPlaylist(resolutionPref);
      setupClock();
      attachVideoEvents();
      setDebugVisible(false);

      playItem(currentIndex, false);
    } catch (err) {
      debugEl.style.display = "block";
      debugEl.textContent = "Error: " + err.message;
    }

    document.addEventListener("keydown", handleKeyDown);
  }

  document.addEventListener("DOMContentLoaded", init);
})();

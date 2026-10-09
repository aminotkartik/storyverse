(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class CitySound {
    constructor() {
      this.enabled = false;
      this.context = null;
      this.master = null;
      this.ambienceGain = null;
      this.engineGain = null;
      this.ambienceFilter = null;
      this.engineFilter = null;
      this.noiseSource = null;
      this.engineOscillator = null;
      this.calm = false;
    }

    ensureContext() {
      if (this.context) return this.context;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      try {
        const context = new AudioContextClass();
        const master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);

        const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const channel = noiseBuffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < channel.length; i += 1) {
          const white = Math.random() * 2 - 1;
          previous = (previous + 0.035 * white) / 1.035;
          channel[i] = previous * 3.5;
        }

        const noise = context.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const noiseFilter = context.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.value = 480;
        const ambienceGain = context.createGain();
        ambienceGain.gain.value = 0.025;
        noise.connect(noiseFilter);
        noiseFilter.connect(ambienceGain);
        ambienceGain.connect(master);
        noise.start();

        const engine = context.createOscillator();
        engine.type = "sawtooth";
        engine.frequency.value = 55;
        const engineFilter = context.createBiquadFilter();
        engineFilter.type = "lowpass";
        engineFilter.frequency.value = 115;
        const engineGain = context.createGain();
        engineGain.gain.value = 0.009;
        engine.connect(engineFilter);
        engineFilter.connect(engineGain);
        engineGain.connect(master);
        engine.start();

        this.context = context;
        this.master = master;
        this.ambienceGain = ambienceGain;
        this.engineGain = engineGain;
        this.ambienceFilter = noiseFilter;
        this.engineFilter = engineFilter;
        this.noiseSource = noise;
        this.engineOscillator = engine;
        return context;
      } catch (error) {
        return null;
      }
    }

    setEnabled(enabled) {
      this.enabled = Boolean(enabled);
      const context = this.enabled ? this.ensureContext() : this.context;
      if (!context) {
        this.enabled = false;
        updateSoundButtons(false, true);
        return;
      }
      if (this.enabled && context.state === "suspended") context.resume().catch(() => {});
      const now = context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.enabled ? 0.72 : 0, now, this.enabled ? 0.35 : 0.18);
      this.applyMood();
      updateSoundButtons(this.enabled, false);
    }

    applyMood(calm = this.calm, silent = false) {
      this.calm = Boolean(calm);
      const isSilent = Boolean(silent);
      if (!this.context || !this.ambienceGain || !this.engineGain) return;
      const now = this.context.currentTime;
      const softer = this.calm;
      this.ambienceGain.gain.setTargetAtTime(isSilent ? 0 : softer ? 0.008 : 0.025, now, isSilent ? 0.16 : 0.8);
      this.engineGain.gain.setTargetAtTime(isSilent ? 0 : softer ? 0.002 : 0.009, now, isSilent ? 0.16 : 0.8);
      this.ambienceFilter.frequency.setTargetAtTime(softer ? 260 : 480, now, 0.8);
      this.engineFilter.frequency.setTargetAtTime(softer ? 75 : 115, now, 0.8);
    }

    tone(frequency, duration = 0.12, volume = 0.045, type = "sine", endFrequency = null) {
      if (!this.enabled || !this.context || !this.master) return;
      const context = this.context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + Math.min(0.025, duration / 4));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.025);
    }

    horn() {
      if (!this.enabled || !this.context) return;
      this.tone(168, 0.42, 0.07, "sawtooth", 182);
      window.setTimeout(() => this.tone(224, 0.29, 0.035, "triangle", 211), 55);
    }

    heartbeat() {
      this.tone(52, 0.16, 0.055, "sine", 43);
      window.setTimeout(() => this.tone(48, 0.17, 0.042, "sine", 39), 175);
    }

    signal() {
      this.tone(740, 0.13, 0.035, "sine");
      window.setTimeout(() => this.tone(980, 0.18, 0.025, "sine"), 110);
    }

    page() {
      if (!this.enabled || !this.context || !this.master) return;
      const context = this.context;
      const source = context.createBufferSource();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.13), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      gain.gain.value = 0.06;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start();
    }
  }

  const sound = new CitySound();
  const soundButtons = [$("#soundToggle"), $("#introSoundToggle")].filter(Boolean);

  function updateSoundButtons(enabled, unavailable = false) {
    soundButtons.forEach((button) => {
      const state = button.querySelector("span");
      if (state) state.textContent = enabled ? "ON" : "OFF";
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("aria-label", unavailable ? "Ambient sound is not available in this browser" : `${enabled ? "Turn ambient sound off" : "Turn ambient sound on"}`);
      if (unavailable) button.title = "Ambient sound is not available in this browser";
    });
  }

  soundButtons.forEach((button) => {
    button.addEventListener("click", () => sound.setEnabled(!sound.enabled));
  });

  // A short silent-by-default opening count. The first sound is always a user choice.
  const intro = $("#intro");
  const introCount = $("#introCount");
  const introImpact = $("#introImpact");
  const introTitleBlock = $("#introTitleBlock");
  const beginButton = $("#beginButton");
  const skipIntro = $("#skipIntro");
  const loadingScreen = $("#loadingScreen");
  const introTimers = [];
  let storyStarted = false;
  let introRevealed = false;

  window.setTimeout(() => loadingScreen?.classList.add("is-gone"), 720);

  function revealIntroTitle() {
    if (introRevealed) return;
    introRevealed = true;
    intro.dataset.phase = "title";
    introCount?.classList.remove("is-impact");
    if (introCount) introCount.style.opacity = "0";
    if (introImpact) introImpact.classList.remove("is-visible");
    introTitleBlock?.setAttribute("aria-hidden", "false");
    introTitleBlock?.classList.add("is-revealed");
    if (beginButton) beginButton.disabled = false;
    skipIntro?.classList.remove("is-available");
    if (skipIntro) skipIntro.disabled = true;
    sound.applyMood(false);
  }

  function runIntroSequence() {
    if (reducedMotion) {
      window.setTimeout(revealIntroTitle, 450);
      return;
    }
    const beats = [
      { number: "15", delay: 420 },
      { number: "14", delay: 330 },
      { number: "13", delay: 420 },
      { number: "08", delay: 460, honk: true },
      { number: "05", delay: 390, honk: true },
      { number: "03", delay: 360, honk: true },
      { number: "01", delay: 410, cut: true }
    ];
    let elapsed = 120;
    beats.forEach((beat, index) => {
      const timer = window.setTimeout(() => {
        if (introCount) {
          introCount.textContent = beat.number;
          introCount.classList.toggle("is-impact", beat.number === "08" || beat.number === "05" || beat.number === "03");
        }
        if (beat.number === "08") intro?.classList.add("is-noisy");
        if (beat.number === "05" || beat.number === "03") {
          if (introImpact) {
            introImpact.textContent = "HONK.";
            introImpact.classList.remove("is-visible");
            void introImpact.offsetWidth;
            introImpact.classList.add("is-visible");
          }
        }
        if (beat.honk) sound.horn();
        if (beat.cut) {
          intro?.classList.remove("is-noisy");
          if (introImpact) introImpact.classList.remove("is-visible");
          if (introCount) introCount.style.opacity = "0";
          const last = window.setTimeout(revealIntroTitle, 620);
          introTimers.push(last);
        }
      }, elapsed);
      introTimers.push(timer);
      elapsed += beat.delay;
      if (index === 0) {
        const skipTimer = window.setTimeout(() => {
          skipIntro?.classList.add("is-available");
          if (skipIntro) skipIntro.disabled = false;
        }, 1000);
        introTimers.push(skipTimer);
      }
    });
  }

  function clearIntroTimers() {
    introTimers.forEach((timer) => window.clearTimeout(timer));
    introTimers.length = 0;
  }

  function beginStory({ presentation = false } = {}) {
    if (storyStarted) return;
    storyStarted = true;
    clearIntroTimers();
    intro?.classList.add("is-leaving");
    const story = $("#story");
    story?.removeAttribute("inert");
    $("#hud")?.removeAttribute("hidden");
    document.body.classList.add("story-started");
    window.setTimeout(() => { if (intro) intro.hidden = true; }, 950);
    window.setTimeout(() => loadingScreen?.classList.add("is-gone"), 750);
    if (presentation) {
      document.body.classList.add("presentation-mode");
      document.documentElement.classList.add("presentation-mode");
    }
    window.requestAnimationFrame(() => $("#chapter-1")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }));
    setActiveChapter(1);
  }

  beginButton?.addEventListener("click", () => beginStory());
  skipIntro?.addEventListener("click", revealIntroTitle);
  $(".skip-link")?.addEventListener("click", (event) => {
    if (!storyStarted) {
      event.preventDefault();
      beginStory();
    }
  });
  runIntroSequence();

  // The fixed reader interface follows the chapter that occupies the viewport.
  const chapterNames = [
    "THE CROSSING", "FIFTEEN SECONDS", "LOOK AGAIN", "THE AVERAGE HUMAN", "THE MIRROR",
    "THE NUMBERS", "GIVE THEM 15 SECONDS", "THE SECOND PERSON", "34 SECONDS", "THE CITY"
  ];
  const hudPage = $("#hudPage");
  const hudChapter = $("#hudChapter");
  const progressFill = $("#progressFill");
  const hudSignal = $("#hudSignal");
  let activeChapter = 1;

  function setActiveChapter(chapterNumber) {
    activeChapter = clamp(Number(chapterNumber) || 1, 1, 10);
    if (hudChapter) hudChapter.textContent = `${String(activeChapter).padStart(2, "0")} — ${chapterNames[activeChapter - 1]}`;
    if (hudPage) hudPage.innerHTML = `${String(activeChapter).padStart(2, "0")} <i>/</i> 10`;
    if (progressFill) progressFill.style.width = `${activeChapter * 10}%`;
    if (hudSignal && !crossingRunning) hudSignal.textContent = activeChapter >= 9 ? "34" : "15";
    sound.applyMood(activeChapter >= 9);
  }

  const chapterObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveChapter(entry.target.dataset.chapter);
        if (entry.target.dataset.chapter === "6") entry.target.classList.add("is-reading");
      }
    });
  }, { rootMargin: "-37% 0px -48% 0px", threshold: 0 }) : null;

  $$(".chapter[data-chapter]").forEach((chapter) => chapterObserver?.observe(chapter));

  const chapterMenu = $("#chapterMenu");
  const menuButton = $("#menuButton");
  const menuClose = $("#menuClose");
  menuButton?.addEventListener("click", () => {
    if (chapterMenu?.showModal) {
      chapterMenu.showModal();
      menuClose?.focus();
    }
  });
  menuClose?.addEventListener("click", () => chapterMenu?.close());
  chapterMenu?.addEventListener("click", (event) => {
    if (event.target === chapterMenu) chapterMenu.close();
    const link = event.target.closest("a[href^='#chapter-']");
    if (link) {
      event.preventDefault();
      const target = $(link.getAttribute("href"));
      chapterMenu.close();
      target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  });
  chapterMenu?.addEventListener("close", () => {
    if (!document.body.classList.contains("presentation-mode")) menuButton?.focus();
  });

  // Chapter 01: one real 15-second countdown drives the panel, sound cues, and persistent signal motif.
  const crossingPanel = $("#crossingPanel");
  const signalButton = $("#signalButton");
  const crossTimer = $("#crossTimer");
  const signalWord = $("#signalWord");
  const crossingStatus = $("#crossingStatus");
  const crossingAfter = $("#crossingAfter");
  let crossingRunning = false;
  let crossingInterval = null;
  let crossingStartedAt = 0;
  let lastCrossValue = 15;

  function setCrossingCount(value) {
    const remaining = Math.max(0, Math.floor(value));
    const displayed = remaining < 10 ? `0${remaining}` : String(remaining);
    if (crossTimer) crossTimer.textContent = displayed;
    if (hudSignal) hudSignal.textContent = displayed;
  }

  function finishCrossing() {
    if (crossingInterval) window.clearInterval(crossingInterval);
    crossingInterval = null;
    crossingRunning = false;
    crossingPanel?.classList.add("is-ended");
    signalWord && (signalWord.textContent = "TIME UP");
    signalButton && (signalButton.textContent = "CROSSING COMPLETE");
    if (signalButton) signalButton.disabled = true;
    if (crossingStatus) crossingStatus.textContent = "The light ran out. The question didn't.";
    if (crossingAfter) crossingAfter.hidden = false;
    sound.applyMood(false, true);
  }

  function tickCrossing() {
    const elapsed = Math.floor((performance.now() - crossingStartedAt) / 1000);
    const remaining = Math.max(0, 15 - elapsed);
    if (remaining !== lastCrossValue) {
      setCrossingCount(remaining);
      if (remaining === 8 || remaining === 5 || remaining === 3) sound.horn();
      if ([11, 7, 3].includes(remaining)) sound.heartbeat();
      if (remaining <= 5) crossingPanel?.classList.add("is-five");
      if (remaining <= 3) crossingPanel?.classList.add("is-three");
      if (remaining === 1) crossingPanel?.classList.add("is-one");
      if (remaining === 5) crossingStatus && (crossingStatus.textContent = "Five seconds. Dadu is still on the crossing.");
      if (remaining === 3) crossingStatus && (crossingStatus.textContent = "The road closes in around them.");
      if (remaining === 1) crossingStatus && (crossingStatus.textContent = "One second. The whole street holds its breath.");
      if (remaining === 0) finishCrossing();
      lastCrossValue = remaining;
    }
  }

  signalButton?.addEventListener("click", () => {
    if (crossingRunning || signalButton.disabled) return;
    crossingRunning = true;
    crossingStartedAt = performance.now();
    lastCrossValue = 15;
    crossingPanel?.classList.add("is-walk");
    signalWord && (signalWord.textContent = "WALK");
    signalButton.textContent = "CROSSING…";
    signalButton.setAttribute("aria-label", "Pedestrian crossing timer running");
    signalButton.disabled = true;
    if (crossingStatus) crossingStatus.textContent = "The walk light is on. Watch what the street does with the time.";
    if (crossingAfter) crossingAfter.hidden = true;
    setCrossingCount(15);
    sound.signal();
    sound.heartbeat();
    crossingInterval = window.setInterval(tickCrossing, 100);
  });

  // Chapter 02: replay different crossing speeds against the same fifteen-second signal.
  const walkerData = {
    student: { time: 11, name: "COLLEGE STUDENT", label: "the student", note: "Four seconds to spare. The student reaches the far curb before the signal ends." },
    groceries: { time: 17, name: "CARRYING GROCERIES", label: "the person carrying groceries", note: "At 15 seconds, they are still on the crossing—with two seconds of walking still needed." },
    parent: { time: 24, name: "PARENT + CHILD", label: "the parent and child", note: "At 15 seconds, they are only 63% across. The child still has a hand to hold." },
    elder: { time: 27, name: "ELDERLY PEDESTRIAN", label: "the elderly pedestrian", note: "At 15 seconds, Dadu's pace has covered just over half the crossing." },
    mobility: { time: 31, name: "MOBILITY DIFFICULTY", label: "the pedestrian with mobility difficulty", note: "At 15 seconds, less than half the crossing is behind them. The curb took time too." }
  };
  const walkerCards = $$(".walker-card");
  const walkMarker = $("#walkMarker");
  const replayReadout = $("#replayReadout");
  walkerCards.forEach((card) => {
    card.addEventListener("click", () => {
      const person = walkerData[card.dataset.person];
      if (!person) return;
      walkerCards.forEach((item) => {
        item.classList.toggle("is-selected", item === card);
        item.setAttribute("aria-pressed", String(item === card));
      });
      if (walkMarker) {
        walkMarker.style.left = "10%";
        void walkMarker.offsetWidth;
        walkMarker.style.left = `${10 + (80 * Math.min(1, 15 / person.time))}%`;
      }
      const headline = $("strong", replayReadout);
      const detail = $("span", replayReadout);
      if (headline) headline.textContent = `${person.time} SEC / ${person.name}`;
      if (detail) detail.textContent = `SIGNAL: 15 SEC. ${person.note}`;
    });
  });

  // Chapter 03: clickable, keyboard-reachable evidence markers.
  const evidence = {
    footpath: { title: "CAR ON FOOTPATH", copy: "Someone gained convenience. Someone else lost a path." },
    crossing: { title: "CAR ON ZEBRA CROSSING", copy: "The crossing exists. The priority doesn't." },
    litter: { title: "GARBAGE BESIDE THE BIN", copy: "Public space becomes nobody's space." },
    horn: { title: "HONKING DRIVER", copy: "Someone is trying to save seconds. Someone else must spend theirs." },
    ramp: { title: "BLOCKED ACCESSIBILITY RAMP", copy: "For one person, this is parking. For another, it is a wall." }
  };
  const hotspots = $$(".hotspot");
  const discovered = new Set();
  const evidenceTitle = $("#evidenceTitle");
  const evidenceCopy = $("#evidenceCopy");
  const evidenceNumber = $("#evidenceNumber");
  const discoveryCount = $("#discoveryCount");
  const lookPrompt = $("#lookPrompt");
  const evidenceTotal = $("#evidenceTotal");
  const lookConclusion = $("#lookConclusion");
  evidenceTotal && (evidenceTotal.textContent = String(hotspots.length).padStart(2, "0"));
  hotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", () => {
      const item = evidence[hotspot.dataset.hotspot];
      if (!item) return;
      discovered.add(hotspot.dataset.hotspot);
      hotspot.classList.add("is-found");
      hotspot.setAttribute("aria-pressed", "true");
      if (evidenceTitle) evidenceTitle.textContent = item.title;
      if (evidenceCopy) evidenceCopy.textContent = item.copy;
      if (evidenceNumber) evidenceNumber.textContent = String(discovered.size).padStart(2, "0");
      if (discoveryCount) discoveryCount.textContent = `${discovered.size} / ${hotspots.length} FOUND`;
      if (lookPrompt) lookPrompt.textContent = discovered.size === hotspots.length ? "The whole street has been read." : "Keep looking. There is more in the frame.";
      if (discovered.size === hotspots.length && lookConclusion) lookConclusion.hidden = false;
    });
  });

  // Chapter 04: let the design assumption fracture into the people it left out.
  const deconstructButton = $("#deconstructAverage");
  const controlMonitor = $("#controlMonitor");
  const humanFragments = $("#humanFragments");
  const averageTruth = $("#averageTruth");
  deconstructButton?.addEventListener("click", () => {
    if (controlMonitor?.classList.contains("is-fractured")) return;
    controlMonitor?.classList.add("is-fractured");
    humanFragments?.setAttribute("aria-hidden", "false");
    if (averageTruth) averageTruth.hidden = false;
    deconstructButton.disabled = true;
    deconstructButton.textContent = "THERE IS NO AVERAGE PERSON";
    sound.page();
  });

  // Chapter 05: scroll itself turns the mirror; the button is a keyboard/touch shortcut.
  const mirrorScroll = $("#mirrorScroll");
  const mirrorShell = $("#mirrorShell");
  const mirrorButton = $("#turnMirror");
  let mirrorForced = false;
  function updateMirror() {
    if (!mirrorScroll || !mirrorShell) return;
    if (mirrorForced) {
      mirrorShell.style.setProperty("--mirror-angle", "180deg");
      return;
    }
    const rect = mirrorScroll.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / range);
    mirrorShell.style.setProperty("--mirror-angle", `${progress * 180}deg`);
  }
  mirrorButton?.addEventListener("click", () => {
    mirrorForced = !mirrorForced;
    mirrorButton.setAttribute("aria-pressed", String(mirrorForced));
    mirrorButton.firstChild.textContent = mirrorForced ? "TURN BACK " : "TURN THE MIRROR ";
    if (!mirrorForced) updateMirror();
    else mirrorShell?.style.setProperty("--mirror-angle", "180deg");
  });

  // Chapter 06: five observations, one at a time, with a tactile page turn.
  const notes = [
    { time: "11", subject: "A student with a light bag.", observation: "Across before the signal blinks. Four seconds left.", scribble: "fast enough." },
    { time: "17", subject: "A neighbour carrying groceries.", observation: "The green starts to blink before the far curb.", scribble: "two seconds short." },
    { time: "24", subject: "A parent holding a child's hand.", observation: "A small hand pulls back when the bike noses through.", scribble: "they wait again." },
    { time: "27", subject: "Dadu, with his walking stick.", observation: "The kerb, the car, the horn. Then the white stripes.", scribble: "he keeps going." },
    { time: "31", subject: "Someone who moves at their own pace.", observation: "The timer has ended. They are still in the middle.", scribble: "who was it for?" }
  ];
  let notebookIndex = 0;
  const notebookPage = $("#notebookPage");
  const notebookPrev = $("#notebookPrev");
  const notebookNext = $("#notebookNext");
  function renderNotebookPage(index, animate = true) {
    notebookIndex = clamp(index, 0, notes.length - 1);
    const note = notes[notebookIndex];
    const update = () => {
      $("#notebookTime").textContent = note.time;
      $("#notebookSubject").textContent = note.subject;
      $("#notebookObservation").textContent = note.observation;
      $("#notebookScribble").textContent = note.scribble;
      $("#notebookPageNumber").textContent = `${String(notebookIndex + 1).padStart(2, "0")} / ${String(notes.length).padStart(2, "0")}`;
      notebookPrev.disabled = notebookIndex === 0;
      notebookNext.disabled = notebookIndex === notes.length - 1;
      notebookPage?.classList.remove("is-turning");
    };
    if (animate && !reducedMotion) {
      notebookPage?.classList.add("is-turning");
      window.setTimeout(update, 180);
      sound.page();
    } else update();
  }
  notebookPrev?.addEventListener("click", () => renderNotebookPage(notebookIndex - 1));
  notebookNext?.addEventListener("click", () => renderNotebookPage(notebookIndex + 1));

  // Chapter 07: a real pointer drag with tap/keyboard placement as an equivalent path.
  const campaignStage = $("#campaignStage");
  const campaignPoster = $("#campaignPoster");
  const posterTarget = $("#posterTarget");
  const campaignStatus = $("#campaignStatus");
  let posterDrag = null;
  let skipPosterClick = false;
  let campaignSequenceTimers = [];

  function resetPosterPosition() {
    if (!campaignPoster) return;
    campaignPoster.style.left = "";
    campaignPoster.style.top = "";
    campaignPoster.style.right = "";
  }

  function showCampaignBeat(index, copy, label = "THE STREET NOTICES") {
    if (!campaignStage || !campaignStatus) return;
    campaignStage.dataset.beat = String(index);
    const tag = $(".campaign-status-tag", campaignStatus);
    const statusCopy = campaignStatus.lastElementChild;
    if (tag) tag.textContent = label;
    if (statusCopy) statusCopy.textContent = copy;
  }

  function playCampaignSequence() {
    campaignSequenceTimers.forEach((timer) => window.clearTimeout(timer));
    campaignSequenceTimers = [];
    const beats = [
      { index: 0, copy: "A few people laugh. Most keep walking.", label: "AT FIRST" },
      { index: 1, copy: "Someone ignores it. Someone else takes the long way around.", label: "NO ONE STOPS" },
      { index: 2, copy: "A corner comes loose. The message stays.", label: "NOT EVERYONE AGREES" },
      { index: 3, copy: "Then one person waits behind the crossing line.", label: "ONE PERSON STOPS" },
      { index: 4, copy: "A second person notices—and leaves the ramp clear.", label: "A SECOND NOTICES" },
      { index: 5, copy: "A third follows. The street has started to see itself.", label: "THEN ANOTHER" }
    ];
    const stepDelay = reducedMotion ? 0 : 1050;
    beats.forEach((beat, index) => {
      const timer = window.setTimeout(() => showCampaignBeat(beat.index, beat.copy, beat.label), index * stepDelay);
      campaignSequenceTimers.push(timer);
    });
  }

  function placeCampaignPoster() {
    if (!campaignPoster || campaignPoster.classList.contains("is-placed")) return;
    campaignPoster.classList.remove("is-dragging");
    campaignPoster.classList.add("is-placed");
    campaignPoster.disabled = true;
    campaignPoster.setAttribute("aria-label", "Campaign poster placed on the neighborhood notice board");
    campaignStage?.classList.add("poster-placed");
    campaignStage && (campaignStage.dataset.beat = "0");
    if (posterTarget) posterTarget.setAttribute("aria-hidden", "true");
    showCampaignBeat(0, "The paper lands. People keep walking.", "THE NOTE IS UP");
    sound.page();
    playCampaignSequence();
  }

  campaignPoster?.addEventListener("pointerdown", (event) => {
    if (campaignPoster.classList.contains("is-placed") || event.button > 0) return;
    const posterRect = campaignPoster.getBoundingClientRect();
    const stageRect = campaignStage.getBoundingClientRect();
    posterDrag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - posterRect.left,
      offsetY: event.clientY - posterRect.top,
      stageRect,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    try { campaignPoster.setPointerCapture(event.pointerId); } catch (error) { /* pointer capture is optional */ }
  });

  campaignPoster?.addEventListener("pointermove", (event) => {
    if (!posterDrag || event.pointerId !== posterDrag.pointerId) return;
    const dx = event.clientX - posterDrag.startX;
    const dy = event.clientY - posterDrag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) posterDrag.moved = true;
    if (!posterDrag.moved) return;
    event.preventDefault();
    const rect = posterDrag.stageRect;
    const posterWidth = campaignPoster.offsetWidth;
    const posterHeight = campaignPoster.offsetHeight;
    const x = clamp(event.clientX - rect.left - posterDrag.offsetX, 0, Math.max(0, rect.width - posterWidth));
    const y = clamp(event.clientY - rect.top - posterDrag.offsetY, 0, Math.max(0, rect.height - posterHeight));
    campaignPoster.classList.add("is-dragging");
    campaignPoster.style.left = `${x}px`;
    campaignPoster.style.top = `${y}px`;
    campaignPoster.style.right = "auto";
  });

  campaignPoster?.addEventListener("pointerup", (event) => {
    if (!posterDrag || event.pointerId !== posterDrag.pointerId) return;
    const moved = posterDrag.moved;
    let droppedOnBoard = false;
    if (moved && posterTarget) {
      const targetRect = posterTarget.getBoundingClientRect();
      droppedOnBoard = event.clientX >= targetRect.left - 15 && event.clientX <= targetRect.right + 15 && event.clientY >= targetRect.top - 15 && event.clientY <= targetRect.bottom + 15;
    }
    posterDrag = null;
    campaignPoster.classList.remove("is-dragging");
    if (moved) {
      skipPosterClick = true;
      window.setTimeout(() => { skipPosterClick = false; }, 80);
      if (droppedOnBoard) placeCampaignPoster();
      else {
        resetPosterPosition();
        if (campaignStatus?.lastElementChild) campaignStatus.lastElementChild.textContent = "Try the dashed notice board—or tap the poster to place it.";
      }
    }
  });

  campaignPoster?.addEventListener("pointercancel", () => {
    posterDrag = null;
    campaignPoster.classList.remove("is-dragging");
    resetPosterPosition();
  });
  campaignPoster?.addEventListener("click", (event) => {
    if (skipPosterClick) {
      event.preventDefault();
      return;
    }
    placeCampaignPoster();
  });

  // Chapter 08: choices create consequences, never a score. Careless choices can be reconsidered.
  const choiceSteps = [
    {
      label: "AT THE FOOTPATH", title: "“Just for a minute.”",
      prompt: "A motorcyclist eases toward the curb ramp. The parking spot is tempting. The ramp is someone's way through.",
      careless: "It's only for a minute.", careful: "Find another place.",
      consequence: "The ramp becomes a wall. Someone has to step into moving traffic to get around it.",
      outcome: "The ramp stays clear. A person with a rolling bag doesn't have to detour into traffic."
    },
    {
      label: "AT THE ZEBRA CROSSING", title: "“Just a little over the line.”",
      prompt: "Your car inches forward into the stripes. There is room behind the line. There is a person still crossing.",
      careless: "Take the extra metre.", careful: "Stop behind the line.",
      consequence: "The crossing disappears beneath a bumper. A parent and child wait for a gap that should be theirs.",
      outcome: "The stripes stay visible. A child can finish crossing without moving between cars."
    },
    {
      label: "IN THE QUEUE OF TRAFFIC", title: "“They're taking too long.”",
      prompt: "Dadu is halfway across. The car behind you is impatient. Your hand is close to the horn.",
      careless: "Tell them to hurry.", careful: "Hold the horn. Let them finish.",
      consequence: "A horn doesn't make someone safer. It makes a hard crossing harder to finish.",
      outcome: "No horn. Dadu reaches the other side at his own pace. The people behind you wait too."
    }
  ];
  let choiceIndex = 0;
  const choiceCard = $("#choiceCard");
  const carelessChoice = $(".choice-option[data-choice='careless']");
  const carefulChoice = $(".choice-option[data-choice='careful']");
  const choiceFeedback = $("#choiceFeedback");
  const choiceNext = $("#choiceNext");
  const chainCopy = $("#chainCopy");
  const chainEnding = $("#chainEnding");

  function renderChoiceStep() {
    const step = choiceSteps[choiceIndex];
    $("#choiceStep").textContent = `MOMENT ${String(choiceIndex + 1).padStart(2, "0")} / ${String(choiceSteps.length).padStart(2, "0")}`;
    $("#choiceSceneLabel").textContent = step.label;
    $("#choiceTitle").textContent = step.title;
    $("#choicePrompt").textContent = step.prompt;
    carelessChoice.textContent = step.careless;
    carefulChoice.firstChild.textContent = `${step.careful} `;
    [carelessChoice, carefulChoice].forEach((button) => { button.disabled = false; });
    choiceFeedback.textContent = "";
    choiceFeedback.classList.remove("is-careful", "is-careless");
    choiceNext.hidden = true;
    chainEnding.hidden = true;
    chainEnding.classList.remove("is-second");
    chainCopy.textContent = choiceIndex === 0 ? "A clear ramp is a route someone can actually use." : "One small choice makes the next person's route easier.";
    choiceCard?.classList.remove("choice-card--stuck");
  }

  function chooseForSomeone(event) {
    const choice = event.currentTarget.dataset.choice;
    const step = choiceSteps[choiceIndex];
    if (choice === "careless") {
      choiceCard?.classList.add("choice-card--stuck");
      choiceFeedback.textContent = step.consequence;
      choiceFeedback.classList.add("is-careless");
      chainCopy.textContent = "The detour lands on someone with less room to spare.";
      return;
    }
    [carelessChoice, carefulChoice].forEach((button) => { button.disabled = true; });
    choiceFeedback.textContent = step.outcome;
    choiceFeedback.classList.add("is-careful");
    chainCopy.textContent = choiceIndex === 0 ? "The clear ramp gives someone a way through." : "One person makes room; the next person gets to move.";
    $$(".chain-neighbor").forEach((neighbor) => {
      const neighborNumber = Number(neighbor.dataset.neighbor);
      if (neighborNumber <= choiceIndex + 2) neighbor.classList.add("is-lit");
    });
    if (choiceIndex < choiceSteps.length - 1) {
      choiceNext.hidden = false;
    } else {
      const delay = reducedMotion ? 0 : 1150;
      window.setTimeout(() => { if (chainEnding) chainEnding.hidden = false; }, delay);
      window.setTimeout(() => chainEnding?.classList.add("is-second"), delay + (reducedMotion ? 0 : 1050));
    }
  }
  carelessChoice?.addEventListener("click", chooseForSomeone);
  carefulChoice?.addEventListener("click", chooseForSomeone);
  choiceNext?.addEventListener("click", () => {
    choiceIndex = Math.min(choiceSteps.length - 1, choiceIndex + 1);
    renderChoiceStep();
  });

  // Chapter 09: page scroll moves through the crossing, slowly and without a countdown.
  const calmScroll = $("#calmScroll");
  const calmPanel = $("#calmPanel");
  const calmProgressBar = $("#calmProgressBar");
  const calmSteps = [
    { at: 0, label: "THE SIGNAL HOLDS.", title: "Dadu takes\nthe first step.", copy: "No horn behind him. No vehicle over the white lines." },
    { at: 0.22, label: "THE CROSSING IS CLEAR.", title: "The stripes are\nvisible again.", copy: "The ramp is open. The front bumpers wait behind the line." },
    { at: 0.48, label: "TRAFFIC WAITS.", title: "Nobody asks\nhim to hurry.", copy: "A bus, a bike, a car. For once, the slowest person sets the pace." },
    { at: 0.73, label: "ONE MORE STEP.", title: "Tara walks\nbeside him.", copy: "No one takes the space he needs to cross." },
    { at: 0.94, label: "THE OTHER SIDE.", title: "He gets there\nin his own time.", copy: "And the city is still here. Waiting with him." }
  ];
  let lastCalmStep = -1;
  function scrollProgress(element) {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
  }
  function updateCalmStory() {
    if (!calmScroll || !calmPanel) return;
    const progress = scrollProgress(calmScroll);
    calmPanel.style.setProperty("--crossing-progress", progress.toFixed(3));
    calmPanel.style.setProperty("--crossing-scale", (1 + progress * 0.08).toFixed(3));
    if (calmProgressBar) calmProgressBar.value = Math.round(progress * 100);
    let stepIndex = 0;
    calmSteps.forEach((step, index) => { if (progress >= step.at) stepIndex = index; });
    if (stepIndex !== lastCalmStep) {
      lastCalmStep = stepIndex;
      const step = calmSteps[stepIndex];
      $("#calmStepLabel").textContent = step.label;
      $("#calmStepTitle").innerHTML = step.title.replace("\n", "<br>");
      $("#calmStepCopy").textContent = step.copy;
    }
  }

  // Chapter 10: zoom out from this crossing, then leave a promise on this device.
  const cityZoomScroll = $("#cityZoomScroll");
  const cityZoomArt = $("#cityZoomArt");
  const cityZoomLabel = $("#cityZoomLabel");
  const citySteps = $$(".city-zoom-steps span");
  const cityNames = ["ONE CROSSING", "ONE STREET", "ONE NEIGHBOURHOOD", "ONE CITY"];
  function updateCityZoom() {
    if (!cityZoomScroll || !cityZoomArt) return;
    const progress = scrollProgress(cityZoomScroll);
    cityZoomArt.style.setProperty("--city-progress", progress.toFixed(3));
    cityZoomArt.style.setProperty("--city-image-scale", (1.32 - progress * 0.32).toFixed(3));
    cityZoomArt.style.setProperty("--city-ring-scale", (0.52 + progress * 0.55).toFixed(3));
    const index = progress < 0.2 ? 0 : progress < 0.46 ? 1 : progress < 0.73 ? 2 : 3;
    if (cityZoomLabel) cityZoomLabel.textContent = cityNames[index];
    citySteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
  }

  let scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(() => {
      scrollScheduled = false;
      updateMirror();
      updateCalmStory();
      updateCityZoom();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.requestAnimationFrame(onScroll);

  const promiseKey = "fifteen-seconds-promise-notes-v1";
  const promiseWall = $("#promiseWall");
  const promiseCount = $("#promiseCount");
  const promiseStatus = $("#promiseStatus");
  const promiseCloser = $("#promiseCloser");
  let promises = [];

  function loadPromises() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(promiseKey) || "[]");
      return Array.isArray(stored) ? stored.filter((value) => typeof value === "string" && value.length < 140).slice(0, 8) : [];
    } catch (error) {
      return [];
    }
  }

  function renderPromises() {
    if (!promiseWall) return;
    promiseWall.replaceChildren();
    promises.slice(0, 8).forEach((promise, index) => {
      const note = document.createElement("li");
      note.className = "promise-note";
      note.style.setProperty("--note-angle", `${((index % 3) - 1) * 1.25}deg`);
      note.textContent = promise;
      promiseWall.append(note);
    });
    if (promiseCount) promiseCount.textContent = `${String(Math.min(promises.length, 8)).padStart(2, "0")} / 08`;
    if (promiseCloser) promiseCloser.hidden = promises.length === 0;
  }

  promises = loadPromises();
  renderPromises();
  $$(".promise-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      const promise = button.dataset.promise;
      if (!promise) return;
      $$(".promise-actions button").forEach((choice) => choice.classList.toggle("is-selected", choice === button));
      promises = [promise, ...promises.filter((item) => item !== promise)].slice(0, 8);
      try {
        window.localStorage.setItem(promiseKey, JSON.stringify(promises));
        if (promiseStatus) promiseStatus.textContent = "Your note is on this device. No account. No leaderboard.";
      } catch (error) {
        if (promiseStatus) promiseStatus.textContent = "Your note is on this page for now. This browser won't save local notes.";
      }
      renderPromises();
      sound.page();
    });
  });

  function resetExperience() {
    window.location.reload();
  }
  $("#enterCity")?.addEventListener("click", resetExperience);

  // Presentation shortcuts work anywhere in the story; typing in controls is never intercepted.
  function isTypingTarget(target) {
    return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  }
  window.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Escape" && chapterMenu?.open) {
      chapterMenu.close();
      return;
    }
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      const entering = !document.body.classList.contains("presentation-mode");
      if (entering) {
        if (!storyStarted) beginStory({ presentation: true });
        else {
          document.body.classList.add("presentation-mode");
          document.documentElement.classList.add("presentation-mode");
        }
        chapterMenu?.open && chapterMenu.close();
        window.setTimeout(() => $("#chapter-1")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }), storyStarted ? 0 : 80);
      } else {
        document.body.classList.remove("presentation-mode");
        document.documentElement.classList.remove("presentation-mode");
      }
    } else if (event.key.toLowerCase() === "e") {
      event.preventDefault();
      resetExperience();
    }
  });
})();

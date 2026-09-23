/* ==========================================================
   FORMA — YOUR FORMA DASHBOARD
   ========================================================== */

(function () {
  "use strict";

  /* ========================================================
     DASHBOARD
     ======================================================== */

  const dashboard = document.querySelector(
    "[data-forma-dashboard]"
  );

  if (!dashboard) {
    return;
  }

  if (!window.Forma?.profile) {
    console.error(
      "[Forma Dashboard] Forma Profile must load first."
    );

    return;
  }

  /* ========================================================
     DOM ELEMENTS
     ======================================================== */

  const greetingElement = dashboard.querySelector(
    "[data-forma-hero-greeting]"
  );

  const profileName = dashboard.querySelector(
    "[data-forma-profile-name]"
  );

  const heroMessage = dashboard.querySelector(
    "[data-forma-hero-message]"
  );

  const heroContext = dashboard.querySelector(
    "[data-forma-hero-context]"
  );

  const profileStatus = dashboard.querySelector(
    "[data-forma-profile-status]"
  );

  const profileProgressValue = dashboard.querySelector(
    "[data-forma-profile-progress-value]"
  );

  const profileProgressBar = dashboard.querySelector(
    "[data-forma-profile-progress-bar]"
  );

  const profileProgressText = dashboard.querySelector(
    "[data-forma-profile-progress-text]"
  );

  const followingCount = dashboard.querySelector(
    "[data-forma-following-count]"
  );

  const savedCount = dashboard.querySelector(
    "[data-forma-saved-count]"
  );

  const recentCount = dashboard.querySelector(
    "[data-forma-recent-count]"
  );

  const editProfileButton = dashboard.querySelector(
    "[data-forma-edit-profile]"
  );

  /* ========================================================
     TIME OF DAY
     ======================================================== */

  function getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
      return "morning";
    }

    if (hour >= 11 && hour < 14) {
      return "midday";
    }

    if (hour >= 14 && hour < 18) {
      return "afternoon";
    }

    if (hour >= 18 && hour < 23) {
      return "evening";
    }

    return "night";
  }

  function getGreeting() {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
      case "morning":
        return "Good morning";

      case "midday":
        return "Good afternoon";

      case "afternoon":
        return "Good afternoon";

      case "evening":
        return "Good evening";

      default:
        return "Good night";
    }
  }

  function getHeroMessage() {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
      case "morning":
        return "Start your day with your Forma.";

      case "midday":
        return "A curated edit for the rest of your day.";

      case "afternoon":
        return "Discover what fits your day.";

      case "evening":
        return "Take a moment. Explore your Forma.";

      default:
        return "A little inspiration before you call it a night.";
    }
  }

  function getHeroContext() {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
      case "morning":
        return "Curated for the day ahead.";

      case "midday":
        return "Your Forma, whenever you need it.";

      case "afternoon":
        return "Curated around your journey.";

      case "evening":
        return "Curated for your evening.";

      default:
        return "A little inspiration, whenever you need it.";
    }
  }

  function renderDynamicHero() {
    if (greetingElement) {
      greetingElement.textContent = getGreeting();
    }

    if (heroMessage) {
      heroMessage.textContent = getHeroMessage();
    }

    if (heroContext) {
      heroContext.textContent = getHeroContext();
    }
  }

  /* ========================================================
     PROFILE
     ======================================================== */

  function hasValue(value) {
    return String(value || "").trim().length > 0;
  }

  function calculateProfileCompletion(profile) {
    const identity =
      profile?.identity || {};

    const preferences =
      profile?.preferences || {};

    const sizes =
      preferences.sizes || {};

    const checks = [
      hasValue(identity.firstName),
      hasValue(identity.city),

      Array.isArray(preferences.categories) &&
        preferences.categories.length > 0,

      Array.isArray(preferences.styles) &&
        preferences.styles.length > 0,

      hasValue(sizes.tops),
      hasValue(sizes.bottoms),
      hasValue(sizes.shoes)
    ];

    const completed =
      checks.filter(Boolean).length;

    return Math.round(
      (completed / checks.length) * 100
    );
  }

  function renderProfile(profile) {
    const firstName = String(
      profile?.identity?.firstName || ""
    ).trim();

    const completion =
      calculateProfileCompletion(profile);

    /* NAME */

    if (profileName) {
      profileName.textContent =
        firstName
          ? `, ${firstName}`
          : "";
    }

    /* PROFILE STATUS */

    if (profileStatus) {
      profileStatus.textContent =
        `${completion}%`;
    }

    /* PROFILE PROGRESS */

    if (profileProgressValue) {
      profileProgressValue.textContent =
        `${completion}%`;
    }

    if (profileProgressBar) {
      profileProgressBar.style.width =
        `${completion}%`;
    }

    /* PROFILE MESSAGE */

    if (profileProgressText) {

      if (completion >= 100) {

        profileProgressText.textContent =
          "Your profile is complete.";

      } else if (completion >= 75) {

        profileProgressText.textContent =
          "You're almost there. Complete your profile.";

      } else if (completion >= 50) {

        profileProgressText.textContent =
          "Keep going to make Forma more personal.";

      } else {

        profileProgressText.textContent =
          "Complete your profile to make Forma more personal.";

      }
    }
  }

  /* ========================================================
     DASHBOARD STATS
     ======================================================== */

  function getFollowingCount() {
    try {
      return (
        window.Forma.followedBrands?.count?.() ||
        0
      );
    } catch (error) {
      console.warn(
        "[Forma Dashboard] Could not read followed brands.",
        error
      );

      return 0;
    }
  }

  function getSavedCount() {
    try {
      return (
        window.Forma.savedProducts?.count?.() ||
        0
      );
    } catch (error) {
      console.warn(
        "[Forma Dashboard] Could not read saved products.",
        error
      );

      return 0;
    }
  }

  function getRecentlyViewedCount() {
    try {
      return (
        window.Forma.recentlyViewed?.count?.() ||
        0
      );
    } catch (error) {
      console.warn(
        "[Forma Dashboard] Could not read recently viewed products.",
        error
      );

      return 0;
    }
  }

  function renderStats() {

    if (followingCount) {
      followingCount.textContent =
        String(getFollowingCount());
    }

    if (savedCount) {
      savedCount.textContent =
        String(getSavedCount());
    }

    if (recentCount) {
      recentCount.textContent =
        String(getRecentlyViewedCount());
    }
  }

  /* ========================================================
     PROFILE EDITOR
     ======================================================== */

  function openProfileEditor() {
    window.Forma.events.emit(
      "forma:onboarding-open"
    );
  }

  if (editProfileButton) {
    editProfileButton.addEventListener(
      "click",
      openProfileEditor
    );
  }

  /* ========================================================
     PROFILE EVENTS
     ======================================================== */

  window.Forma.events.on(
    "forma:profile-updated",
    event => {
      const profile =
        event?.detail?.profile ||
        window.Forma.profile.get();

      renderProfile(profile);
    }
  );

  window.Forma.events.on(
    "forma:profile-reset",
    event => {
      const profile =
        event?.detail?.profile ||
        window.Forma.profile.get();

      renderProfile(profile);
    }
  );

  window.Forma.events.on(
    "forma:onboarding-completed",
    event => {
      const profile =
        event?.detail?.profile ||
        window.Forma.profile.get();

      renderProfile(profile);
    }
  );

  /* ========================================================
     STAT EVENTS
     ======================================================== */

  window.Forma.events.on(
    "forma:saved-products-updated",
    renderStats
  );

  window.Forma.events.on(
    "forma:followed-brands-updated",
    renderStats
  );

  window.Forma.events.on(
    "forma:recently-viewed-updated",
    renderStats
  );

  window.addEventListener(
    "forma:activity-updated",
    renderStats
  );

  /* ========================================================
     INITIAL RENDER
     ======================================================== */

  renderDynamicHero();

  renderProfile(
    window.Forma.profile.get()
  );

  renderStats();

  /* ========================================================
     KEEP GREETING CURRENT
     ======================================================== */

  setInterval(
    renderDynamicHero,
    60000
  );

})();
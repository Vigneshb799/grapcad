// ==============================================================
// LIVE GOOGLE REVIEWS
// ==============================================================
// Pulls live reviews from the GRAPCAD Google Business Profile using
// the Google Maps JavaScript API (Places library) and renders them
// into #google-reviews-list on the page. Fetched fresh on every page
// load (not cached/stored), per Google Places API policy.
//
// SETUP (one-time, ~10 minutes):
//   1. Go to https://console.cloud.google.com/ and create/select a project.
//   2. APIs & Services > Library: enable "Maps JavaScript API" and "Places API".
//   3. APIs & Services > Credentials: create an API key.
//   4. Restrict the key: Application restrictions > HTTP referrers > add
//        https://grapcad.in/*
//      (and https://www.grapcad.in/* if you use the www subdomain).
//      API restrictions > limit to "Maps JavaScript API" + "Places API".
//   5. Enable billing on the project (required by Google even for free-tier
//      usage; Google gives ~$200/month free credit, comfortably enough
//      for a small business site). Consider setting a budget alert.
//   6. Paste the key below as GOOGLE_MAPS_API_KEY.
//
// After it's working once, open the browser console — this script logs
// "Resolved Place ID: ...". Paste that into PLACE_ID below to skip the
// extra lookup call on every future page load (faster + cheaper).
// ==============================================================

(function () {
  const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // <-- put your key here

  const PLACE_ID = ""; // optional — see console log after first successful load

  const SEARCH_QUERY = "Grap cad tirupur, Tirupur, Tamil Nadu 641607";
  const MAX_REVIEWS = 5;
  const LIST_ID = "google-reviews-list";
  const SUMMARY_ID = "google-reviews-summary";

  function starString(rating) {
    const full = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function showMessage(html) {
    const list = document.getElementById(LIST_ID);
    if (list) list.innerHTML = `<p>${html}</p>`;
  }

  function injectAggregateRatingSchema(place) {
    // Keeps structured data in sync with the live rating instead of a
    // hardcoded number going stale. Same @id as the main Organization
    // schema in <head> so Google associates it with the same entity.
    if (!place.rating || !place.user_ratings_total) return;
    const id = "google-reviews-schema";
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://grapcad.in/#organization",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": place.rating,
        "reviewCount": place.user_ratings_total,
      },
    });
  }

  function renderReviews(place) {
    const list = document.getElementById(LIST_ID);
    const summary = document.getElementById(SUMMARY_ID);
    if (!list) return;

    injectAggregateRatingSchema(place);

    if (summary) {
      summary.innerHTML = place.rating
        ? `<span class="g-rating-score">${place.rating.toFixed(1)}</span>` +
          `<span class="g-rating-stars">${starString(place.rating)}</span>` +
          `<span class="g-rating-count">${place.user_ratings_total || 0} Google reviews</span>`
        : "";
    }

    const reviews = (place.reviews || []).slice(0, MAX_REVIEWS);

    if (!reviews.length) {
      showMessage(
        `No Google reviews found yet. <a href="https://maps.app.goo.gl/8C99sFBEBeN7k1DM8" target="_blank" rel="noopener">View us on Google</a>.`
      );
      return;
    }

    list.innerHTML = reviews
      .map(
        (r) => `
        <div class="testimonial-card google-review-card tilt-card" data-tilt-max="4">
          <div class="google-review-head">
            <img src="${r.profile_photo_url}" alt="${escapeHtml(r.author_name)}" loading="lazy" width="40" height="40" referrerpolicy="no-referrer">
            <div>
              <h3>${escapeHtml(r.author_name)}</h3>
              <span class="google-review-time">${escapeHtml(r.relative_time_description)}</span>
            </div>
          </div>
          <h4>${starString(r.rating)}</h4>
          <p>${escapeHtml(r.text)}</p>
        </div>`
      )
      .join("");
  }

  function fetchDetails(placeId) {
    const service = new google.maps.places.PlacesService(document.createElement("div"));
    service.getDetails(
      { placeId, fields: ["name", "rating", "user_ratings_total", "reviews"] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          renderReviews(place);
        } else {
          console.error("Google Places getDetails failed:", status);
          showMessage(
            `Couldn't load Google reviews right now. <a href="https://maps.app.goo.gl/8C99sFBEBeN7k1DM8" target="_blank" rel="noopener">View us on Google</a>.`
          );
        }
      }
    );
  }

  window.initGoogleReviews = function () {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps Places library did not load.");
      return;
    }

    if (PLACE_ID) {
      fetchDetails(PLACE_ID);
      return;
    }

    const service = new google.maps.places.PlacesService(document.createElement("div"));
    service.findPlaceFromQuery(
      { query: SEARCH_QUERY, fields: ["place_id"] },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          console.log(
            "Resolved Place ID:",
            results[0].place_id,
            "— paste into PLACE_ID in js/google-reviews.js to skip this lookup next time."
          );
          fetchDetails(results[0].place_id);
        } else {
          console.error("Could not resolve Place ID:", status);
          showMessage(
            `Couldn't load Google reviews right now. <a href="https://maps.app.goo.gl/8C99sFBEBeN7k1DM8" target="_blank" rel="noopener">View us on Google</a>.`
          );
        }
      }
    );
  };

  if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY") {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleReviews&loading=async`;
    script.async = true;
    document.head.appendChild(script);
  } else {
    showMessage(
      `Google Reviews will appear here once an API key is added (see js/google-reviews.js). <a href="https://maps.app.goo.gl/8C99sFBEBeN7k1DM8" target="_blank" rel="noopener">View us on Google</a> in the meantime.`
    );
  }
})();

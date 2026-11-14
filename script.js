(function () {
  "use strict";

  var WA_NUMBER = "919911836784";

  function formatWhatsAppMessage(form) {
    var lines = [form.dataset.whatsapp || "The Blind Source enquiry"];
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.type === "checkbox" && !field.checked) return;
      if (field.type === "radio" && !field.checked) return;
      if (!field.value || field.type === "submit" || field.type === "button") return;
      var label = field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
      lines.push((label ? label.textContent.trim() : field.name || "Details") + ": " + field.value.trim());
    });
    return lines.join("\n");
  }

  function initMobileNavigation() {
    var nav = document.querySelector("header nav");
    var right = document.querySelector(".nav-right");
    if (!nav || !right) return;

    var button = right.querySelector(".menu-toggle");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "menu-toggle";
      button.setAttribute("aria-label", "Open navigation menu");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      right.appendChild(button);
    }

    button.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      button.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation menu");
        button.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        button.focus();
      }
    });
  }

  function initWhatsAppForms() {
    document.querySelectorAll("form[data-whatsapp]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;
        var url = "https://wa.me/" + WA_NUMBER + "?text=" +
          encodeURIComponent(formatWhatsAppMessage(form));
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  function initGalleryFilters() {
    var gallery = document.querySelector(".gallery-section");
    if (!gallery) return;

    var chips = gallery.querySelectorAll(".chip");
    var select = document.querySelector(".filter-dropdown-area select");
    var cards = gallery.querySelectorAll(".blog-card");
    if (!cards.length) return;

    var category = "all images";
    var categoryTerms = {
      "living room": ["living room", "apartment", "villa"],
      "bedroom": ["bedroom"],
      "kitchen": ["kitchen", "dining"],
      "office": ["office", "commercial"],
      "outdoor": ["outdoor", "lounge"],
      "commercial": ["office", "commercial"]
    };

    function applyFilters() {
      var product = select ? select.value.trim().toLowerCase() : "all products";
      var visible = 0;
      cards.forEach(function (card) {
        var heading = card.querySelector("h3");
        var paragraph = card.querySelector("p");
        var title = heading ? heading.textContent.toLowerCase() : "";
        var description = paragraph ? paragraph.textContent.toLowerCase() : "";
        var categoryMatch = category === "all images" ||
          (categoryTerms[category] || []).some(function (term) { return title.indexOf(term) !== -1; });
        var productMatch = product === "all products" ||
          title.indexOf(product.replace(/s$/, "")) !== -1 ||
          description.indexOf(product.replace(/s$/, "")) !== -1;
        card.hidden = !(categoryMatch && productMatch);
        if (!card.hidden) visible++;
      });
      var status = gallery.querySelector("[data-gallery-results]");
      if (status) status.textContent = visible + " project" + (visible === 1 ? "" : "s") + " found";
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        category = chip.textContent.trim().toLowerCase();
        applyFilters();
      });
    });

    if (select) select.addEventListener("change", applyFilters);
    applyFilters();
  }

  function initProductListing() {
    var grid = document.querySelector(".products-grid-shop");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".shop-card"));
    var applyButton = document.querySelector(".btn-apply");
    var sort = document.querySelector(".sort-select");
    var sidebar = document.querySelector(".sidebar");
    var productTypeInputs = sidebar ? sidebar.querySelectorAll(".filter-group:nth-of-type(1) input[type=checkbox]") : [];
    var materialInputs = sidebar ? sidebar.querySelectorAll(".filter-group:nth-of-type(2) input[type=checkbox]") : [];
    var priceSlider = sidebar ? sidebar.querySelector(".price-slider") : null;
    var priceValue = sidebar ? sidebar.querySelector("[data-price-value]") : null;
    var resultLabel = document.querySelector("[data-product-results]");

    var knownPrices = {
      "roller blinds": 1299,
      "zebra blinds": 1599,
      "roman blinds": 1499,
      "wooden blinds": 2199,
      "bamboo blinds": 1199,
      "blackout blinds": 1599
    };
    var knownMaterials = {
      "roller blinds": ["polyester", "pvc", "fabric"],
      "zebra blinds": ["polyester", "fabric"],
      "roman blinds": ["fabric"],
      "wooden blinds": ["wood", "faux wood"],
      "bamboo blinds": ["bamboo"],
      "blackout blinds": ["polyester", "fabric"]
    };

    var colorDots = sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll(".color-dot")) : [];
    var activeColor = null;
    colorDots.forEach(function (dot, index) {
      dot.setAttribute("role", "button");
      dot.setAttribute("tabindex", "0");
      dot.setAttribute("aria-label", "Filter by colour " + (index + 1));
      dot.setAttribute("aria-pressed", "false");
      function toggleColor() {
        var wasActive = dot.classList.contains("selected");
        colorDots.forEach(function (other) {
          other.classList.remove("selected");
          other.setAttribute("aria-pressed", "false");
        });
        activeColor = wasActive ? null : index;
        if (activeColor !== null) {
          dot.classList.add("selected");
          dot.setAttribute("aria-pressed", "true");
        }
        applyFilters();
      }
      dot.addEventListener("click", toggleColor);
      dot.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleColor();
        }
      });
    });

    function getCardName(card) {
      var heading = card.querySelector("h3");
      return heading ? heading.textContent.trim().toLowerCase() : "";
    }

    function applyFilters() {
      var selectedTypes = Array.prototype.filter.call(productTypeInputs, function (input) {
        return input.checked;
      }).map(function (input) { return input.parentElement.textContent.trim().toLowerCase(); });
      var selectedMaterials = Array.prototype.filter.call(materialInputs, function (input) {
        return input.checked;
      }).map(function (input) { return input.parentElement.textContent.trim().toLowerCase(); });
      var maxPrice = priceSlider ? Number(priceSlider.value) : Infinity;
      var visible = [];

      cards.forEach(function (card) {
        var name = getCardName(card);
        var price = knownPrices[name] || 0;
        var typesMatch = !selectedTypes.length || selectedTypes.some(function (type) {
          return name.indexOf(type.replace(/s$/, "")) !== -1;
        });
        var materials = knownMaterials[name] || [];
        var materialMatch = !selectedMaterials.length || selectedMaterials.some(function (material) {
          return materials.indexOf(material) !== -1;
        });
        var priceMatch = price <= maxPrice;
        card.hidden = !(typesMatch && materialMatch && priceMatch);
        if (!card.hidden) visible.push(card);
      });

      var sortValue = sort ? sort.value.toLowerCase() : "";
      if (sortValue.indexOf("low to high") !== -1) {
        visible.sort(function (a, b) { return (knownPrices[getCardName(a)] || 0) - (knownPrices[getCardName(b)] || 0); });
      } else if (sortValue.indexOf("high to low") !== -1) {
        visible.sort(function (a, b) { return (knownPrices[getCardName(b)] || 0) - (knownPrices[getCardName(a)] || 0); });
      }
      visible.forEach(function (card) { grid.appendChild(card); });

      var count = visible.length;
      if (resultLabel) resultLabel.textContent = "Showing " + count + " of " + cards.length + " available product categories";
      if (priceValue && priceSlider) priceValue.textContent = "Up to ₹" + Number(priceSlider.value).toLocaleString("en-IN");
    }

    if (applyButton) applyButton.addEventListener("click", applyFilters);
    if (sort) sort.addEventListener("change", applyFilters);
    productTypeInputs.forEach(function (input) { input.addEventListener("change", applyFilters); });
    materialInputs.forEach(function (input) { input.addEventListener("change", applyFilters); });
    if (priceSlider) priceSlider.addEventListener("input", function () {
      if (priceValue) priceValue.textContent = "Up to ₹" + Number(priceSlider.value).toLocaleString("en-IN");
    });

    var viewButtons = document.querySelectorAll(".view-icons button");
    viewButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        viewButtons.forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        grid.classList.toggle("list-view", index === 1);
        button.setAttribute("aria-pressed", "true");
        viewButtons.forEach(function (item) {
          if (item !== button) item.setAttribute("aria-pressed", "false");
        });
      });
    });

    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNavigation();
    initWhatsAppForms();
    initGalleryFilters();
    initProductListing();
  });
})();
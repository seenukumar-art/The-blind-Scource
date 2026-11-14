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

    var menuStyle = document.createElement("style");
    menuStyle.textContent = ".menu-toggle{display:none;background:transparent;border:1px solid rgba(255,255,255,.55);color:#fff;width:42px;height:42px;border-radius:8px;align-items:center;justify-content:center;font-size:17px;cursor:pointer}@media(max-width:1100px){.menu-toggle{display:inline-flex}header nav{display:none;position:absolute;top:100%;left:0;right:0;background:#121824;padding:20px 5%;z-index:120}header nav.open{display:block!important}header nav ul{display:flex;flex-direction:column;gap:16px}.nav-right .btn-gold{display:none}}";
    document.head.appendChild(menuStyle);

    var mobileQuote = nav.querySelector(".mobile-quote-link");
    if (!mobileQuote) {
      mobileQuote = document.createElement("li");
      mobileQuote.className = "mobile-quote-link";
      mobileQuote.innerHTML = '<a href="./quote.html" style="color:#c5a880;font-weight:600">Get a Free Quote</a>';
      nav.querySelector("ul").appendChild(mobileQuote);
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
    var filterButton = gallery.querySelector(".btn-filter-icon");
    if (filterButton) filterButton.addEventListener("click", applyFilters);
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

    function getCardName(card) {
      var heading = card.querySelector("h3");
      return heading ? heading.textContent.trim().toLowerCase() : "";
    }

    function applyFilters() {
      var selectedTypes = Array.prototype.filter.call(productTypeInputs, function (input) {
        return input.checked;
      }).map(function (input) { return input.parentElement.textContent.trim().toLowerCase(); });
      var maxPrice = priceSlider ? Number(priceSlider.value) : Infinity;
      var params = new URLSearchParams(window.location.search);
      var searchTerm = (params.get("q") || params.get("type") || "").trim().toLowerCase();
      var visible = [];

      cards.forEach(function (card) {
        var name = getCardName(card);
        var description = (card.querySelector("p") || {}).textContent || "";
        var price = knownPrices[name] || 0;
        var typesMatch = !selectedTypes.length || selectedTypes.some(function (type) {
          return name.indexOf(type.replace(/s$/, "")) !== -1;
        });
        var priceMatch = price <= maxPrice;
        var searchMatch = !searchTerm || name.indexOf(searchTerm) !== -1 || description.toLowerCase().indexOf(searchTerm) !== -1;
        card.hidden = !(typesMatch && priceMatch && searchMatch);
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
      if (resultLabel) {
        resultLabel.textContent = count
          ? "Showing " + count + " of " + cards.length + " available product categories"
          : "No product categories match your search and filters.";
      }
      if (priceValue && priceSlider) priceValue.textContent = "Up to ₹" + Number(priceSlider.value).toLocaleString("en-IN");
    }

    if (applyButton) applyButton.addEventListener("click", applyFilters);
    if (sort) sort.addEventListener("change", applyFilters);
    productTypeInputs.forEach(function (input) { input.addEventListener("change", applyFilters); });
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


  function initHeaderSearch() {
    var icon = document.querySelector("header .search-icon");
    if (!icon) return;

    var toggle = icon;
    if (icon.tagName !== "BUTTON") {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "search-icon search-toggle";
      toggle.setAttribute("aria-label", "Open product search");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>';
      icon.replaceWith(toggle);
    }

    var panel = document.querySelector(".site-search-panel");
    if (!panel) {
      panel = document.createElement("form");
      panel.className = "site-search-panel";
      panel.hidden = true;
      panel.setAttribute("role", "search");
      panel.innerHTML =
        '<label class="site-search-label" for="site-search-input">Search products</label>' +
        '<div class="site-search-row">' +
          '<input id="site-search-input" name="q" type="search" placeholder="Try Roller Blinds or Zebra Blinds" required>' +
          '<button type="submit">Search</button>' +
        '</div>';
      var header = document.querySelector("header");
      if (header) header.appendChild(panel);
    }

    toggle.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) {
        var input = panel.querySelector("input");
        if (input) input.focus();
      }
    });

    panel.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = panel.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (!query) {
        if (input) input.focus();
        return;
      }
      window.location.href = "./product.html?q=" + encodeURIComponent(query);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  function initHomepageProductLinks() {
    var sections = document.querySelectorAll(".section-padding.text-center");
    var section = Array.prototype.find.call(sections, function (item) {
      return item.querySelector(".products-grid .product-card");
    });
    if (!section) return;

    section.querySelectorAll(".products-grid .product-card").forEach(function (card) {
      var heading = card.querySelector("h3");
      if (!heading || card.querySelector(".category-card-link")) return;
      var productName = heading.textContent.trim();
      var link = document.createElement("a");
      link.className = "category-card-link";
      link.href = "./product.html?type=" + encodeURIComponent(productName);
      link.setAttribute("aria-label", "Explore " + productName);
      link.textContent = "Explore " + productName;
      card.appendChild(link);
    });
  }

  function initGalleryLightbox() {
    var gallery = document.querySelector(".gallery-section");
    if (!gallery) return;

    var dialog = document.querySelector(".gallery-lightbox");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "gallery-lightbox";
      dialog.innerHTML =
        '<button type="button" class="gallery-lightbox-close" aria-label="Close image preview">' +
          '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' +
        '</button><img alt="">';
      document.body.appendChild(dialog);
    }

    var preview = dialog.querySelector("img");
    var close = dialog.querySelector(".gallery-lightbox-close");
    close.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    gallery.querySelectorAll(".blog-card").forEach(function (card) {
      var image = card.querySelector(".blog-img img");
      var zoom = card.querySelector(".fa-magnifying-glass");
      var control = zoom ? zoom.parentElement : null;
      if (!image || !control) return;

      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      control.setAttribute("aria-label", "View larger image: " + (image.alt || "Gallery image"));
      control.style.zIndex = "5";

      function openPreview() {
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt || "Gallery image preview";
        if (typeof dialog.showModal === "function") dialog.showModal();
      }
      control.addEventListener("click", openPreview);
      control.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPreview();
        }
      });
    });
  }

  function initBlogInteractions() {
    var grid = document.querySelector(".blog-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".blog-card"));
    var tags = document.querySelectorAll(".tags-cloud .tag");
    var tagFilter = "";

    function applyTagFilter() {
      cards.forEach(function (card) {
        var content = card.textContent.toLowerCase();
        card.hidden = !!tagFilter && content.indexOf(tagFilter) === -1;
      });
    }

    tags.forEach(function (tag) {
      tag.addEventListener("click", function (event) {
        event.preventDefault();
        var selected = tag.textContent.trim().toLowerCase();
        tagFilter = tagFilter === selected ? "" : selected;
        tags.forEach(function (item) {
          var active = item.textContent.trim().toLowerCase() === tagFilter;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        applyTagFilter();
      });
    });

    var sort = document.querySelector(".blog-header-bar .sort-select");
    if (sort) {
      sort.addEventListener("change", function () {
        var value = sort.value.toLowerCase();
        if (value.indexOf("latest") !== -1 || value.indexOf("oldest") !== -1) {
          cards.sort(function (a, b) {
            var aMeta = a.querySelector(".blog-meta");
            var bMeta = b.querySelector(".blog-meta");
            var aDate = Date.parse(aMeta ? aMeta.textContent : "") || 0;
            var bDate = Date.parse(bMeta ? bMeta.textContent : "") || 0;
            return value.indexOf("oldest") !== -1 ? aDate - bDate : bDate - aDate;
          });
          cards.forEach(function (card) { grid.appendChild(card); });
          applyTagFilter();
        }
      });
    }

    // This static page contains six article previews and no additional page data.
    var pagination = document.querySelector(".pagination");
    if (pagination && cards.length <= 6) pagination.hidden = true;
  }

  function initQuoteProductSelection() {
    var select = document.querySelector("#service");
    if (!select) return;
    var params = new URLSearchParams(window.location.search);
    var requested = params.get("product");
    if (!requested) return;
    var option = Array.prototype.find.call(select.options, function (item) {
      return item.textContent.trim().toLowerCase() === requested.trim().toLowerCase();
    });
    if (option) select.value = option.value || option.textContent;
  }

  function disableUnconfiguredSocialLinks() {
    document.querySelectorAll('a[href="#"]').forEach(function (link) {
      if (!link.querySelector(".fa-brands")) return;
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("title", "Social profile link has not been configured");
      link.style.cursor = "default";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNavigation();
    initWhatsAppForms();
    initGalleryFilters();
    initProductListing();
    initHeaderSearch();
    initHomepageProductLinks();
    initGalleryLightbox();
    initBlogInteractions();
    initQuoteProductSelection();
    disableUnconfiguredSocialLinks();
  });
})();
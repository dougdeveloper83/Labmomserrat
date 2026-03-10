const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const yearNode = document.querySelector("#current-year");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const prefersReducedMotion =
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keep footer year updated automatically.
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const setMenuState = (isOpen) => {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.toggle("nav-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar menu principal" : "Abrir menu principal"
  );
};

const closeMenu = () => setMenuState(false);

if (menuToggle && header && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !header.classList.contains("nav-open");
    setMenuState(isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

// Smooth scrolling with offset for the fixed header.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    const offset = header ? header.offsetHeight + 12 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    closeMenu();
  });
});

if (header) {
  const toggleHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  toggleHeaderState();
  window.addEventListener("scroll", toggleHeaderState, { passive: true });
}

// Reveal elements when they appear in the viewport.
const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length > 0) {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const counterItems = document.querySelectorAll(".counter-value");

if (counterItems.length > 0) {
  const animateCounter = (node) => {
    const target = Number(node.dataset.counterTarget || 0);
    const prefix = node.dataset.counterPrefix || "";
    const suffix = node.dataset.counterSuffix || "";
    const decimals = Number(node.dataset.counterDecimals || 0);
    const duration = 1200;
    const start = performance.now();

    const formatValue = (value) => {
      if (decimals > 0) {
        return `${prefix}${value.toFixed(decimals)}${suffix}`;
      }

      return `${prefix}${Math.round(value).toLocaleString("en-US")}${suffix}`;
    };

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      node.textContent =
        decimals > 0
          ? formatValue(current)
          : `${prefix}${Math.round(current).toLocaleString("en-US")}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      node.textContent = formatValue(target);
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    counterItems.forEach((item) => {
      const target = Number(item.dataset.counterTarget || 0);
      const prefix = item.dataset.counterPrefix || "";
      const suffix = item.dataset.counterSuffix || "";
      const decimals = Number(item.dataset.counterDecimals || 0);

      item.textContent =
        decimals > 0
          ? `${prefix}${target.toFixed(decimals)}${suffix}`
          : `${prefix}${Math.round(target).toLocaleString("en-US")}${suffix}`;
    });
  } else if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counterItems.forEach((item) => counterObserver.observe(item));
  } else {
    counterItems.forEach((item) => animateCounter(item));
  }
}

if (contactForm && formStatus) {
  const fields = Array.from(
    contactForm.querySelectorAll("input[required], textarea[required]")
  );

  const showStatus = (message, type) => {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  };

  const clearFieldError = (field) => {
    if (field.getAttribute("aria-invalid") === "true") {
      field.setAttribute("aria-invalid", "false");
    }
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("blur", () => {
      if (field.value.trim()) {
        clearFieldError(field);
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;
    let firstInvalid = null;

    fields.forEach((field) => {
      const fieldIsValid = field.value.trim().length > 0;
      field.setAttribute("aria-invalid", String(!fieldIsValid));

      if (!fieldIsValid) {
        isValid = false;
        if (!firstInvalid) {
          firstInvalid = field;
        }
      }
    });

    const email = contactForm.querySelector("#email");
    const emailValue = email ? email.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (email && !emailPattern.test(emailValue)) {
      email.setAttribute("aria-invalid", "true");
      isValid = false;
      if (!firstInvalid) {
        firstInvalid = email;
      }
    }

    if (!isValid) {
      showStatus(
        "Revisa los campos obligatorios e ingresa un email valido.",
        "error"
      );
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Placeholder success flow while backend endpoint is not connected.
    showStatus(
      "Solicitud enviada. Te contactaremos en breve para agendar tu examen.",
      "success"
    );
    contactForm.reset();
  });
}

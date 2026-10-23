(function () {
	"use strict";

	var sidebar = document.querySelector(".sidebar");
	var current = sidebar && sidebar.querySelector("[data-toc-current]");
	var links = sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll('a[href^="#"]')) : [];
	var active = null;
	var ticking = false;
	var settled = 0;

	Array.prototype.forEach.call(document.querySelectorAll("button[aria-controls]"), function (button) {
		var panel = document.getElementById(button.getAttribute("aria-controls"));
		if (!panel) return;

		function setOpen(open) {
			button.setAttribute("aria-expanded", String(open));
			panel.classList.toggle("is-open", open);
		}

		button.addEventListener("click", function () {
			setOpen(button.getAttribute("aria-expanded") !== "true");
		});

		panel.addEventListener("click", function (event) {
			if (event.target.closest("a")) setOpen(false);
		});

		document.addEventListener("click", function (event) {
			if (button.getAttribute("aria-expanded") === "true" && !panel.contains(event.target) && !button.contains(event.target)) {
				setOpen(false);
			}
		});

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
				setOpen(false);
				button.focus();
			}
		});
	});

	function targets() {
		return links
			.map(function (link) {
				var target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
				if (!target) return null;
				var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
				return { link: link, top: target.getBoundingClientRect().top + window.scrollY - margin };
			})
			.filter(Boolean)
			.sort(function (a, b) {
				return a.top - b.top;
			});
	}

	function activate(link) {
		if (link === active) return;
		active = link;
		links.forEach(function (item) {
			item.removeAttribute("aria-current");
			item.parentNode.classList.remove("is-active");
		});
		if (link) {
			link.setAttribute("aria-current", "true");
			link.parentNode.classList.add("is-active");
			link.closest(".sidebar__item").classList.add("is-active");
		}
		if (current) current.textContent = link ? link.textContent : "";
	}

	function spy() {
		var list = targets();
		if (!list.length) return;
		var threshold = window.scrollY + 1;
		var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
		var match = list[0].link;
		if (maxScroll > 0 && window.scrollY >= maxScroll - 1) {
			match = list[list.length - 1].link;
		} else {
			list.forEach(function (item) {
				if (item.top <= threshold) match = item.link;
			});
		}
		activate(match);
	}

	function onScroll() {
		clearTimeout(settled);
		settled = setTimeout(spy, 120);
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function () {
			ticking = false;
			spy();
		});
	}

	if (links.length) {
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		window.addEventListener("load", spy);
		spy();
	}

	var content = document.getElementById("content");
	if (!content) return;

	Array.prototype.forEach.call(content.querySelectorAll("h2[id], h3[id], h4[id]"), function (heading) {
		var anchor = document.createElement("a");
		anchor.className = "heading-link";
		anchor.href = "#" + heading.id;
		anchor.tabIndex = -1;
		anchor.setAttribute("aria-hidden", "true");
		anchor.textContent = "#";
		heading.appendChild(anchor);
	});

	if (typeof HTMLDialogElement !== "function") return;

	var images = Array.prototype.slice.call(content.querySelectorAll("img")).filter(function (img) {
		return !img.closest("a");
	});
	var lightbox = null;
	var opener = null;
	var resized = 0;

	function markZoomable(img) {
		var zoomable = img.naturalWidth > img.clientWidth * 1.15;
		img.classList.toggle("is-zoomable", zoomable);
		if (zoomable) {
			img.tabIndex = 0;
			img.setAttribute("role", "button");
			img.setAttribute("aria-label", "Enlarge image" + (img.alt ? ": " + img.alt : ""));
		} else {
			img.removeAttribute("tabindex");
			img.removeAttribute("role");
			img.removeAttribute("aria-label");
		}
	}

	function openLightbox(img) {
		if (!lightbox) {
			lightbox = document.createElement("dialog");
			lightbox.className = "lightbox";
			lightbox.setAttribute("aria-label", "Enlarged image");
			lightbox.innerHTML = '<button class="lightbox__close" type="button">Close</button><img class="lightbox__image" alt="">';
			lightbox.querySelector(".lightbox__close").addEventListener("click", function () {
				lightbox.close();
			});
			lightbox.addEventListener("click", function (event) {
				if (event.target === lightbox) lightbox.close();
			});
			lightbox.addEventListener("close", function () {
				if (opener) opener.focus();
			});
			document.body.appendChild(lightbox);
		}
		var full = lightbox.querySelector(".lightbox__image");
		full.src = img.currentSrc || img.src;
		full.alt = img.alt;
		opener = img;
		lightbox.showModal();
		lightbox.scrollTop = 0;
	}

	images.forEach(function (img) {
		if (img.complete) markZoomable(img);
		img.addEventListener("load", function () {
			markZoomable(img);
		});
	});

	window.addEventListener("resize", function () {
		clearTimeout(resized);
		resized = setTimeout(function () {
			images.forEach(markZoomable);
		}, 150);
	});

	content.addEventListener("click", function (event) {
		var img = event.target.closest("img.is-zoomable");
		if (img) openLightbox(img);
	});

	content.addEventListener("keydown", function (event) {
		if ((event.key === "Enter" || event.key === " ") && event.target.matches("img.is-zoomable")) {
			event.preventDefault();
			openLightbox(event.target);
		}
	});
})();

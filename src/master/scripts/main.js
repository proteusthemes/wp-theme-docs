(function () {
	"use strict";

	var sidebar = document.querySelector(".sidebar");
	var toggle = sidebar && sidebar.querySelector(".sidebar__toggle");
	var current = sidebar && sidebar.querySelector("[data-toc-current]");
	var links = sidebar ? Array.prototype.slice.call(sidebar.querySelectorAll('a[href^="#"]')) : [];
	var active = null;
	var ticking = false;

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
				return target && { link: link, top: target.getBoundingClientRect().top + window.scrollY };
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
		var threshold = window.scrollY + 24 + (toggle ? toggle.offsetHeight : 0);
		var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
		var match = null;
		if (window.scrollY >= maxScroll - 1) {
			match = list[list.length - 1].link;
		} else {
			list.forEach(function (item) {
				if (item.top <= threshold) match = item.link;
			});
		}
		activate(match);
	}

	function onScroll() {
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
})();

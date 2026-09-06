(function () {
	"use strict";

	var paths = "";
	for (var pathNumber = 1; pathNumber < 38; pathNumber++) {
		paths += '<span class="path' + pathNumber + '"></span>';
	}

	Array.prototype.forEach.call(document.querySelectorAll("i.gp, span.gp"), function (icon) {
		icon.insertAdjacentHTML("beforeend", paths);
	});
})();

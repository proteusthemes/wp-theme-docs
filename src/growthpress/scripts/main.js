(function ($) {
	'use strict';

	$( 'i.gp, span.gp' ).each( function() {
		for (var pathNumber = 1; pathNumber < 38; pathNumber++) {
			$( this ).append( '<span class="path' + pathNumber + '"></span>' );
		}
	} );
})(jQuery);

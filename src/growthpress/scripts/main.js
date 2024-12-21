require.config( {
	paths: {
		jquery:              '../bower_components/jquery/dist/jquery.min',
		bootstrapAffix:      '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix',
		bootstrapAlert:      '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert',
		bootstrapButton:     '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button',
		bootstrapCarousel:   '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel',
		bootstrapCollapse:   '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse',
		bootstrapDropdown:   '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown',
		bootstrapModal:      '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal',
		bootstrapPopover:    '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover',
		bootstrapScrollspy:  '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy',
		bootstrapTab:        '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab',
		bootstrapTooltip:    '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip',
		bootstrapTransition: '../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition',
		fastclick:           '../bower_components/fastclick/lib/fastclick'
	},
	shim: {
		bootstrapAffix: {
			deps: [
				'jquery'
			]
		},
		bootstrapAlert: {
			deps: [
				'jquery'
			]
		},
		bootstrapButton: {
			deps: [
				'jquery'
			]
		},
		bootstrapCarousel: {
			deps: [
				'jquery'
			]
		},
		bootstrapCollapse: {
			deps: [
				'jquery',
				'bootstrapTransition'
			]
		},
		bootstrapDropdown: {
			deps: [
				'jquery'
			]
		},
		bootstrapModal: {
			deps: [
				'jquery'
			]
		},
		bootstrapPopover: {
			deps: [
				'jquery'
			]
		},
		bootstrapScrollspy: {
			deps: [
				'jquery'
			]
		},
		bootstrapTab: {
			deps: [
				'jquery'
			]
		},
		bootstrapTooltip: {
			deps: [
				'jquery'
			]
		},
		bootstrapTransition: {
			deps: [
				'jquery'
			]
		}
	}
} );

require( [ 'jquery', 'fastclick', 'bootstrapCollapse', 'bootstrapAffix', 'bootstrapScrollspy', 'bootstrapDropdown' ] , function ( $, FastClick ) {
	'use strict';

	/**
	 * Add path markup in growth icons.
	 */
	(function () {
		$( 'i.gp, span.gp' ).each( function() {
			for (var pathNumber = 1; pathNumber < 38; pathNumber++) {
				$( this ).append( '<span class="path' + pathNumber + '"></span>' );
			}
		} );
	}());

	// Remove the 300ms delay on mobile devices
	// https://www.mobify.com/blog/beginners-guide-to-perceived-performance/
	FastClick.attach(document.body);
} );

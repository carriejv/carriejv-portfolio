'use strict';

(function($) {

	$(document).ready(function() {
		// Load ajax content.
		$('#project-viewer').css('background-image', 'url("/static/media/load.svg")');
		$('[data-content]').each(function() {
			var uri = $(this).attr('data-content');
			$(this).load(uri, function(){
				$('#project-viewer').css('background-image', 'none');
			});
		});
		$('[data-img]').each(function() {
			var img = $('<img alt="' + $('#project-description').find('h2').html() + '" />').appendTo(this);
			var width = ($(window).width() && $(window).width() < 1920 ? $(window).width() : 1920);
			img.attr('src', $(this).attr('data-img').replace('%scale', width));
		});
	});

})(jQuery);
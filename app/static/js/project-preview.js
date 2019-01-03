'use strict';

(function($) {

	$(document).ready(function() {
		// Load ajax content.
		$('[data-content],[data-img]').css('background-image', 'url("/static/media/load.svg")');
		$('[data-content]').each(function() {
			var uri = $(this).attr('data-content');
			$(this).load(uri, function(){
				$(this).css('background-image', 'none');
			});
		});
	});

})(jQuery);
'use strict';

(function($) {

	$(document).ready(function() {
		// Load ajax content.
		$('[data-content],[data-img]').css('background-image', 'url("/static/media/load.svg")');
		$('[data-content]').each(function() {
			var uri = $(this).attr('data-content');
			$(this).load(uri, function(){
				$(this).find('a').each(function() {
					var html = $(this).html();
					var div = $('<div></div>');
					div.html(html);
					div.css({display: 'inline-block'})
					$(this).after(div);
					$(this).remove();
				});
				$(this).css('background-image', 'none');
			});
		});

		// Reload tab on click
		$('.project-nav-tab').on('click', function() {
			window.location = $(this).attr('data-caturi');
		});
	});

})(jQuery);
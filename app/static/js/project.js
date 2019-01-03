'use strict';

// Deprecated v1.0.0. Symonfy-site-era sliders now replaced with Flexbox gallery.

(function($) {

	var slidersActive = false;

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
		// Set up sliders.
		adjustSliders();
		$('.project-nav-tab').on('shown.bs.tab', adjustSliders);
		$(window).resize(adjustSliders);

		if(slidersActive) {
			var activeTab = $('.project-nav-cat.active')
			var activeSlider = activeTab.find('.project-nav-slider');
			var activeCtr = activeTab.find('.project-nav-slider-container');
			var activeItem = $('.project-nav-item-active');
			var startPosition = activeItem.position().left;
			if(startPosition > activeSlider.width() - activeCtr.width()) {
				startPosition = activeSlider.width() - activeCtr.width() - 30;
			}
			startPosition *= -1;
			activeSlider.css('left', startPosition);
			adjustSliders(); // Fire a second adjust sliders to adjust to the new state.
		}

		// Arrow key scrolling
		$(document).on('keyup', (evt)  => {
			switch(evt.which) {
				case 37:
					prevItem();
					break;
				case 39:
					nextItem();
					break;
			}
		});

		// Reload tab on click
		$('.project-nav-tab').on('click', function() {
			window.location = $(this).attr('data-caturi');
		});
	});

	var prevItem = function() {
		var tgt = $('.project-nav-item-active').prev('.project-nav-item');
		if(tgt.length > 0) {
			window.location = tgt.attr('href');
		}
	};

	var nextItem = function() {
		var tgt = $('.project-nav-item-active').next('.project-nav-item');
		if(tgt.length > 0) {
			window.location = tgt.attr('href');
		}
	};

	var adjustSliders = function() {

		var slideBase = 0.1;
		var slideMax = 2;
		var slideScale = 1.05;
		var slideRate = 10;
		var slideCurrent = slideBase;

		var clickThreshold = 250;

		$('.project-nav-cat.active').each(function(){
			var parent = $(this);
			var slider = parent.find('.project-nav-slider');
			var ctr = parent.find('.project-nav-slider-container');
			var sliding = false;
			var clicked = false;
			var interval;
			var intervalCount = 0;
			if(slider.width() <= ctr.width() + 30) { // 30 accounts for bootstrap gutters
				slidersActive = false;
				parent.find('.project-nav-btn').css('display', 'none');
				slider.css({
					'left': 0,
					'display': 'flex',
					'justify-content': 'space-around'
				});
				parent.find('.project-nav-btn').off('click');
			}
			else {
				slidersActive = true;
				parent.find('.project-nav-btn').css('display', 'block');
				parent.find('.project-nav-slider').css({
					'display': 'block'
				});

				var slideRight = function() {
					if(sliding) {
						return;
					}
					sliding = true;

					interval = window.setInterval( ()  => {
						intervalCount++;
						if(intervalCount * slideRate > clickThreshold) {
							if(slider.position().left + slider.width() - slideCurrent > ctr.width() + 30) {
								slider.css('left', slider.position().left - slideCurrent);
								slideCurrent *= slideScale;
								if(slideCurrent > slideMax) {
									slideCurrent = slideMax;
								}
								changeButtonBGs();
							}
							else {
								slider.css('left', ctr.width() - slider.width() + 30);
								resetSlide();
							}
						}
					}, slideRate);
				};

				var endRight = function() {
					if(!sliding || clicked) {
						return;
					}
					if(slideRate * intervalCount < clickThreshold) {
						nextItem();
					}
					else {
						resetSlide();
					}
				};

				var slideLeft = function() {
					if(sliding) {
						return;
					}
					sliding = true;

					interval = window.setInterval( ()  =>  {
						intervalCount++;
						if(intervalCount * slideRate > clickThreshold) {
							if(slider.position().left + slideCurrent < 0) {
								slider.css('left', slider.position().left + slideCurrent);
								slideCurrent *= slideScale;
								if(slideCurrent > slideMax) {
									slideCurrent = slideMax;
								}
								changeButtonBGs();
							}
							else {
								slider.css('left', 0);
								resetSlide();
							}
						}
					}, slideRate);
				};

				var endLeft = function() {
					if(!sliding || clicked) {
						return;
					}
					if(slideRate * intervalCount < clickThreshold) {
						prevItem();
					}
					else {
						resetSlide();
					}
					intervalCount = 0;
				};

				var changeButtonBGs = function() {
					// Slider is at the left limit.
					if (slider.position().left >= 0 && $('.project-nav-item-active').index() === 0) {
						parent.find('.project-nav-btn-left').css('background-image', 'url("/static/media/buttons/dis-arrow-left.png")');
						parent.find('.project-nav-btn-left').css('cursor', 'default');
					}
					else {
						parent.find('.project-nav-btn-left').css('background-image', 'url("/static/media/buttons/arrow-left.png")');
						parent.find('.project-nav-btn-left').css('cursor', 'pointer');
					}
					// Slider is at the right limit.'
					if (slider.position().left <= ctr.width() - slider.width() + 30 && $('.project-nav-item-active').index() === $('.project-nav-item-active').parent().find('.project-nav-item').length - 1) {
						parent.find('.project-nav-btn-right').css('background-image', 'url("/static/media/buttons/dis-arrow-right.png")');
						parent.find('.project-nav-btn-right').css('cursor', 'default');
					}
					else {
						parent.find('.project-nav-btn-right').css('background-image', 'url("/static/media/buttons/arrow-right.png")');
						parent.find('.project-nav-btn-right').css('cursor', 'pointer');
					}
				};

				var resetSlide = function() {
					window.clearInterval(interval);
					intervalCount = 0;
					slideCurrent = slideBase;
					clicked = false;
					sliding = false;
					changeButtonBGs();
				};

				resetSlide(); // Initial reset updates slider state on page load if needed.
				parent.find('.project-nav-btn-left').on('mousedown touchstart', slideLeft);
				parent.find('.project-nav-btn-left').on('mouseup mouseout touchend', endLeft);
				parent.find('.project-nav-btn-right').on('mousedown touchstart', slideRight);
				parent.find('.project-nav-btn-right').on('mouseup mouseout touchend', endRight);
			}
		});
	};

})(jQuery);
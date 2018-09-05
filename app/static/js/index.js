'use strict';

(function($) {

	var tgtObj = $('#typing-contents,#typing-mobile');
	var textArr = window.subheaders;
	var textIndex = 0;
	var typingSpeed = 80;
	var waitTime = 1000;
	var isTyping = false;
	var charIndex, textInterval, textTimeout;

	var initText = function(jqObj) {
		if(textInterval) {
			window.clearInterval(textInterval);
		};
		if(textTimeout) {
			window.clearInterval(textTimeout);
		};
		charIndex = jqObj.html().length - 1;
		var tick = function() {
			if(isTyping) {
				jqObj.html(jqObj.html() + textArr[textIndex].charAt(charIndex));
				if(charIndex === textArr[textIndex].length - 1) {
					isTyping = false;
					window.clearInterval(textInterval);
					textTimeout = window.setTimeout(function() {
						textInterval = window.setInterval(tick, typingSpeed);
					}, waitTime);
				}
				else {
					charIndex++;
				}
			}
			else {
				jqObj.html(jqObj.html().slice(0, -1));
				if(charIndex === 0) {
					textIndex++;
					if(textIndex === textArr.length) {
						textIndex = 0;
					}
					isTyping = true;
				}
				else {
					charIndex--;
				}
			}
		};
		textTimeout = window.setTimeout(function() {
			jqObj.parent().append('<span class="blink adark">_</span>');
			textInterval = window.setInterval(tick, typingSpeed);
		}, waitTime);
	};

	if(textArr) {
		initText(tgtObj);
	}

})(jQuery);
(function($) {

    $(document).ready(function() {
        var navPane = $('#nav');
        var contentPane = $('#content');
        setupBGSlideshow();
        //createAjaxLinks(contentPane, contentPane);
        //createAjaxLinks(navPane, contentPane);
    });

    // sorta broken lel
    var createAjaxLinks = function(inDiv, tgtDiv) {
        $(inDiv).find('a[data-ajax]').on('click', function(evt) {
            evt.preventDefault();
            var targetSelector = $(this);
            ajaxLoadContent(targetSelector.attr('href'), tgtDiv, '#content', function(res) {
                history.pushState({href: window.location.href}, $(res).find('title').html(), targetSelector.attr('href'))
                if(targetSelector.hasClass('nav-item')) {
                    $('.nav-active').removeClass('nav-active');
                    targetSelector.addClass('nav-active');
                }
            }) 
        });
    };

    var ajaxLoadContent = function(href, inElement, tgtElement, callback) {
        var loadComplete = false;
        var animationComplete = false;
        var fadeTime = 500;
        $(inElement).animate({opacity: 0}, 500, function() {
            if(loadComplete) {
                var animationComplete = true;
                $(inElement).animate({opacity: 1}, 500);
            }
            else {
                $(inElement).css('background', 'url("/static/media/load.svg") center/contain no-repeat');
            }
        });
        $.ajax(href)
            .done(function(res) {
                console.log(res);
                var contentHtml = $(res).find(tgtElement).html();
                $(inElement).html(contentHtml);
                loadComplete = true;
                if(!animationComplete) {
                    $(inElement).animate({opacity: 1}, 500);
                    $(inElement).css('background', 'none');
                }
                if(callback && typeof callback === 'function') {
                    callback(res);
                }
            })
            .fail(function(err) { // If we fail, we just follow the link as normal.
                window.location.replace(href);
            });
    }

    var setupBGSlideshow = function() {
        var firstDivVisible = true;
        var slideIndex = 1; // Start at 1, since slide 1 is prepped at load.
        var slides = [
            '/static/media/bg/bg0.jpg',
            '/static/media/bg/bg1.jpg',
            '/static/media/bg/bg2.jpg',
            '/static/media/bg/bg3.jpg'
        ]
        var fadeTime = 10000;
        var slideTime = 40000;

        $('[data-bg-slide="0"]').css('background', 'url("/static/media/bg/bg0.jpg") center/cover no-repeat');
        $('[data-bg-slide="1"]').css('background', 'url("/static/media/bg/bg1.jpg") center/cover no-repeat');
        window.setInterval(advanceSlide, slideTime);

        var advanceSlide = function() {
            slideIndex++;
            if(slideIndex >= slides.length) {
                slideIndex = 0;
            }
            if(firstDivVisible) {
                $('[data-bg-slide="0"]').animate({
                    opacity: 0
                }, fadeTime, function() {
                    $('[data-bg-slide="0"]').css('background-image', 'url("' + slides[slideIndex] + '")');
                });
                $('[data-bg-slide="1"]').animate({
                    opacity: 1
                }, fadeTime);
            }
            else {
                $('[data-bg-slide="1"]').animate({
                    opacity: 0
                }, fadeTime, function() {
                    $('[data-bg-slide="1"]').css('background-image', 'url("' + slides[slideIndex] + '")');
                });
                $('[data-bg-slide="0"]').animate({
                    opacity: 1
                }, fadeTime);
            }
            firstDivVisible = !firstDivVisible;
        };
    }



})(jQuery);
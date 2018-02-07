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
            var img = $('<img />').appendTo(this);
            img.attr('src', $(this).attr('data-img').replace('%scale', $(window).width()));
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
                startPosition = activeSlider.width() - activeCtr.width();
            }
            startPosition *= -1;
            activeSlider.css('left', startPosition);
        }

        // Arrow key scrolling
        $(document).on('keyup', function(evt) {
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
        })
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
        var clickMovement = 134;
        var clickMoveSpeed = 250;

        $('.project-nav-cat.active').each(function(){
            var parent = $(this);
            var slider = parent.find('.project-nav-slider');
            var ctr = parent.find('.project-nav-slider-container');
            var sliding = false;
            var clicked = false;
            var interval;
            var intervalCount = 0;
            parent.find('.project-nav-btn').off('mousedown touchstart mouseup mouseout touchend');
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
                    
                    interval = window.setInterval(function() {
                        intervalCount++;
                        if(intervalCount * slideRate > clickThreshold) {
                            if(slider.position().left + slider.width() - slideCurrent > ctr.width() + 30) {
                                slider.css('left', slider.position().left - slideCurrent);
                                slideCurrent *= slideScale;
                                if(slideCurrent > slideMax) {
                                    slideCurrent = slideMax;
                                }
                            }
                            else {
                                slider.css('left', slider.position().left + slider.width() > ctr.width() + 30);
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
                        /* - Old Functionality (Advance w/o loading next.)
                        clicked = true;
                        var movement = clickMovement;
                        if(slider.position().left + slider.width() - movement < ctr.width() + 30) {
                            movement += (slider.position().left + slider.width() - movement) - (ctr.width() + 30);
                        }
                        slider.animate({left: '-=' + movement}, clickMoveSpeed, 'swing', function() {
                            resetSlide();
                        });
                        */
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
                    
                    interval = window.setInterval(function() {
                        intervalCount++;
                        if(intervalCount * slideRate > clickThreshold) {
                            if(slider.position().left + slideCurrent < 0) {
                                slider.css('left', slider.position().left + slideCurrent);
                                slideCurrent *= slideScale;
                                if(slideCurrent > slideMax) {
                                    slideCurrent = slideMax;
                                }
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
                        /* - Old Functionality (Advance w/o loading next.)
                        clicked = true;
                        var movement = clickMovement;
                        if(slider.position().left + movement > 0) {
                            movement = slider.position().left * -1;
                        }
                        slider.animate({left: '+=' + movement}, clickMoveSpeed, 'swing', function() {
                            resetSlide();
                        });
                        */
                    }
                    else {
                        resetSlide();
                    }
                    intervalCount = 0;
                };

                var resetSlide = function() {
                    window.clearInterval(interval);
                    intervalCount = 0;
                    slideCurrent = slideBase;
                    clicked = false;
                    sliding = false;
                };

                parent.find('.project-nav-btn-left').on('mousedown touchstart', slideLeft);
                parent.find('.project-nav-btn-left').on('mouseup mouseout touchend', endLeft);
                parent.find('.project-nav-btn-right').on('mousedown touchstart', slideRight);
                parent.find('.project-nav-btn-right').on('mouseup mouseout touchend', endRight);
            }
        });
    };

})(jQuery);
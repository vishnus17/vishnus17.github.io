(function ($) {

  "use strict";

    // COLOR MODE
    $('.color-mode').click(function(){
        $('.color-mode-icon').toggleClass('active')
        $('body').toggleClass('dark-mode')
    })

    // HEADER
    $(".navbar").headroom();

    // SMOOTHSCROLL
    $(function() {
      $('.nav-link, .custom-btn-link').on('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 49
        }, 1000);
        event.preventDefault();
      });
    });

    // TOOLTIP
    $('.social-links a').tooltip();

    // SCROLL REVEAL
    var revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    if ('IntersectionObserver' in window && revealElements.length) {
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach(function(el) { revealObserver.observe(el); });
    } else {
        // Fallback for browsers without IntersectionObserver
        revealElements.forEach(function(el) { el.classList.add('visible'); });
    }

    // TILT EFFECT for project & article cards
    var tiltCards = document.querySelectorAll('.project-card-modern, .article-card');
    tiltCards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var rotateX = ((y / rect.height) - 0.5) * -4;
            var rotateY = ((x / rect.width) - 0.5) * 4;
            card.style.transform = 'translateY(-8px) perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        });
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    });

    // PIPELINE PROGRESS: highlight the currently visible stage in the summary banner
    var pipelineStages = document.querySelectorAll('.pipeline-stage[data-stage]');
    var sectionMap = {};
    pipelineStages.forEach(function(stage) {
        var id = stage.getAttribute('data-stage');
        var section = document.getElementById(id);
        if (section) sectionMap[id] = section;
    });

    function updateActiveStage() {
        var scrollY = window.pageYOffset + window.innerHeight * 0.35;
        var activeId = null;
        Object.keys(sectionMap).forEach(function(id) {
            var section = sectionMap[id];
            var top = section.getBoundingClientRect().top + window.pageYOffset;
            if (scrollY >= top) activeId = id;
        });

        pipelineStages.forEach(function(stage) {
            if (stage.getAttribute('data-stage') === activeId) {
                stage.classList.add('is-active');
            } else {
                stage.classList.remove('is-active');
            }
        });
    }

    if (pipelineStages.length) {
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateActiveStage();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        updateActiveStage();
    }

})(jQuery);

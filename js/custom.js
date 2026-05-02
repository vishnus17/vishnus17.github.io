(function ($) {

  "use strict";

    // COLOR MODE
    $('.color-mode').click(function(){
        $('.color-mode-icon').toggleClass('active')
        $('body').toggleClass('dark-mode')
    })

    // HEADER
    $(".navbar").headroom();

    // SMOOTHSCROLL — covers nav links, CTA, pipeline stages, and any anchor link
    $(function() {
      $(document).on('click', '.nav-link, .custom-btn-link, .pipeline-stage, a.scroll-link', function(event) {
        var $anchor = $(this);
        var href = $anchor.attr('href');
        if (!href || href.charAt(0) !== '#' || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        var offset = $(target).offset().top - 49;
        $('html, body').stop().animate({ scrollTop: offset }, 900, 'swing');
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

    // PIPELINE RUN ANIMATION — Start Pipeline play button
    var lockedCta = document.getElementById('lockedTeaserCta');
    var resetBtn = document.getElementById('pipelineResetBtn');
    var statusLabel = document.getElementById('pipelineStatusLabel');
    var durationLabel = document.getElementById('pipelineDurationLabel');
    var stagesContainer = document.getElementById('pipelineStages');
    var lockedTeaser = document.getElementById('pipelineLockedTeaser');
    var pipelineRunning = false;

    function revealSection(stageId) {
        var sections = document.querySelectorAll('.pipeline-section[data-pipeline-section="' + stageId + '"]');
        Array.prototype.forEach.call(sections, function(section) {
            section.classList.add('is-revealing');
            // re-trigger any reveal-stagger / reveal animations inside
            var nestedReveals = section.querySelectorAll('.reveal, .reveal-stagger');
            Array.prototype.forEach.call(nestedReveals, function(el) {
                el.classList.add('visible');
            });
        });
    }

    function unlockAllSections() {
        document.body.classList.remove('pipeline-locked');
        document.body.classList.remove('pipeline-not-started');
        document.body.classList.remove('pipeline-starting');
        var sections = document.querySelectorAll('.pipeline-section');
        Array.prototype.forEach.call(sections, function(section) {
            section.classList.remove('is-revealing');
        });
        if (lockedTeaser) lockedTeaser.style.display = 'none';
    }

    function lockAllSections() {
        document.body.classList.add('pipeline-locked');
        var sections = document.querySelectorAll('.pipeline-section');
        Array.prototype.forEach.call(sections, function(section) {
            section.classList.remove('is-revealing');
        });
    }

    function setStageState(stage, state) {
        stage.classList.remove('is-queued', 'is-running', 'is-passed');
        if (state) stage.classList.add('is-' + state);
    }

    function setArrowState(arrow, state) {
        arrow.classList.remove('is-active', 'is-passed');
        if (state) arrow.classList.add('is-' + state);
    }

    function setStatusLabel(html) {
        if (statusLabel) statusLabel.innerHTML = html;
    }

    function markAllPassed() {
        if (!stagesContainer) return;
        var children = stagesContainer.children;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.classList.contains('pipeline-stage')) {
                setStageState(el, 'passed');
            } else if (el.classList.contains('pipeline-arrow')) {
                setArrowState(el, 'passed');
            }
        }
        setStatusLabel('<span class="meta-ok">●</span> all stages passed');
        if (durationLabel) durationLabel.textContent = '12.4s';
        pipelineRunning = false;
    }

    function runPipeline() {
        if (!stagesContainer) return;
        if (pipelineRunning) return;
        pipelineRunning = true;

        var stages = stagesContainer.querySelectorAll('.pipeline-stage');
        var arrows = stagesContainer.querySelectorAll('.pipeline-arrow');

        // reset to queued first
        Array.prototype.forEach.call(stages, function(s) { setStageState(s, 'queued'); });
        Array.prototype.forEach.call(arrows, function(a) { setArrowState(a, null); });

        setStatusLabel('<span class="meta-running">●</span> pipeline running');
        if (durationLabel) durationLabel.textContent = '0.0s';

        var startedAt = Date.now();
        var durationTick = setInterval(function() {
            if (durationLabel) {
                durationLabel.textContent = ((Date.now() - startedAt) / 1000).toFixed(1) + 's';
            }
        }, 100);

        var stageDelay = 750;   // time stage stays in "running"
        var stagger = 900;      // delay between stage transitions

        // hide the locked teaser as we start
        if (lockedTeaser) lockedTeaser.style.display = 'none';

        Array.prototype.forEach.call(stages, function(stage, idx) {
            var stageId = stage.getAttribute('data-stage');

            // mark this stage running + reveal its section
            setTimeout(function() {
                setStageState(stage, 'running');
                var prevArrow = arrows[idx - 1];
                if (prevArrow) setArrowState(prevArrow, 'active');
                if (stageId) revealSection(stageId);
            }, idx * stagger);

            // mark it passed shortly after
            setTimeout(function() {
                setStageState(stage, 'passed');
                var prevArrow = arrows[idx - 1];
                if (prevArrow) setArrowState(prevArrow, 'passed');
            }, idx * stagger + stageDelay);
        });

        // finalize after the last stage — fully unlock the page
        setTimeout(function() {
            clearInterval(durationTick);
            markAllPassed();
            unlockAllSections();
            try { localStorage.setItem('pipelineHasRun', '1'); } catch (e) {}
        }, stages.length * stagger + 200);
    }

    // Initial lock state — sections hidden until pipeline runs
    var pipelineHasRunBefore = false;
    try { pipelineHasRunBefore = localStorage.getItem('pipelineHasRun') === '1'; } catch (e) {}

    if (pipelineHasRunBefore) {
        // returning visitor — skip the lock + animation, page is already unlocked
        unlockAllSections();
        markAllPassed();
    } else {
        lockAllSections();
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            try { localStorage.removeItem('pipelineHasRun'); } catch (e) {}
            // Hard reload puts the page back into the locked-teaser state cleanly.
            window.location.reload();
        });
    }

    if (lockedCta) {
        lockedCta.addEventListener('click', function() {
            if (document.body.classList.contains('pipeline-starting')) return;
            // Trigger crossfade: locked-teaser collapses out, pipeline-summary slides in.
            document.body.classList.add('pipeline-starting');

            // The pipeline-summary's reveal element is inside view but display:none
            // before the swap, so the IntersectionObserver may not pick it up — show it manually.
            var summaryInner = document.getElementById('pipelineSummary');
            if (summaryInner) summaryInner.classList.add('visible');

            // After the crossfade finishes, hand off to the regular pipeline runner.
            setTimeout(function() {
                document.body.classList.remove('pipeline-not-started');
                document.body.classList.remove('pipeline-starting');
                if (lockedTeaser) lockedTeaser.style.display = 'none';
                runPipeline();
            }, 1100);
        });
    }

})(jQuery);

// Joe Nipote — app.js

// Page fade-in / fade-out transitions
(function () {
    requestAnimationFrame(() => document.body.classList.add('page-visible'));

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;
        if (link.target === '_blank') return;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('http') && !href.includes(window.location.hostname)) return;
        e.preventDefault();
        document.body.classList.remove('page-visible');
        setTimeout(() => { window.location.href = href; }, 220);
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupMobileDropdowns();
    setupVideoPlayer();
    setupInfohubScroll();
});

function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    if (!toggle || !overlay) return;

    const open = () => { overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { overlay.classList.remove('active'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function setupMobileDropdowns() {
    document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('open');
            btn.nextElementSibling?.classList.toggle('open');
        });
    });
}

function setupVideoPlayer() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    video.muted = true;

    // Play/Pause toggle
    const playPauseToggle = document.getElementById('play-pause-toggle');
    const pauseIcon = playPauseToggle?.querySelector('.pause-icon');
    const playIcon = playPauseToggle?.querySelector('.play-icon');

    if (playPauseToggle) {
        const syncPlayPause = () => {
            const paused = video.paused;
            if (pauseIcon) pauseIcon.style.display = paused ? 'none' : 'block';
            if (playIcon) playIcon.style.display = paused ? 'block' : 'none';
        };

        playPauseToggle.addEventListener('click', () => {
            if (video.paused) { video.play(); } else { video.pause(); }
        });

        video.addEventListener('play', syncPlayPause);
        video.addEventListener('pause', syncPlayPause);
        syncPlayPause();
    }

    // Mute toggle
    const muteToggle = document.getElementById('mute-toggle');
    const muteIcon = muteToggle?.querySelector('.mute-icon');
    const unmuteIcon = muteToggle?.querySelector('.unmute-icon');

    if (muteToggle) {
        if (muteIcon) muteIcon.style.display = 'none';
        if (unmuteIcon) unmuteIcon.style.display = 'block';

        muteToggle.addEventListener('click', () => {
            video.muted = !video.muted;
            if (muteIcon) muteIcon.style.display = video.muted ? 'none' : 'block';
            if (unmuteIcon) unmuteIcon.style.display = video.muted ? 'block' : 'none';
        });
    }

    const progressContainer = document.getElementById('video-progress-container');
    const progressFill = document.getElementById('video-progress-fill');
    const progressThumb = document.getElementById('video-progress-thumb');
    const timeDisplay = document.getElementById('video-time');
    if (!progressContainer) return;

    const fmt = (s) => isFinite(s)
        ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
        : '0:00';

    function updateProgress() {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = pct + '%';
        if (progressThumb) progressThumb.style.left = pct + '%';
        if (timeDisplay) timeDisplay.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    function seek(e) {
        if (!video.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        video.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * video.duration;
    }

    let dragging = false;
    progressContainer.addEventListener('mousedown', (e) => { dragging = true; seek(e); });
    document.addEventListener('mousemove', (e) => { if (dragging) seek(e); });
    document.addEventListener('mouseup', () => { dragging = false; });
}

function setupInfohubScroll() {
    const infoColumn = document.querySelector('.info-column');
    const videoContainer = document.querySelector('.hero-video-container');
    if (!infoColumn || !videoContainer) return;

    function doScroll(delta) {
        const max = infoColumn.scrollHeight - infoColumn.clientHeight;
        if (max <= 0) return false;
        infoColumn.scrollTop = Math.max(0, Math.min(infoColumn.scrollTop + delta, max));
        return true;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:10;pointer-events:none;background:transparent;';
    videoContainer.style.position = 'relative';
    videoContainer.appendChild(overlay);

    function syncPointerEvents() {
        overlay.style.pointerEvents = window.innerWidth > 820 ? 'auto' : 'none';
    }
    syncPointerEvents();
    window.addEventListener('resize', syncPointerEvents);

    overlay.addEventListener('wheel', (e) => {
        e.preventDefault();
        doScroll(e.deltaY);
    }, { passive: false });

    document.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 820) return;
        if (!infoColumn.contains(e.target) && !videoContainer.contains(e.target)) {
            e.preventDefault();
            doScroll(e.deltaY);
        }
    }, { passive: false });

    infoColumn.style.scrollBehavior = 'auto';
}

class Slideshow {
  constructor() {
    this.overlay = document.getElementById('slideshow-overlay');
    this.slides = document.querySelectorAll('.slideshow-slide');
    this.audio = document.getElementById('slideshow-audio');
    this.current = 0;
    this.playing = false;
    this.interval = null;
    this.duration = 8000;

    if (!this.overlay || !this.slides.length) return;

    document.getElementById('play-slideshow')?.addEventListener('click', () => this.open());
    document.getElementById('slideshow-close')?.addEventListener('click', () => this.close());
    document.getElementById('slideshow-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('slideshow-next')?.addEventListener('click', () => this.next());
    document.getElementById('slideshow-pause')?.addEventListener('click', () => this.togglePause());

    document.addEventListener('keydown', (e) => {
      if (!this.overlay.classList.contains('active')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === ' ') { e.preventDefault(); this.togglePause(); }
    });
  }

  open() {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.current = 0;
    this.showSlide(0);
    this.playing = true;
    this.startAuto();
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    }
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.stopAuto();
    if (this.audio) {
      this.audio.pause();
    }
  }

  showSlide(index) {
    this.slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    this.current = index;
    const progress = document.getElementById('slideshow-progress');
    if (progress) {
      progress.textContent = `${index + 1} / ${this.slides.length}`;
    }
  }

  next() {
    const next = (this.current + 1) % this.slides.length;
    this.showSlide(next);
    if (this.playing) this.startAuto();
  }

  prev() {
    const prev = (this.current - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prev);
    if (this.playing) this.startAuto();
  }

  togglePause() {
    this.playing = !this.playing;
    const btn = document.getElementById('slideshow-pause');
    if (btn) btn.textContent = this.playing ? 'Пауза' : 'Продолжить';
    if (this.playing) {
      this.startAuto();
      this.audio?.play().catch(() => {});
    } else {
      this.stopAuto();
      this.audio?.pause();
    }
  }

  startAuto() {
    this.stopAuto();
    this.interval = setInterval(() => this.next(), this.duration);
  }

  stopAuto() {
    if (this.interval) clearInterval(this.interval);
  }
}

document.addEventListener('DOMContentLoaded', () => new Slideshow());

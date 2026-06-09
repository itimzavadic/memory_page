document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initShareMenu();
  initTributeModal();
});

function initScrollAnimations() {
  const blocks = document.querySelectorAll('.bio-block');
  if (!blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  blocks.forEach((block) => observer.observe(block));
}

function initShareMenu() {
  const btn = document.getElementById('share-btn');
  const menu = document.getElementById('share-dropdown');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', () => menu.classList.remove('open'));

  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = copyBtn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.textContent = 'Скопировано!';
        setTimeout(() => { copyBtn.textContent = 'Копировать ссылку'; }, 2000);
      });
    });
  }
}

function initTributeModal() {
  const openBtn = document.getElementById('open-tribute-form');
  const modal = document.getElementById('tribute-modal');
  const closeBtn = document.getElementById('close-tribute-modal');
  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

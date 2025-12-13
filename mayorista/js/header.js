document.addEventListener('DOMContentLoaded', function(){
  const hamburgers = document.querySelectorAll('.hamburger');
  hamburgers.forEach(btn => {
    btn.addEventListener('click', () => {
      const nav = document.querySelector('.nav-links');
      if (!nav) return;
      nav.style.display = (nav.style.display === 'flex' || getComputedStyle(nav).display === 'flex') ? 'none' : 'flex';
    });
  });
});
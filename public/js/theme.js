/**
 * Theme toggling functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.querySelector('.theme-toggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Set initial theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  // Add event listener to theme toggle button
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
});

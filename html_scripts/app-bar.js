function setDarkMode(isDark) {
    const root = document.documentElement;
    const darkModeClass = 'dark-mode';
    
    if (isDark) {
        root.classList.add(darkModeClass);
        document.body.classList.add(darkModeClass);
        root.style.setProperty('background-color', 'var(--bg-color-dark)');
        root.style.setProperty('color', 'var(--text-color-dark)');
    } else {
        root.classList.remove(darkModeClass);
        document.body.classList.remove(darkModeClass);
        root.style.setProperty('background-color', 'var(--bg-color-light)');
        root.style.setProperty('color', 'var(--text-color-light)');
    }
    
    localStorage.setItem('darkMode', isDark);
}

const savedDarkMode = localStorage.getItem('darkMode') === 'true';
setDarkMode(savedDarkMode);

document.addEventListener('DOMContentLoaded', function() {
    fetch('/widgets/app-bar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('app-bar-container').innerHTML = data;
            
            const hamburger = document.querySelector('.hamburger');
            const navLinks = document.querySelector('.nav-links');
            
            hamburger.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });

            const toggleButton = document.querySelector('#theme-toggle');
            toggleButton.checked = savedDarkMode;

            toggleButton.addEventListener('change', () => {
                const isDarkMode = toggleButton.checked;
                setDarkMode(isDarkMode);
            });
        });
});
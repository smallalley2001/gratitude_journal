if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker relative to the current location
        const swPath = './service-worker.js'; 
        navigator.serviceWorker.register(swPath)
            .then(() => console.log('✅ Service Worker registered:', swPath))
            .catch(err => console.error('❌ SW registration failed:', err));
    });
}

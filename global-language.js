// Global Language Initialization for RapidBlood
// This script ensures language persistence across all pages

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  function initializeGlobalLanguage() {
    // Check if LanguageManager exists
    if (typeof LanguageManager === 'undefined') {
      console.warn('LanguageManager not found, retrying in 100ms...');
      setTimeout(initializeGlobalLanguage, 100);
      return;
    }
    
    // Initialize language system
    LanguageManager.init();
    
    // Set current language in selector if it exists
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      const currentLang = LanguageManager.getCurrentLanguage();
      languageSelect.value = currentLang;
      console.log('Language selector updated to:', currentLang);
    }
    
    // Apply language to any dynamically loaded content
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if new nodes contain translatable content
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.querySelectorAll) { // Element node
              const translatableElements = node.querySelectorAll('[data-i18n]');
              if (translatableElements.length > 0) {
                console.log('New translatable content found, applying language...');
                LanguageManager.applyLanguage();
              }
            }
          });
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Force re-apply language after a short delay to catch any late-loaded content
    setTimeout(() => {
      console.log('Re-applying language after delay...');
      LanguageManager.applyLanguage();
    }, 500);
    
    console.log('Global language system initialized successfully');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalLanguage);
  } else {
    initializeGlobalLanguage();
  }
  
  // Also initialize when window loads (for any late content)
  window.addEventListener('load', function() {
    if (typeof LanguageManager !== 'undefined' && LanguageManager.isInitialized()) {
      console.log('Re-applying language after page load...');
      LanguageManager.applyLanguage();
    }
  });
  
  // Export for use in other scripts
  window.initializeGlobalLanguage = initializeGlobalLanguage;
  
  // Global function to force language refresh
  window.refreshLanguage = function() {
    if (typeof LanguageManager !== 'undefined') {
      console.log('Forcing language refresh...');
      LanguageManager.applyLanguage();
    }
  };
})();

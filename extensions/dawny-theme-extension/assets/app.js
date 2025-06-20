// Dawny Pro Theme Extension JavaScript
(function() {
  'use strict';
  
  // Dawny Pro 전역 객체
  window.DawnyPro = window.DawnyPro || {
    version: '1.0.0',
    initialized: false,
    
    init: function() {
      if (this.initialized) return;
      
      console.log('🎨 Dawny Pro Theme Extension initialized');
      this.setupEventListeners();
      this.initialized = true;
    },
    
    setupEventListeners: function() {
      // DOM 로드 완료 시 스타일 적용 확인
      document.addEventListener('DOMContentLoaded', function() {
        DawnyPro.checkStylesLoaded();
      });
      
      // 윈도우 로드 완료 시 최종 확인
      window.addEventListener('load', function() {
        DawnyPro.finalizeSetup();
      });
    },
    
    checkStylesLoaded: function() {
      const hasStyles = document.body.classList.contains('dawny-pro-loaded');
      if (hasStyles) {
        console.log('✅ Dawny Pro styles successfully applied');
      } else {
        console.warn('⚠️ Dawny Pro styles not detected');
      }
    },
    
    finalizeSetup: function() {
      // 스타일이 적용된 요소들에 추가 최적화
      const styledElements = document.querySelectorAll('.dawny-pro-loaded *');
      if (styledElements.length > 0) {
        console.log(`🎯 Dawny Pro enhanced ${styledElements.length} elements`);
      }
    },
    
    // 개발자 도구용 함수들
    getCurrentStyle: function() {
      const bodyClasses = document.body.classList;
      for (let className of bodyClasses) {
        if (className.startsWith('dawny-pro-') && className !== 'dawny-pro-loaded') {
          return className.replace('dawny-pro-', '');
        }
      }
      return 'none';
    },
    
    getStatus: function() {
      return {
        version: this.version,
        initialized: this.initialized,
        currentStyle: this.getCurrentStyle(),
        loaded: document.body.classList.contains('dawny-pro-loaded')
      };
    }
  };
  
  // 자동 초기화
  DawnyPro.init();
  
})();

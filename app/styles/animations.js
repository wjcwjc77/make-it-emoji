export const animations = `
  @keyframes scoreAppear {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fall {
    0% {
      top: -5%;
      transform: translateX(0) rotate(0deg);
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      top: 100%;
      transform: translateX(calc(100px - 200px * var(--random, 0.5))) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }
  
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes textGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`; 
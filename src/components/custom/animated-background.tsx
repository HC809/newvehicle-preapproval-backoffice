'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

declare global {
  interface Window {
    particlesJS: any;
  }
}

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Dynamically import particles.js script
    const loadParticlesScript = async () => {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.async = true;

      script.onload = () => {
        if (window.particlesJS && containerRef.current) {
          window.particlesJS('particles-js', {
            particles: {
              number: {
                value: 80,
                density: {
                  enable: true,
                  value_area: 800
                }
              },
              color: {
                value: '#ffde59' // Color amarillo para las partículas
              },
              shape: {
                type: 'circle',
                stroke: {
                  width: 0,
                  color: '#ffde59'
                },
                polygon: {
                  nb_sides: 5
                }
              },
              opacity: {
                value: 0.5, // Mayor opacidad para resaltar más el amarillo
                random: false,
                anim: {
                  enable: false
                }
              },
              size: {
                value: 3,
                random: true,
                anim: {
                  enable: false
                }
              },
              line_linked: {
                enable: true,
                distance: 150,
                color: '#ffde59', // Color amarillo para las líneas
                opacity: 0.3, // Aumentada opacidad para que se vean mejor
                width: 1
              },
              move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
              }
            },
            interactivity: {
              detect_on: 'canvas',
              events: {
                onhover: {
                  enable: true,
                  mode: 'grab'
                },
                onclick: {
                  enable: true,
                  mode: 'push'
                },
                resize: true
              },
              modes: {
                grab: {
                  distance: 140,
                  line_linked: {
                    opacity: 1
                  }
                },
                push: {
                  particles_nb: 4
                }
              }
            },
            retina_detect: true
          });
        }
      };

      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };

    loadParticlesScript();
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      id='particles-js'
      className='absolute inset-0'
    ></div>
  );
};

export default AnimatedBackground;

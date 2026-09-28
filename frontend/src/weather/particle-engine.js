/**
 * SAMVAYA Lightweight Atmospheric Particle Engine
 * Renders calm, non-distracting atmospheric effects on #atmosphericOverlayCanvas.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

export class AtmosphericParticleEngine {
  constructor(canvasId = 'atmosphericOverlayCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationFrameId = null;
    this.running = false;
    this.currentProfile = null;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setProfile(visualProfile, weatherState) {
    this.currentProfile = visualProfile;
    this.weatherState = weatherState;

    if (!visualProfile || visualProfile.particleDensity <= 0) {
      this.stop();
      return;
    }

    this.initParticles(visualProfile.particleType, visualProfile.particleDensity);
    if (!this.running) {
      this.start();
    }
  }

  initParticles(type, count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(type));
    }
  }

  createParticle(type) {
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;

    switch (type) {
      case 'rain':
      case 'rain_dense':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          length: type === 'rain_dense' ? 18 + Math.random() * 12 : 10 + Math.random() * 8,
          speedY: type === 'rain_dense' ? 14 + Math.random() * 8 : 8 + Math.random() * 6,
          speedX: -1.5,
          opacity: 0.25 + Math.random() * 0.35,
          color: 'rgba(93, 156, 191, '
        };

      case 'snow':
      case 'frost':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1.5 + Math.random() * 2.5,
          speedY: 0.8 + Math.random() * 1.2,
          speedX: Math.sin(Math.random() * Math.PI) * 0.5,
          opacity: 0.3 + Math.random() * 0.4
        };

      case 'sunbeam':
      case 'shimmer':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 2 + Math.random() * 4,
          speedY: -0.3 - Math.random() * 0.4,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: 0.15 + Math.random() * 0.25,
          pulse: Math.random() * Math.PI
        };

      case 'storm':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          length: 22 + Math.random() * 14,
          speedY: 18 + Math.random() * 10,
          speedX: -4.5 + (Math.random() - 0.5),
          opacity: 0.35 + Math.random() * 0.4,
          color: 'rgba(227, 120, 91, '
        };

      case 'wind':
      case 'haze':
      case 'fog':
      default:
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 20 + Math.random() * 40,
          speedX: 0.4 + Math.random() * 0.6,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: 0.04 + Math.random() * 0.06
        };
    }
  }

  start() {
    this.running = true;
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  animate() {
    if (!this.running) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const type = this.currentProfile?.particleType;

    for (const p of this.particles) {
      if (type === 'rain' || type === 'rain_dense' || type === 'storm') {
        ctx.strokeStyle = (p.color || 'rgba(148, 163, 184, ') + p.opacity + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
        ctx.stroke();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > h) { p.y = -p.length; p.x = Math.random() * w; }
        if (p.x < 0) { p.x = w; }
      } else if (type === 'snow' || type === 'frost') {
        ctx.fillStyle = `rgba(240, 245, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > h) { p.y = -p.radius; p.x = Math.random() * w; }
      } else if (type === 'sunbeam' || type === 'shimmer') {
        p.pulse += 0.02;
        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.fillStyle = `rgba(244, 168, 54, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) { p.y = h + p.radius; p.x = Math.random() * w; }
      } else {
        // Haze / Fog soft clouds
        ctx.fillStyle = `rgba(216, 209, 197, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > w + p.radius) { p.x = -p.radius; p.y = Math.random() * h; }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}

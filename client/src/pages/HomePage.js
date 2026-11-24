/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../utils/companyLogos';
import {
  FiArrowRight,
  FiCheck,
  FiSearch,
  FiShield,
  FiCpu,
  FiTrendingUp,
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiFileText,
  FiZap,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiSun,
  FiMoon,
  FiSmartphone,
  FiBriefcase,
  FiClock,
  FiCheckSquare,
  FiSliders,
  FiPieChart,
  FiGift,
  FiX,
  FiTag,
  FiAward
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { claimFreeTrial, getCurrentSubscription } from '../services/api';

/* ═════════════════════════════════════════════════════════════════
   🎪 LEGO THEME PARK & RUNNING ROLLER COASTER CANVAS COMPONENT
   Merged cleanly into the Hero background with interactive controls
   ═════════════════════════════════════════════════════════════════ */
const LegoThemeParkHeroCanvas = ({ mode, coasterSpeed, poppedCount, onPopBalloon }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);

  const generateTrack = (W, H) => {
    const controlPoints = [
      { x: 580, y: 290, type: 'station' },
      { x: 670, y: 280, type: 'lift_start' },
      { x: 790, y: 170, type: 'lift' },
      { x: 890, y: 80,  type: 'peak' },
      { x: 940, y: 85,  type: 'crest' },
      { x: 990, y: 220, type: 'big_drop' },
      { x: 1040, y: 300, type: 'valley' },
      { x: 980, y: 320, type: 'turn_right' },
      { x: 900, y: 260, type: 'turn' },
      { x: 830, y: 180, type: 'hill2' },
      { x: 760, y: 220, type: 'dip' },
      { x: 680, y: 150, type: 'high_trestle' },
      { x: 560, y: 110, type: 'sky_curve' },
      { x: 440, y: 130, type: 'loop_enter' },
      { x: 380, y: 210, type: 'left_turn' },
      { x: 440, y: 290, type: 'loop_exit' },
      { x: 510, y: 300, type: 'run_in' }
    ];

    const samples = [];
    const n = controlPoints.length;
    const stepsPerSeg = 30;

    for (let i = 0; i < n; i++) {
      const p0 = controlPoints[(i - 1 + n) % n];
      const p1 = controlPoints[i];
      const p2 = controlPoints[(i + 1) % n];
      const p3 = controlPoints[(i + 2) % n];

      for (let s = 0; s < stepsPerSeg; s++) {
        const t = s / stepsPerSeg;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );

        samples.push({ x, y });
      }
    }

    let totalLen = 0;
    const path = [];
    for (let i = 0; i < samples.length; i++) {
      const curr = samples[i];
      const next = samples[(i + 1) % samples.length];
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      path.push({ x: curr.x, y: curr.y, angle, distSoFar: totalLen });
      totalLen += dist;
    }

    return { path, totalLen };
  };

  const initState = () => {
    const W = 1200;
    const H = 480;
    const trackData = generateTrack(W, H);

    return {
      W,
      H,
      trackData,
      coasterDist: 200,
      coasterSpeedMultiplier: coasterSpeed || 1,
      ferrisAngle: 0,
      dropTowerY: 280,
      dropState: 'climbing',
      dropTimer: 0,
      clouds: [
        { x: 90,  y: 35, w: 100, speed: 0.2 },
        { x: 380, y: 25, w: 120, speed: 0.15 },
        { x: 720, y: 45, w: 90,  speed: 0.25 },
        { x: 980, y: 30, w: 110, speed: 0.18 },
      ],
      balloons: [
        { x: 260, y: 190, vy: -0.6, skill: 'React',  color: '#00B289', radius: 18, wobble: 0 },
        { x: 520, y: 220, vy: -0.5, skill: 'Python', color: '#1B2533', radius: 19, wobble: 1.2 },
        { x: 740, y: 240, vy: -0.7, skill: 'ML / AI',color: '#008C6B', radius: 18, wobble: 2.5 },
        { x: 920, y: 210, vy: -0.4, skill: 'Cloud',  color: '#EA4C89', radius: 17, wobble: 4.1 },
      ],
      minifigs: [
        { x: 120, dir: 1,  speed: 0.6, shirt: '#00B289', hat: '#1B2533', armAngle: 0, hasBalloon: true },
        { x: 240, dir: -1, speed: 0.5, shirt: '#1B2533', hat: '#00B289', armAngle: 1.5, hasBalloon: false },
        { x: 420, dir: 1,  speed: 0.7, shirt: '#008C6B', hat: '#1B2533', armAngle: 3.0, hasBalloon: true },
        { x: 610, dir: -1, speed: 0.5, shirt: '#EA4C89', hat: '#00B289', armAngle: 0.8, hasBalloon: false },
        { x: 800, dir: 1,  speed: 0.6, shirt: '#00B289', hat: '#1B2533', armAngle: 2.1, hasBalloon: false },
        { x: 960, dir: -1, speed: 0.4, shirt: '#1B2533', hat: '#EA4C89', armAngle: 4.0, hasBalloon: true },
      ],
      particles: [],
      fireworks: [],
      flagWave: 0,
      lightBlink: 0,
      mode: mode || 'day'
    };
  };

  useEffect(() => {
    stateRef.current = initState();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    const getTrackPoint = (distance) => {
      const { path, totalLen } = s.trackData;
      let d = (distance % totalLen + totalLen) % totalLen;
      let low = 0;
      let high = path.length - 1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (path[mid].distSoFar < d) low = mid + 1;
        else high = mid - 1;
      }
      const idx = Math.max(0, Math.min(path.length - 1, low));
      return path[idx];
    };

    const spawnParticles = (x, y, count = 16, colors = ['#00B289', '#008C6B', '#1B2533', '#EA4C89', '#FFD166']) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          w: 5 + Math.random() * 5,
          h: 4 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.2,
          life: 30 + Math.random() * 20
        });
      }
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      s.balloons.forEach((b) => {
        const dist = Math.hypot(clickX - b.x, clickY - b.y);
        if (dist <= b.radius + 12) {
          spawnParticles(b.x, b.y, 22);
          b.y = s.H + 40;
          b.x = 100 + Math.random() * (s.W - 200);
          if (onPopBalloon) onPopBalloon();
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    const loop = () => {
      const W = s.W;
      const H = s.H;
      const GROUND_Y = H - 55;
      s.flagWave += 0.08;
      s.lightBlink += 0.05;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      if (s.mode === 'night') {
        skyGrad.addColorStop(0, '#0F172A');
        skyGrad.addColorStop(0.5, '#1E293B');
        skyGrad.addColorStop(1, '#334155');
      } else if (s.mode === 'sunset') {
        skyGrad.addColorStop(0, '#FFF1EB');
        skyGrad.addColorStop(0.5, '#FDE2D8');
        skyGrad.addColorStop(1, '#F8FAFC');
      } else {
        skyGrad.addColorStop(0, '#FFFFFF');
        skyGrad.addColorStop(0.5, '#F7FAF9');
        skyGrad.addColorStop(1, '#EEF7F4');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      if (s.mode === 'night') {
        ctx.fillStyle = '#FFE6A7';
        ctx.beginPath();
        ctx.arc(980, 60, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(972, 54, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 30; i++) {
          const sx = (i * 137) % W;
          const sy = (i * 83) % 150;
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      s.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x + c.w < 0) c.x = W + 60;
        ctx.fillStyle = s.mode === 'night' ? 'rgba(255,255,255,0.06)' : 'rgba(0, 178, 137, 0.08)';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w / 2, 18, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x - c.w * 0.22, c.y + 4, c.w * 0.28, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(c.x + c.w * 0.22, c.y + 3, c.w * 0.3, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = s.mode === 'night' ? '#1E293B' : 'rgba(0, 178, 137, 0.07)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(80, GROUND_Y - 90);
      ctx.lineTo(180, GROUND_Y);
      ctx.lineTo(340, GROUND_Y - 120);
      ctx.lineTo(480, GROUND_Y);
      ctx.lineTo(620, GROUND_Y - 80);
      ctx.lineTo(760, GROUND_Y);
      ctx.lineTo(920, GROUND_Y - 140);
      ctx.lineTo(1040, GROUND_Y - 70);
      ctx.lineTo(W, GROUND_Y);
      ctx.fill();

      const { path } = s.trackData;

      ctx.strokeStyle = s.mode === 'night' ? '#334155' : 'rgba(27, 37, 51, 0.15)';
      ctx.lineWidth = 3;
      for (let i = 0; i < path.length; i += 18) {
        const pt = path[i];
        if (pt.y < GROUND_Y - 20) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y + 10);
          ctx.lineTo(pt.x, GROUND_Y);
          ctx.stroke();

          ctx.strokeStyle = s.mode === 'night' ? '#1E293B' : 'rgba(27, 37, 51, 0.08)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pt.x - 8, pt.y + 25);
          ctx.lineTo(pt.x + 8, pt.y + 45);
          ctx.moveTo(pt.x + 8, pt.y + 25);
          ctx.lineTo(pt.x - 8, pt.y + 45);
          ctx.stroke();
          ctx.lineWidth = 3;
        }
      }

      ctx.strokeStyle = s.mode === 'night' ? '#00B289' : '#1B2533';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        if (i === 0) ctx.moveTo(path[i].x, path[i].y + 4);
        else ctx.lineTo(path[i].x, path[i].y + 4);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = '#00B289';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        if (i === 0) ctx.moveTo(path[i].x, path[i].y);
        else ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#008C6B';
      for (let i = 0; i < path.length; i += 6) {
        const p = path[i];
        ctx.save();
        ctx.translate(p.x, p.y + 2);
        ctx.rotate(p.angle);
        ctx.fillRect(-2, -5, 4, 10);
        ctx.restore();
      }

      const headPt = getTrackPoint(s.coasterDist);
      const isClimbing = Math.sin(headPt.angle) < -0.15;
      const isDropping = Math.sin(headPt.angle) > 0.15;
      let targetSpeed = 2.4 * (s.coasterSpeedMultiplier || 1);
      if (isClimbing) targetSpeed *= 0.6;
      if (isDropping) targetSpeed *= 1.8;

      s.coasterDist += targetSpeed;

      const CAR_SPACING = 24;
      const CAR_COLORS = ['#00B289', '#1B2533', '#008C6B', '#EA4C89'];

      for (let c = 3; c >= 0; c--) {
        const carDist = s.coasterDist - c * CAR_SPACING;
        const pt = getTrackPoint(carDist);

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);

        ctx.fillStyle = CAR_COLORS[c % CAR_COLORS.length];
        ctx.beginPath();
        ctx.roundRect(-12, -14, 24, 12, [4, 4, 1, 1]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-6, -16, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(4, -16, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFE6A7';
        ctx.beginPath();
        ctx.arc(-2, -19, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, -20, 1.5, 1.5);

        ctx.fillStyle = c === 0 ? '#00B289' : '#1B2533';
        ctx.beginPath();
        ctx.arc(-2, -22, 5, Math.PI, Math.PI * 2);
        ctx.fill();

        if (c === 0) {
          ctx.fillStyle = '#FFE6A7';
          ctx.beginPath();
          ctx.arc(11, -8, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 230, 167, 0.25)';
          ctx.beginPath();
          ctx.moveTo(13, -8);
          ctx.lineTo(45, -18);
          ctx.lineTo(45, 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(-7, 0, 3, 0, Math.PI * 2);
        ctx.arc(7, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      const WHEEL_X = 170;
      const WHEEL_Y = 220;
      const WHEEL_R = 76;
      s.ferrisAngle += 0.008;

      ctx.strokeStyle = s.mode === 'night' ? '#475569' : '#1B2533';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(WHEEL_X, WHEEL_Y);
      ctx.lineTo(WHEEL_X - 44, GROUND_Y);
      ctx.moveTo(WHEEL_X, WHEEL_Y);
      ctx.lineTo(WHEEL_X + 44, GROUND_Y);
      ctx.stroke();

      ctx.strokeStyle = '#00B289';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_Y, WHEEL_R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#008C6B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_Y, WHEEL_R * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      const GONDOLA_COLORS = ['#00B289', '#1B2533', '#008C6B', '#EA4C89', '#3B82F6', '#10B981', '#6366F1', '#EC4899'];
      for (let i = 0; i < 8; i++) {
        const ang = s.ferrisAngle + (i * Math.PI) / 4;
        const gx = WHEEL_X + Math.cos(ang) * WHEEL_R;
        const gy = WHEEL_Y + Math.sin(ang) * WHEEL_R;

        ctx.strokeStyle = 'rgba(0, 178, 137, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(WHEEL_X, WHEEL_Y);
        ctx.lineTo(gx, gy);
        ctx.stroke();

        ctx.fillStyle = s.lightBlink % 2 > 1 ? '#00B289' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(gx, gy);
        ctx.strokeStyle = '#1B2533';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 8);
        ctx.stroke();

        ctx.fillStyle = GONDOLA_COLORS[i];
        ctx.beginPath();
        ctx.roundRect(-9, 8, 18, 12, [2, 2, 4, 4]);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 7, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFE6A7';
        ctx.beginPath();
        ctx.arc(0, 12, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.fillStyle = '#1B2533';
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_Y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00B289';
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_Y, 4, 0, Math.PI * 2);
      ctx.fill();

      const CASTLE_X = 350;
      const CASTLE_Y = 210;

      ctx.fillStyle = s.mode === 'night' ? '#1E293B' : '#E2E8F0';
      ctx.fillRect(CASTLE_X - 45, CASTLE_Y + 40, 90, GROUND_Y - (CASTLE_Y + 40));

      for (let i = 0; i < 5; i++) {
        ctx.fillRect(CASTLE_X - 45 + i * 18, CASTLE_Y + 32, 10, 8);
      }

      ctx.fillStyle = '#1B2533';
      ctx.beginPath();
      ctx.roundRect(CASTLE_X - 18, GROUND_Y - 50, 36, 50, [18, 18, 0, 0]);
      ctx.fill();

      [-40, 40].forEach((ox) => {
        const tx = CASTLE_X + ox;
        ctx.fillStyle = s.mode === 'night' ? '#334155' : '#CBD5E1';
        ctx.fillRect(tx - 12, CASTLE_Y, 24, 80);

        ctx.fillStyle = '#00B289';
        ctx.beginPath();
        ctx.moveTo(tx - 15, CASTLE_Y);
        ctx.lineTo(tx, CASTLE_Y - 32);
        ctx.lineTo(tx + 15, CASTLE_Y);
        ctx.closePath();
        ctx.fill();

        const wave = Math.sin(s.flagWave + ox) * 4;
        ctx.strokeStyle = '#1B2533';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, CASTLE_Y - 32);
        ctx.lineTo(tx, CASTLE_Y - 44);
        ctx.stroke();

        ctx.fillStyle = '#008C6B';
        ctx.beginPath();
        ctx.moveTo(tx, CASTLE_Y - 44);
        ctx.lineTo(tx + 14 + wave, CASTLE_Y - 38);
        ctx.lineTo(tx, CASTLE_Y - 32);
        ctx.closePath();
        ctx.fill();
      });

      ctx.fillStyle = '#1B2533';
      ctx.beginPath();
      ctx.roundRect(CASTLE_X - 65, CASTLE_Y + 15, 130, 20, 6);
      ctx.fill();
      ctx.strokeStyle = '#00B289';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎪 INTERNMATCH TECH PARK 🎢', CASTLE_X, CASTLE_Y + 28);

      const TOWER_X = 520;
      const TOWER_TOP_Y = 100;

      ctx.fillStyle = '#1B2533';
      ctx.fillRect(TOWER_X - 6, TOWER_TOP_Y, 12, GROUND_Y - TOWER_TOP_Y);

      for (let y = TOWER_TOP_Y + 10; y < GROUND_Y - 20; y += 18) {
        ctx.fillStyle = '#00B289';
        ctx.fillRect(TOWER_X - 5, y, 10, 8);
      }

      ctx.fillStyle = '#00B289';
      ctx.beginPath();
      ctx.arc(TOWER_X, TOWER_TOP_Y - 6, 7, 0, Math.PI * 2);
      ctx.fill();

      if (s.dropState === 'climbing') {
        s.dropTowerY -= 0.8;
        if (s.dropTowerY <= TOWER_TOP_Y + 25) {
          s.dropState = 'holding';
          s.dropTimer = 0;
        }
      } else if (s.dropState === 'holding') {
        s.dropTimer++;
        if (s.dropTimer > 45) {
          s.dropState = 'dropping';
        }
      } else if (s.dropState === 'dropping') {
        s.dropTowerY += 7.5;
        if (s.dropTowerY >= GROUND_Y - 35) {
          s.dropState = 'climbing';
          spawnParticles(TOWER_X, GROUND_Y - 25, 8);
        }
      }

      ctx.fillStyle = '#008C6B';
      ctx.beginPath();
      ctx.roundRect(TOWER_X - 18, s.dropTowerY, 36, 14, 4);
      ctx.fill();

      [-12, -4, 4, 12].forEach((offset) => {
        ctx.fillStyle = '#FFE6A7';
        ctx.beginPath();
        ctx.arc(TOWER_X + offset, s.dropTowerY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = s.mode === 'night' ? '#1E293B' : '#1B2533';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      ctx.fillStyle = '#00B289';
      ctx.fillRect(0, GROUND_Y, W, 5);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let gx = 10; gx < W; gx += 26) {
        ctx.beginPath();
        ctx.ellipse(gx, GROUND_Y + 3, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      s.minifigs.forEach((m) => {
        m.x += m.dir * m.speed;
        m.armAngle += 0.1;
        if (m.x < 30 || m.x > W - 30) m.dir *= -1;

        const my = GROUND_Y - 2;

        const legSwing = Math.sin(m.armAngle) * 5;
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(m.x - 3, my - 8);
        ctx.lineTo(m.x - 3 + legSwing, my);
        ctx.moveTo(m.x + 3, my - 8);
        ctx.lineTo(m.x + 3 - legSwing, my);
        ctx.stroke();

        ctx.fillStyle = m.shirt;
        ctx.beginPath();
        ctx.roundRect(m.x - 6, my - 20, 12, 12, 2);
        ctx.fill();

        ctx.fillStyle = '#FFE6A7';
        ctx.beginPath();
        ctx.arc(m.x, my - 25, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = m.hat;
        ctx.beginPath();
        ctx.ellipse(m.x, my - 28, 5, 2, 0, 0, Math.PI * 2);
        ctx.arc(m.x, my - 29, 3, Math.PI, Math.PI * 2);
        ctx.fill();

        if (m.hasBalloon) {
          ctx.strokeStyle = 'rgba(27,37,51,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(m.x + 5, my - 14);
          ctx.lineTo(m.x + 12, my - 38);
          ctx.stroke();

          ctx.fillStyle = m.shirt;
          ctx.beginPath();
          ctx.ellipse(m.x + 12, my - 44, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      s.balloons.forEach((b) => {
        b.y += b.vy;
        b.wobble += 0.04;
        const wx = b.x + Math.sin(b.wobble) * 8;

        if (b.y < -30) {
          b.y = GROUND_Y;
          b.x = 100 + Math.random() * (W - 200);
        }

        ctx.strokeStyle = 'rgba(27, 37, 51, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx, b.y + b.radius);
        ctx.quadraticCurveTo(wx + 4, b.y + b.radius + 15, wx - 2, b.y + b.radius + 28);
        ctx.stroke();

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(wx, b.y, b.radius, b.radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(wx - b.radius * 0.35, b.y - b.radius * 0.4, b.radius * 0.25, b.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(wx - 3, b.y + b.radius * 1.25);
        ctx.lineTo(wx + 3, b.y + b.radius * 1.25);
        ctx.lineTo(wx, b.y + b.radius * 1.25 + 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.skill, wx, b.y);
      });

      s.particles = s.particles.filter((p) => p.life > 0);
      s.particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.rot += p.vrot;
        p.life--;
      });
      ctx.globalAlpha = 1;

      s.fireworks = s.fireworks.filter((fw) => fw.progress < 1);
      s.fireworks.forEach((fw) => {
        fw.progress += 0.03;
        ctx.strokeStyle = fw.color;
        ctx.lineWidth = 2 * (1 - fw.progress);
        ctx.globalAlpha = 1 - fw.progress;
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, fw.progress * 45, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [mode, coasterSpeed]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={480}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'cover'
      }}
    />
  );
};

/* ═════════════════════════════════════════════════════════════════
   📱 HALO LAB STYLE INTERACTIVE MOBILE PHONE VIDEO CARD
   Features a person scrolling through phone & applying to internships
   ═════════════════════════════════════════════════════════════════ */
const MobilePhoneVideoCard = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState(new Set(['job-google']));
  const scrollContainerRef = useRef(null);

  const phoneJobs = [
    {
      id: 'job-google',
      company: 'Google',
      logo: 'G',
      logoBg: '#EA4335',
      title: 'Machine Learning & SWE Intern',
      score: 98,
      mode: 'Hybrid',
      location: 'Bangalore',
      stipend: '₹1,25,000/mo',
      skills: ['Python', 'TensorFlow', 'ML'],
      tag: '🔥 Top 1% Match'
    },
    {
      id: 'job-razorpay',
      company: 'Razorpay',
      logo: 'R',
      logoBg: '#0C2340',
      title: 'Frontend Engineering Intern',
      score: 94,
      mode: 'Remote',
      location: 'Bangalore',
      stipend: '₹60,000/mo',
      skills: ['React', 'TypeScript', 'Next.js'],
      tag: '⚡ Fast Track'
    },
    {
      id: 'job-cred',
      company: 'CRED',
      logo: 'C',
      logoBg: '#1B2533',
      title: 'High-Scale Backend Intern',
      score: 91,
      mode: 'Onsite',
      location: 'Bangalore',
      stipend: '₹80,000/mo',
      skills: ['Node.js', 'Redis', 'Docker'],
      tag: '🚀 Scaling Role'
    },
    {
      id: 'job-microsoft',
      company: 'Microsoft',
      logo: 'M',
      logoBg: '#00A4EF',
      title: 'AI Research Intern',
      score: 96,
      mode: 'Hybrid',
      location: 'Hyderabad',
      stipend: '₹1,10,000/mo',
      skills: ['PyTorch', 'NLP', 'Vector DBs'],
      tag: '🧠 AI Division'
    },
    {
      id: 'job-flipkart',
      company: 'Flipkart',
      logo: 'F',
      logoBg: '#2874F0',
      title: 'Data Science & Recommendation Intern',
      score: 89,
      mode: 'Remote',
      location: 'Bangalore',
      stipend: '₹75,000/mo',
      skills: ['Python', 'Scikit-Learn', 'SQL'],
      tag: '🛒 Ecommerce AI'
    },
    {
      id: 'job-zomato',
      company: 'Zomato',
      logo: 'Z',
      logoBg: '#E23744',
      title: 'Mobile Engineer (React Native)',
      score: 92,
      mode: 'Hybrid',
      location: 'Gurgaon',
      stipend: '₹65,000/mo',
      skills: ['React Native', 'Redux', 'APIs'],
      tag: '📱 Mobile Team'
    }
  ];

  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const step = (now) => {
      if (isPlaying && scrollContainerRef.current) {
        const delta = (now - lastTime) / 1000;
        const el = scrollContainerRef.current;
        const speedPx = 36 * speed;
        el.scrollTop += speedPx * delta;

        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 2) {
          el.scrollTop = 0;
        }
      }
      lastTime = now;
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const toggleApply = (id, e) => {
    e.stopPropagation();
    setAppliedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReset = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsPlaying(true);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '48px',
        alignItems: 'center',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FBFA 100%)',
        border: '1px solid #E5E7EB',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 48px -12px rgba(27, 37, 51, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 178, 137, 0.12) 0%, rgba(0, 178, 137, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Left Column: Halo Lab 3D Phone Mockup Container */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '-14px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '10px 16px',
            boxShadow: '0 12px 28px rgba(27, 37, 51, 0.12)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'floatBadge 4s ease-in-out infinite'
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E6F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B289', fontWeight: 800, fontSize: '0.9rem' }}>
            98%
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1B2533' }}>Top AI Vector Fit</div>
            <div style={{ fontSize: '0.72rem', color: '#008C6B', fontWeight: 600 }}>Google SWE Intern</div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '-14px',
            background: 'rgba(27, 37, 51, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            padding: '10px 16px',
            boxShadow: '0 14px 32px rgba(27, 37, 51, 0.25)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.85rem' }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>1-Click Applied</div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Razorpay • Tracked in Pipeline</div>
          </div>
        </div>

        <div
          style={{
            width: '295px',
            height: '590px',
            background: '#1B2533',
            borderRadius: '44px',
            padding: '10px',
            boxShadow: '0 25px 60px -12px rgba(27, 37, 51, 0.3), 0 0 0 1px #334155, inset 0 0 0 2px #475569',
            position: 'relative',
            userSelect: 'none'
          }}
        >
          <div style={{ position: 'absolute', left: '-13px', top: '110px', width: '3px', height: '26px', background: '#334155', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: '-13px', top: '148px', width: '3px', height: '46px', background: '#334155', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: '-13px', top: '204px', width: '3px', height: '46px', background: '#334155', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', right: '-13px', top: '150px', width: '3px', height: '60px', background: '#334155', borderRadius: '0 2px 2px 0' }} />

          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#F9FBFA',
              borderRadius: '35px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '84px',
                height: '22px',
                background: '#000000',
                borderRadius: '16px',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '6px'
              }}
            >
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#111827', border: '1px solid #1E293B' }} />
            </div>

            <div
              style={{
                height: '42px',
                padding: '10px 18px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#1B2533',
                background: '#FFFFFF',
                zIndex: 15
              }}
            >
              <span>9:41</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem' }}>5G</span>
                <span>●</span>
              </div>
            </div>

            <div
              style={{
                padding: '6px 14px 10px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                zIndex: 15
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '0.75rem', fontWeight: 800 }}>
                    IM
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1B2533', letterSpacing: '-0.3px' }}>
                    internmatch
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E6F7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', position: 'relative' }}>
                    <FiBell size={12} color="#008C6B" />
                    <span style={{ position: 'absolute', top: '1px', right: '1px', width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F9FBFA',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  fontSize: '0.72rem',
                  color: '#4D5C6D'
                }}
              >
                <FiSearch size={12} color="#00B289" />
                <span style={{ color: '#1B2533', fontWeight: 500 }}>Machine Learning, React, Python</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {['All', 'AI / ML', 'Backend', 'Frontend'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: 'none',
                      background: activeTab === tab ? '#00B289' : '#F0F2F5',
                      color: activeTab === tab ? '#FFFFFF' : '#4D5C6D',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                scrollBehavior: 'smooth',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: '120px',
                  left: '60%',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(0, 178, 137, 0.25)',
                  border: '2px solid #00B289',
                  pointerEvents: 'none',
                  zIndex: 25,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 12px rgba(0, 178, 137, 0.4)',
                  animation: isPlaying ? 'touchPulse 2s ease-in-out infinite' : 'none'
                }}
              />

              {phoneJobs.map((job) => {
                const isApplied = appliedJobs.has(job.id);
                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CompanyLogo organization={job.company} size={28} />
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1B2533', lineHeight: 1.2 }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#008C6B', fontWeight: 600 }}>
                            {job.company}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#E6F7F2',
                          color: '#008C6B',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          border: '1px solid #B3E8DC',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {job.score}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem', color: '#64748B', marginBottom: '6px' }}>
                      <span>📍 {job.location}</span>
                      <span>💼 {job.mode}</span>
                      <span style={{ fontWeight: 700, color: '#1B2533' }}>💰 {job.stipend}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {job.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: '#F0F2F5',
                            color: '#334155',
                            fontSize: '0.62rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>{job.tag}</span>
                      <button
                        type="button"
                        onClick={(e) => toggleApply(job.id, e)}
                        style={{
                          background: isApplied ? '#E6F7F2' : '#00B289',
                          color: isApplied ? '#008C6B' : '#FFFFFF',
                          border: isApplied ? '1px solid #00B289' : 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isApplied ? 'Applied ✓' : '1-Click Apply →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                height: '46px',
                background: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                fontSize: '0.62rem',
                color: '#64748B',
                fontWeight: 600,
                zIndex: 15
              }}
            >
              <div style={{ color: '#00B289', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <FiSearch size={14} />
                <span>Explore</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <FiCpu size={14} />
                <span>Matches</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <FiBriefcase size={14} />
                <span>Tracker</span>
              </div>
            </div>

            <div style={{ height: '14px', background: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '70px', height: '3px', background: '#CBD5E1', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: High-Converting Video Card Description & Controls */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#E6F7F2',
            color: '#008C6B',
            border: '1px solid #B3E8DC',
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}
        >
          <FiSmartphone size={14} />
          <span>Interactive Mobile Experience</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#1B2533', lineHeight: 1.2, marginBottom: '16px' }}>
          Search, Compare & Apply On The Go.
        </h2>

        <p style={{ fontSize: '1rem', color: '#4D5C6D', lineHeight: 1.6, marginBottom: '24px' }}>
          Experience the full power of Sentence Transformers cosine matching in the palm of your hand. Whether you're in the lecture hall, commuting, or reviewing opportunities late at night, InternMatch AI gives you an instantaneous, mobile-optimized job search.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <FiCheck size={16} strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B2533' }}>
                Instant 1-Click Fast Apply
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Parsed PDF resume vectors automatically pre-fill your qualifications for zero-friction submissions.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <FiCheck size={16} strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B2533' }}>
                Real-Time Skill Gap Visibility
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Inspect matching and missing libraries right on each mobile card before you hit apply.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <FiCheck size={16} strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B2533' }}>
                Sunday Cron Notification Alerts
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Get instant bell alerts whenever a newly scraped job crosses your personalized 60% match threshold.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#F0F2F5',
            borderRadius: '12px',
            padding: '14px 18px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#00B289',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 178, 137, 0.3)'
              }}
              title={isPlaying ? 'Pause Auto-Scroll' : 'Play Auto-Scroll'}
            >
              {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1B2533',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiRotateCcw size={12} />
              <span>Restart Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setSpeed(speed === 1 ? 2 : 1)}
              style={{
                background: speed > 1 ? '#1B2533' : '#FFFFFF',
                color: speed > 1 ? '#FFFFFF' : '#1B2533',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Speed: {speed}x
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#008C6B', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Interactive Live Simulation</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/internships"
            className="btn btn-primary"
            style={{
              padding: '12px 26px',
              borderRadius: '200px',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none'
            }}
          >
            <span>Explore Mobile Directory</span>
            <FiArrowRight size={16} />
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-outline"
            style={{
              padding: '12px 24px',
              borderRadius: '200px',
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none'
            }}
          >
            <span>View Application Tracker</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   Clean HelloBonsai Aesthetic with AI Internship Finder Core Identity
   ═════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const [parkMode, setParkMode] = useState('day');
  const [coasterSpeed, setCoasterSpeed] = useState(1);
  const [balloonsPopped, setBalloonsPopped] = useState(0);

  const [activeSkills, setActiveSkills] = useState(['React', 'Python', 'Machine Learning', 'Node.js']);
  const availableSkills = ['Docker', 'AWS', 'SQL', 'NLP', 'TypeScript', 'FastAPI'];

  const [openFaq, setOpenFaq] = useState(0);

  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialClaimed, setTrialClaimed] = useState(false);
  const [claimingTrial, setClaimingTrial] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  const [ribbonDismissed, setRibbonDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('internmatch_ribbon_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleDismissRibbon = () => {
    setRibbonDismissed(true);
    try {
      sessionStorage.setItem('internmatch_ribbon_dismissed', 'true');
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const claimed = localStorage.getItem('internmatch_trial_claimed') === 'true';
      const dismissed = localStorage.getItem('internmatch_trial_modal_dismissed');
      if (claimed) {
        setTrialClaimed(true);
      } else if (!dismissed) {
        const timer = setTimeout(() => {
          setShowTrialModal(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleClaimCampusTrial = async () => {
    setClaimingTrial(true);
    try {
      const res = await claimFreeTrial({
        name: 'Scholar',
        college: "Lingaya's Vidyapeeth"
      });
      if (res.data?.success) {
        setTrialClaimed(true);
        localStorage.setItem('internmatch_trial_claimed', 'true');
        setCelebrationText('🎉 1-Year Free Pro Trial Activated (365 Days Access)!');
        window.dispatchEvent(new Event('subscriptionUpdated'));
        setTimeout(() => setShowTrialModal(false), 2000);
      }
    } catch (err) {
      setTrialClaimed(true);
      localStorage.setItem('internmatch_trial_claimed', 'true');
      setCelebrationText('🎉 1-Year Free Pro Trial Activated!');
      setTimeout(() => setShowTrialModal(false), 2000);
    } finally {
      setClaimingTrial(false);
    }
  };

  const handleDismissTrialModal = () => {
    try {
      localStorage.setItem('internmatch_trial_modal_dismissed', Date.now().toString());
    } catch (e) {}
    setShowTrialModal(false);
  };

  const toggleSkill = (skill) => {
    if (activeSkills.includes(skill)) {
      setActiveSkills(activeSkills.filter((s) => s !== skill));
    } else {
      setActiveSkills([...activeSkills, skill]);
    }
  };

  const calculatedScore = Math.min(99, 68 + activeSkills.length * 4);

  const faqs = [
    {
      q: 'How does the Sentence Transformers AI vector matcher work?',
      a: 'Our Python AI microservice uses 384-dimensional dense semantic embeddings to map student profiles, resumes, and internship job descriptions into a shared vector space. By calculating mathematical cosine similarity, it identifies deep qualification matches beyond surface keyword matching.'
    },
    {
      q: 'Is this platform free for college students looking for internships?',
      a: 'Yes, 100% free. College students can create an account, upload their PDF resumes via the automated PyMuPDF parser, generate match scores, and track their application pipeline without any subscription or charge.'
    },
    {
      q: 'What happens during the automated Sunday 08:00 AM Cron scan?',
      a: 'The server executes an automated node-cron daemon every Sunday at 08:00 AM IST. It connects to verified hiring APIs and listings, cleans HTML tags, generates new similarity vectors, and dispatches in-app notification alerts whenever a job exceeds a 60% match threshold.'
    },
    {
      q: 'How does the 4-stage Application Pipeline work?',
      a: 'Students can track the entire lifecycle of each opportunity through four distinct stages: 1. Saved, 2. Applied, 3. Technical Interviewing, and 4. Offered. You can record personal interview notes and status dates in real-time.'
    }
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#1B2533', fontFamily: "'Inter', sans-serif" }}>

      {/* CAMPUS PRO TOP RIBBON */}
      {!ribbonDismissed && (
        <div
          className="announcement-ribbon"
          style={{
            background: trialClaimed
              ? 'linear-gradient(90deg, #008C6B 0%, #00B289 100%)'
              : 'linear-gradient(90deg, #1B2533 0%, #008C6B 100%)',
            color: '#FFFFFF',
            padding: '10px 44px 10px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'relative',
            zIndex: 90
          }}
        >
          <span>{trialClaimed ? '🟢 Career Pro Active:' : '🎁 Campus Launch Grant:'}</span>
          <span>
            {trialClaimed
              ? 'You are on the 1-Year Free Campus Trial (365 Days Access) · 8-Hour Background IMAP Tracking Enabled'
              : 'All university students get 1-Year Career Pro Free (Normally ₹499/yr) with 100% scholarship.'}
          </span>
          <Link
            to="/pricing"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#008C6B',
              padding: '3px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'none',
              marginLeft: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {trialClaimed ? 'View Plan Details →' : 'Claim ₹0 Trial →'}
          </Link>

          {/* Cancel / Dismiss Button */}
          <button
            type="button"
            onClick={handleDismissRibbon}
            aria-label="Dismiss banner"
            title="Dismiss announcement"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.22)',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: 0,
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          🎉 1-YEAR FREE CAMPUS TRIAL LAUNCH MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {showTrialModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(27, 37, 51, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={handleDismissTrialModal}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #00B289',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismissTrialModal}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <FiX size={16} />
            </button>

            {/* University Grant Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#008C6B',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}
            >
              <FiGift size={13} />
              <span>Campus Launch Initiative · 100% Free Grant</span>
            </div>

            {/* Title & Description */}
            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#1B2533',
                margin: '0 0 10px 0',
                lineHeight: 1.2
              }}
            >
              Unlock 1 Full Year of{' '}
              <span style={{ color: '#00B289', borderBottom: '3px solid #00E5A3' }}>
                Career Pro for Free
              </span>
            </h2>

            <p style={{ fontSize: '0.94rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 22px 0' }}>
              Welcome to InternMatch AI! In celebration of our university campus launch, all students receive complete 365-day access to automated email sync and AI career tools for ₹0.
            </p>

            {/* Price Callout Banner */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                  Student Special Rate
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#00B289' }}>₹0</span>
                  <span style={{ color: '#94A3B8', fontSize: '1rem', textDecoration: 'line-through', fontWeight: 600 }}>₹499/yr</span>
                  <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>for 1 Full Year</span>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 900
                }}
              >
                100% SCHOLARSHIP
              </div>
            </div>

            {/* What you get */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Included in Your 1-Year Free Access:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  '8-Hour Automated Gmail IMAP Sync',
                  'AI Scam & Fraud Shield',
                  'Unlimited 1-Click Auto-Applies',
                  'PyMuPDF Resume ATS Optimizer',
                  'Interview Calendar Scheduling',
                  'Verified Lingaya Scholar Badge'
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#00B289', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={10} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Celebration or Action Buttons */}
            {celebrationText ? (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#008C6B',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textAlign: 'center'
                }}
              >
                {celebrationText}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClaimCampusTrial}
                  disabled={claimingTrial}
                  style={{
                    width: '100%',
                    backgroundColor: '#00B289',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: claimingTrial ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 18px rgba(0, 178, 137, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FiZap size={18} />
                  <span>{claimingTrial ? 'Activating Free Pro...' : 'Claim 1-Year Free Pro Trial 🚀'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <Link
                    to="/pricing"
                    onClick={() => setShowTrialModal(false)}
                    style={{ fontSize: '0.84rem', color: '#008C6B', fontWeight: 700, textDecoration: 'none' }}
                  >
                    View All Plans &amp; Features →
                  </Link>
                  <button
                    type="button"
                    onClick={handleDismissTrialModal}
                    style={{ background: 'none', border: 'none', fontSize: '0.84rem', color: '#94A3B8', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          1. CO-BRANDED HERO WITH MERGED LEGO THEME PARK BACKGROUND
          ═════════════════════════════════════════════════════════════════ */}
      <section
        className="home-hero-section"
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '660px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: parkMode === 'night' ? '#0F172A' : '#FFFFFF',
          transition: 'background-color 0.4s ease'
        }}
      >
        <div
          className="lego-canvas-wrapper hide-on-mobile"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            opacity: parkMode === 'night' ? 0.9 : 0.82,
            pointerEvents: 'auto'
          }}
        >
          <LegoThemeParkHeroCanvas
            mode={parkMode}
            coasterSpeed={coasterSpeed}
            poppedCount={balloonsPopped}
            onPopBalloon={() => setBalloonsPopped((prev) => prev + 1)}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            background: parkMode === 'night'
              ? 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.7) 60%, rgba(15,23,42,0.92) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.84) 50%, rgba(255,255,255,0.95) 100%)',
            pointerEvents: 'none'
          }}
        />

        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '70px 24px 60px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: parkMode === 'night' ? 'rgba(0,178,137,0.2)' : '#E6F7F2',
              border: '1px solid #B3E8DC',
              borderRadius: '24px',
              padding: '6px 16px',
              marginBottom: '24px',
              boxShadow: '0 2px 6px rgba(0, 178, 137, 0.12)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B289' }}></span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#008C6B',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}
            >
              AI-Powered Career Intelligence for Engineering Students
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
              fontWeight: 800,
              color: parkMode === 'night' ? '#FFFFFF' : '#1B2533',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '20px',
              maxWidth: '880px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Discover Internships That Match Your <span style={{ color: '#00B289' }}>True Skills</span>.
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: parkMode === 'night' ? '#94A3B8' : '#4D5C6D',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 32px'
            }}
          >
            Eliminate manual portal scanning. Upload your PDF resume, calculate 384-dimensional cosine similarity vectors, uncover skill gaps, and receive automated weekly Sunday digests.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <Link
              to="/internships"
              className="btn btn-primary"
              style={{
                padding: '14px 30px',
                borderRadius: '200px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              <FiSearch size={18} />
              <span>Explore Internships</span>
              <FiArrowRight size={16} />
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-outline"
              style={{
                padding: '14px 28px',
                borderRadius: '200px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              <FiFileText size={18} />
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Upload Resume & Match'}</span>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '0.85rem',
              color: parkMode === 'night' ? '#CBD5E1' : '#4D5C6D',
              fontWeight: 500,
              marginBottom: '28px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCheck color="#00B289" strokeWidth={3} /> 100% Free for Students
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCheck color="#00B289" strokeWidth={3} /> Sentence Transformers Cosine AI
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCheck color="#00B289" strokeWidth={3} /> Automated Sunday Digests
            </span>
          </div>

          <div
            className="lego-controls-strip hide-on-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: parkMode === 'night' ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '30px',
              padding: '8px 18px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008C6B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎪</span> Live Lego Tech Park:
            </span>

            <button
              type="button"
              onClick={() => setCoasterSpeed((prev) => (prev > 1 ? 1 : 2.2))}
              style={{
                background: coasterSpeed > 1 ? '#00B289' : 'transparent',
                color: coasterSpeed > 1 ? '#FFFFFF' : '#1B2533',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiZap size={12} />
              <span>{coasterSpeed > 1 ? '🚀 Turbo Coaster (92 mph)' : 'Coaster Speed: 1x'}</span>
            </button>

            <button
              type="button"
              onClick={() => setParkMode((prev) => (prev === 'day' ? 'sunset' : prev === 'sunset' ? 'night' : 'day'))}
              style={{
                background: 'transparent',
                color: parkMode === 'night' ? '#FFE6A7' : '#1B2533',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {parkMode === 'night' ? <FiMoon size={12} /> : <FiSun size={12} />}
              <span style={{ textTransform: 'capitalize' }}>Sky: {parkMode}</span>
            </button>

            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              🎈 Balloons Popped: <strong>{balloonsPopped}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          2. CURATED TECH EMPLOYERS TICKER
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '36px 0', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FBFA' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8E98A4', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '18px' }}>
            Curated Internship Openings Across Leading Tech Ecosystems
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '36px',
              flexWrap: 'wrap',
              opacity: 0.75,
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#4D5C6D'
            }}
          >
            <span>Google</span>
            <span>•</span>
            <span>Microsoft</span>
            <span>•</span>
            <span>Amazon</span>
            <span>•</span>
            <span>Razorpay</span>
            <span>•</span>
            <span>CRED</span>
            <span>•</span>
            <span>Flipkart</span>
            <span>•</span>
            <span>Zomato</span>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          3. HALO LAB STYLE INTERACTIVE MOBILE PHONE VIDEO CARD
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
          <MobilePhoneVideoCard />
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          4. INTERACTIVE LIVE SKILL GAP SIMULATOR (Real-Time Cosine Score)
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#F9FBFA', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#008C6B', letterSpacing: '0.6px' }}>
              Interactive Feature Demo
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', marginTop: '6px', marginBottom: '10px' }}>
              Test Your Placement Readiness in Real-Time
            </h2>
            <p style={{ fontSize: '1rem', color: '#4D5C6D', maxWidth: '620px', margin: '0 auto' }}>
              Click skill tags to simulate adding competencies to your student vector profile and see how your cosine match score recalculates.
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 8px 30px rgba(27, 37, 51, 0.05)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2533', marginBottom: '12px' }}>
                Your Profile Skill Vector
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4D5C6D', marginBottom: '20px' }}>
                Select technologies currently on your resume:
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {[...activeSkills, ...availableSkills].map((skill) => {
                  const isSelected = activeSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '24px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isSelected ? '#00B289' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1B2533',
                        border: isSelected ? '1px solid #00B289' : '1px solid #E5E7EB',
                        boxShadow: isSelected ? '0 2px 8px rgba(0, 178, 137, 0.25)' : 'none'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#8E98A4' }}>
                💡 Sentence-BERT maps these skills to 384-dimensional dense vectors to calculate similarity against 100+ vetted job specifications.
              </div>
            </div>

            <div
              style={{
                background: '#F9FBFA',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8E98A4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Simulated Match Precision
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#00B289', lineHeight: 1.1, margin: '10px 0' }}>
                {calculatedScore}%
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: '#E6F7F2',
                  color: '#008C6B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  marginBottom: '16px'
                }}
              >
                {calculatedScore >= 90 ? '🌟 Tier-1 Elite Match' : calculatedScore >= 80 ? '⚡ Strong Match' : '📈 Moderate Match'}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#4D5C6D', marginBottom: '20px' }}>
                Strong candidate fit for roles at Google Bangalore, Razorpay Backend, and CRED Platform Engineering.
              </p>
              <Link
                to="/internships"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '200px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Browse Matching Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5. FOUR CORE ARCHITECTURAL PILLARS (Clean HelloBonsai Cards)
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#008C6B', letterSpacing: '0.6px' }}>
              Academic Capstone Architecture
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', marginTop: '6px' }}>
              Built From The Ground Up For Technical Accuracy
            </h2>
            <p style={{ fontSize: '1rem', color: '#4D5C6D', maxWidth: '640px', margin: '10px auto 0' }}>
              Engineered for Lingaya’s Vidyapeeth B.Tech CSE (AI) Capstone to solve inefficiencies in manual internship discovery.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Card 1: Tasks & Applications (matches Image 1: Tasks) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiCheckSquare size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                Tasks
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                Assign, estimate, and track internship applications and interview prep across companies.
              </p>
            </div>

            {/* Card 2: Automated Time / Alert Tracking (matches Image 1: Time tracking) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiClock size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                Time tracking
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                See where time is spent with automated Sunday cron scans and opportunity digests.
              </p>
            </div>

            {/* Card 3: Skill Gap & Match Metrics (matches Image 1: Budget tracking) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiTrendingUp size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                Skill tracking
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                Keep vector scores high and diagnose missing libraries with real-time match diagnostics.
              </p>
            </div>

            {/* Card 4: Resume Parsing & Documents (matches Image 1: Invoices) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiFileText size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                Resume parsing
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                Index qualifications faster with integrated PyMuPDF PDF extraction and auto-tagging.
              </p>
            </div>

            {/* Card 5: AI Semantic Matching (matches Image 1: Resourcing) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiSliders size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                AI matching
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                Map candidate competency vectors with 384-dimensional Sentence Transformers cosine similarity.
              </p>
            </div>

            {/* Card 6: Placement Analytics (matches Image 1: Reports) */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '36px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 37, 51, 0.06)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiPieChart size={24} color="#1B2533" strokeWidth={1.8} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                Reports
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.55 }}>
                Dive into each opportunity's performance, interview stages, and placement readiness data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          6. COMPARISON MATRIX: Traditional Portals vs InternMatch AI
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#F9FBFA', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#008C6B', letterSpacing: '0.6px' }}>
              Why We Built It
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', marginTop: '6px' }}>
              Traditional Job Portals vs InternMatch AI
            </h2>
          </div>

          <div
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.2fr 1.2fr',
                padding: '16px 24px',
                background: '#1B2533',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}
            >
              <div>Evaluation Criteria</div>
              <div style={{ color: '#94A3B8' }}>Traditional Portals</div>
              <div style={{ color: '#00B289' }}>InternMatch AI</div>
            </div>

            {[
              {
                feature: 'Search Technique',
                traditional: 'Exact Keyword Matching (Fragile)',
                ai: 'Sentence-BERT Cosine Embeddings (Semantic)'
              },
              {
                feature: 'Skill Gap Detection',
                traditional: 'None (Blind Application)',
                ai: 'Automated Intersection & Missing Skill Reports'
              },
              {
                feature: 'Weekly Notification Alerts',
                traditional: 'Generic Spam Marketing',
                ai: 'Automated Sunday 08:00 AM Cron Digest'
              },
              {
                feature: 'Student Resume Intake',
                traditional: 'Manual 15-minute form entry',
                ai: 'Automated PyMuPDF PDF Extraction'
              },
              {
                feature: 'Cost for Students',
                traditional: 'Premium Paywalls & Credits',
                ai: '100% Free & Open Academic Platform'
              }
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.2fr 1.2fr',
                  padding: '16px 24px',
                  borderTop: '1px solid #E5E7EB',
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FBFA',
                  fontSize: '0.88rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontWeight: 600, color: '#1B2533' }}>{row.feature}</div>
                <div style={{ color: '#6B7280' }}>✕ {row.traditional}</div>
                <div style={{ color: '#008C6B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheck color="#00B289" strokeWidth={3} /> {row.ai}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          7. VERIFIED STUDENT TESTIMONIALS
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#008C6B', letterSpacing: '0.6px' }}>
              Student Success Stories
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', marginTop: '6px' }}>
              Trusted by Engineering Candidates
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              {
                quote: 'The cosine similarity scores were shockingly accurate. I saw a 94% match on the Google internship, polished my Docker skills using the gap diagnostics, and landed the technical interview!',
                name: 'Aditya',
                role: 'B.Tech CSE (AI) Student',
                school: 'Lingaya’s Vidyapeeth'
              },
              {
                quote: 'The weekly automated Sunday digest discovered an AI startup opening that wasn’t even indexed on mainstream platforms. The PyMuPDF resume parsing saved me hours of retyping skills.',
                name: 'Priya Sharma',
                role: 'Full-Stack Engineering Intern',
                school: 'Placed at Bangalore Unicorn'
              },
              {
                quote: 'Managing recruitment stages across 8 companies was a nightmare until I used the Kanban pipeline tracker. Being able to see Saved, Applied, and Interview stages in one place gave me clarity.',
                name: 'Rohan Verma',
                role: 'Cloud Backend Candidate',
                school: 'B.Tech Class of 2026'
              }
            ].map((t, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', color: '#00B289', marginBottom: '14px' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} fill="#00B289" size={16} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#4D5C6D', lineHeight: 1.6, marginBottom: '20px' }}>
                    "{t.quote}"
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #F0F2F5', paddingTop: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1B2533' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8E98A4' }}>{t.role} • {t.school}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          8. INTERACTIVE FAQ ACCORDION
          ═════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#F9FBFA', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container" style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#008C6B', letterSpacing: '0.6px' }}>
              Common Questions
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', marginTop: '6px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    transition: 'all 0.2s'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      background: isOpen ? '#F9FBFA' : '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1B2533' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <FiChevronUp color="#00B289" /> : <FiChevronDown color="#8E98A4" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px', color: '#4D5C6D', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          9. PRE-FOOTER EMERALD CTA BANNER
          ═════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #00B289 0%, #008C6B 100%)',
          color: '#FFFFFF',
          padding: '70px 24px',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '14px', lineHeight: 1.2 }}>
            Ready to Accelerate Your Engineering Career?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.92, marginBottom: '32px', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 32px' }}>
            Join students from Lingaya’s Vidyapeeth and colleges nationwide. Find verified internships matched to your exact technical strengths today.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/internships"
              className="btn"
              style={{
                background: '#FFFFFF',
                color: '#008C6B',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 30px',
                borderRadius: '200px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
              }}
            >
              <span>Explore Internships Now</span>
              <FiArrowRight />
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn"
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '14px 28px',
                borderRadius: '200px',
                textDecoration: 'none'
              }}
            >
              <span>Upload PDF Resume</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

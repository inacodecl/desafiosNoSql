/* ═══════════════════════════════════════════════
   NoSQL Challenge — BDNE Unidad 3
   script.js
═══════════════════════════════════════════════ */

'use strict';

/* ── Navigation ── */
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tnav').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');

  if (btn) {
    btn.classList.add('active');
  } else {
    // find matching nav btn by data-page attribute
    const match = document.querySelector(`.tnav[data-page="${id}"]`);
    if (match) match.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Multiple Choice Activity ── */
const selectedAnswers = {};

const correctAnswers = {
  q1: 'necesitan suposiciones.',
  q2: 'no me dijeron que debía ordenar los resultados de mayor a menor.',
  q3: 'Usa $match con { precio: { $gt: 1000 } }, luego $group por "categoria" sumando "total", ordena con $sort de mayor a menor.'
};

function selectOpt(el, questionId) {
  // Deselect siblings
  el.closest('.mc-question')
    .querySelectorAll('.mc-opt')
    .forEach(o => o.classList.remove('selected', 'correct', 'wrong'));

  el.classList.add('selected');
  selectedAnswers[questionId] = el.textContent.trim();

  // Clear feedback when re-selecting
  const fb = document.getElementById('feedback-box');
  if (fb) {
    fb.className = 'feedback-box';
    fb.textContent = '';
  }
}

function checkAnswers() {
  const fb = document.getElementById('feedback-box');
  let totalQuestions = Object.keys(correctAnswers).length;
  let correctCount   = 0;

  ['q1', 'q2', 'q3'].forEach((qid, idx) => {
    const question = document.querySelectorAll('.mc-question')[idx];
    if (!question) return;

    question.querySelectorAll('.mc-opt').forEach(opt => {
      opt.classList.remove('correct', 'wrong');
      if (opt.classList.contains('selected')) {
        const isCorrect = opt.textContent.trim() === correctAnswers[qid];
        opt.classList.add(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) correctCount++;
      }
    });
  });

  const answered = Object.keys(selectedAnswers).length;

  if (!fb) return;

  if (answered < totalQuestions) {
    fb.className = 'feedback-box warning';
    fb.textContent = `⚠ Responde todas las preguntas antes de verificar. (${answered}/${totalQuestions} respondidas)`;
    return;
  }

  if (correctCount === totalQuestions) {
    fb.className = 'feedback-box success';
    fb.textContent = '✓ ¡Excelente! Todas las respuestas son correctas. +30 puntos obtenidos. ⭐⭐⭐';
    updateScore(30);
  } else {
    fb.className = 'feedback-box warning';
    fb.textContent = `Revisa tus respuestas. ${correctCount} de ${totalQuestions} correctas. Las incorrectas están marcadas en rojo.`;
  }
}

/* ── Score update (visual only) ── */
let currentScore = 220;

function updateScore(pts) {
  currentScore += pts;
  const scoreEl = document.querySelector('.top-score');
  if (scoreEl) {
    scoreEl.textContent = '';          // clear
    scoreEl.textContent = `${currentScore} pts`;
    scoreEl.style.transition = 'all .3s';
    scoreEl.style.background = 'rgba(16,185,129,.35)';
    setTimeout(() => {
      scoreEl.style.background = 'rgba(255,255,255,.1)';
    }, 1500);
  }
}

/* ── Mobile nav toggle ── */
function initMobileMenu() {
  const topNav = document.querySelector('.top-nav');
  if (!topNav) return;

  // On very small screens collapse nav to hamburger — handled via CSS visibility
  // For now just ensure buttons work correctly
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();

  // Restore score display
  const scoreEl = document.querySelector('.top-score');
  if (scoreEl) scoreEl.textContent = `${currentScore} pts`;
});

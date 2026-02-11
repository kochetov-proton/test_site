// Заполнение характеристик
const screenInfo = document.getElementById('screen-info');

// Перевод ориентации на русский
function getOrientationName() {
  if (!screen.orientation) return "Неизвестно";
  const type = screen.orientation.type;
  switch (type) {
    case "portrait-primary":    return "Вертикальная (основная)";
    case "portrait-secondary":  return "Вертикальная (перевёрнутая)";
    case "landscape-primary":   return "Горизонтальная (основная)";
    case "landscape-secondary": return "Горизонтальная (перевёрнутая)";
    default:                    return "Неизвестно";
  }
}

// Оценка частоты обновления через requestAnimationFrame
function estimateRefreshRate(callback) {
  let frames = 0;
  let startTime = null;
  let lastTime = null;
  let rafId;

  function tick(time) {
    if (startTime === null) startTime = time;
    if (lastTime !== null) {
      frames++;
    }
    lastTime = time;

    // Собираем данные ~2 секунды → достаточно точно
    if (time - startTime < 2000) {
      rafId = requestAnimationFrame(tick);
    } else {
      const duration = (time - startTime) / 1000; // в секундах
      const hz = Math.round(frames / duration);
      cancelAnimationFrame(rafId);
      callback(hz);
    }
  }

  rafId = requestAnimationFrame(tick);
}

// Запускаем оценку один раз при загрузке страницы
estimateRefreshRate((hz) => {
  const specs = [
    { name: "Разрешение",     value: `${screen.width} × ${screen.height}` },
    { name: "Глубина цвета",  value: `${screen.colorDepth} бит` },
    { name: "Частота обновления", value: `${hz} Гц` },
    { name: "Ориентация",     value: getOrientationName() }
  ];

  specs.forEach(spec => {
    const dt = document.createElement('dt');
    dt.textContent = spec.name + ':';
    const dd = document.createElement('dd');
    dd.textContent = spec.value;
    screenInfo.appendChild(dt);
    screenInfo.appendChild(dd);
  });
});

// ────────────────────────────────────────────────
// Тест экрана (без изменений)
// ────────────────────────────────────────────────

const testDiv = document.getElementById('fullscreen-test');
const mixed = document.getElementById('mixed-palette');
const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'];
let index = 0;

function showColor() {
  if (index < colors.length) {
    testDiv.style.backgroundColor = colors[index];
    mixed.style.display = 'none';
  } else {
    testDiv.style.backgroundColor = 'transparent';
    mixed.style.display = 'block';
  }
}

function startTest() {
  testDiv.style.display = 'block';
  index = 0;
  showColor();

  const elem = testDiv;
  if (elem.requestFullscreen)      elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.mozRequestFullScreen)    elem.mozRequestFullScreen();
  else if (elem.msRequestFullscreen)     elem.msRequestFullscreen();

  testDiv.addEventListener('click', nextStep);
}

function nextStep() {
  index++;
  if (index > colors.length) {
    exitFullscreen();
  } else {
    showColor();
  }
}

function exitFullscreen() {
  testDiv.removeEventListener('click', nextStep);

  if (document.exitFullscreen)       document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
  else if (document.msExitFullscreen)    document.msExitFullscreen();

  testDiv.style.display = 'none';
  mixed.style.display = 'none';
  index = 0;
}

document.getElementById('start-test').onclick = startTest;

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) exitFullscreen();
});
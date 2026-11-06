const canvas = document.getElementById("scene");
const context = canvas.getContext("2d");
const orbit = document.getElementById("orbit");
const yaw = document.getElementById("yaw");
const pitch = document.getElementById("pitch");
const wire = document.getElementById("wire");
const play = document.getElementById("play");
const radians = degrees => degrees * Math.PI / 180;
const width = canvas.width;
const height = canvas.height;
const stars = Array.from({ length: 125 }, (_, index) => ({
  x: (index * 467 + index ** 2 * 23) % width,
  y: (index * 263 + index ** 2 * 17) % height,
  alpha: 0.18 + (index % 8) * 0.078,
  radius: index % 11 ? 1 : 2,
}));
const faceVertices = [
  [0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3],
  [1, 2, 6, 5], [0, 1, 5, 4], [3, 7, 6, 2],
];
let animation = null;
let lastFrame = 0;
let animatedAngle = 0;

function rotateYaw([x, y, z], angle) {
  return [x * Math.cos(angle) + z * Math.sin(angle), y, z * Math.cos(angle) - x * Math.sin(angle)];
}

function rotatePitch([x, y, z], angle) {
  return [x, y * Math.cos(angle) - z * Math.sin(angle), z * Math.cos(angle) + y * Math.sin(angle)];
}

function cameraPoint(point) {
  return rotatePitch(rotateYaw(point, radians(Number(yaw.value))), radians(Number(pitch.value)));
}

function project([x, y, z]) {
  const scale = 830 / (11 - z);
  return [width / 2 + x * scale, height * 0.49 - y * scale];
}

function pathPosition(angle) {
  return [Math.cos(angle) * 3.15, 0.43 * Math.sin(angle * 2) + 0.3, Math.sin(angle) * 2.45];
}

function addBox(faces, center, size, colors, angle, position) {
  const signs = [[-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1], [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]];
  const points = signs.map(sign => {
    const local = center.map((value, axis) => value + size[axis] * sign[axis] / 2);
    const turned = rotateYaw(rotatePitch(local, 0.12), -angle + 0.15);
    return cameraPoint(turned.map((value, axis) => value + position[axis]));
  });
  faceVertices.forEach((indices, index) => {
    const corners = indices.map(vertex => points[vertex]);
    const points2d = corners.map(project);
    const [a, b, c] = points2d;
    const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (area >= 0 && !wire.checked) return;
    const depth = corners.reduce((sum, point) => sum + point[2], 0) / corners.length;
    faces.push({ points: points2d, depth, color: colors[index % colors.length] });
  });
}

function drawPath() {
  context.strokeStyle = "#82acbb";
  context.lineWidth = 1.5;
  context.setLineDash([5, 7]);
  context.beginPath();
  for (let degree = 0; degree <= 360; degree += 3) {
    const [x, y] = project(cameraPoint(pathPosition(radians(degree))));
    if (degree === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.setLineDash([]);
}

function drawSky() {
  context.fillStyle = "#102236";
  context.fillRect(0, 0, width, height);
  for (const star of stars) {
    context.fillStyle = `rgba(218, 234, 255, ${star.alpha})`;
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  }
  const planet = context.createRadialGradient(454, 513, 40, 540, 705, 420);
  planet.addColorStop(0, "#85a8b8");
  planet.addColorStop(0.67, "#48697f");
  planet.addColorStop(1, "#1c384d");
  context.fillStyle = planet;
  context.beginPath();
  context.arc(548, 899, 425, 0, Math.PI * 2);
  context.fill();
}

function render() {
  drawSky();
  drawPath();
  const angle = radians(Number(orbit.value));
  const position = pathPosition(angle);
  const metal = ["#5e8da0", "#cee6ed", "#89b7c1", "#406c86", "#6888a1", "#e4f1f0"];
  const panel = ["#386481", "#427f9a", "#244660", "#5a9caa", "#39788b", "#7db4c0"];
  const gold = ["#bd8853", "#fad68d", "#c68c46", "#926041", "#c09d57", "#ffebb1"];
  const faces = [];
  addBox(faces, [0, 0, 0], [0.92, 0.72, 1.04], metal, angle, position);
  addBox(faces, [0, 0.13, 0.64], [0.42, 0.38, 0.34], gold, angle, position);
  for (const side of [-1, 1]) {
    addBox(faces, [0.61 * side, 0, 0], [0.3, 0.14, 0.14], gold, angle, position);
    addBox(faces, [1.31 * side, 0, 0], [1.15, 0.11, 0.73], panel, angle, position);
    for (const offset of [0.94, 1.22, 1.50, 1.78]) {
      addBox(faces, [offset * side, 0.061, 0], [0.017, 0.012, 0.67], metal, angle, position);
    }
  }
  faces.sort((a, b) => a.depth - b.depth);
  for (const face of faces) {
    context.beginPath();
    face.points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.closePath();
    if (!wire.checked) {
      context.fillStyle = face.color;
      context.fill();
    }
    context.strokeStyle = wire.checked ? "#cceaf1" : "#254255";
    context.lineWidth = wire.checked ? 1 : 0.8;
    context.stroke();
  }
  for (const input of [orbit, yaw, pitch]) {
    document.getElementById(`${input.id}-value`).textContent = `${input.value}°`;
  }
}

function tick(time) {
  if (lastFrame) animatedAngle = (animatedAngle + Math.min(time - lastFrame, 100) * 0.026) % 360;
  orbit.value = Math.floor(animatedAngle);
  render();
  lastFrame = time;
  animation = requestAnimationFrame(tick);
}

function pause() {
  if (animation === null) return;
  cancelAnimationFrame(animation);
  animation = null;
  play.textContent = "Play";
  play.setAttribute("aria-pressed", "false");
}

play.addEventListener("click", () => {
  if (animation !== null) {
    pause();
    return;
  }
  animatedAngle = Number(orbit.value);
  lastFrame = 0;
  play.textContent = "Pause";
  play.setAttribute("aria-pressed", "true");
  animation = requestAnimationFrame(tick);
});

orbit.addEventListener("input", () => {
  pause();
  render();
});
for (const input of [yaw, pitch, wire]) input.addEventListener("input", render);
document.getElementById("reset").addEventListener("click", () => {
  pause();
  for (const input of [orbit, yaw, pitch]) input.value = input.defaultValue;
  wire.checked = false;
  render();
});
document.getElementById("save").addEventListener("click", () => {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "frame-depth-lab.png";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
render();

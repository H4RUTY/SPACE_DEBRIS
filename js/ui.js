import { CONFIG } from './config.js';

function getColorByProgress(progress) {
    if (progress <= 0.2) return CONFIG.colors.active;
    if (progress <= 0.4) return CONFIG.colors.tier1;
    if (progress <= 0.6) return CONFIG.colors.tier2;
    if (progress <= 0.8) return CONFIG.colors.tier3;
    return CONFIG.colors.tier4;
}

// === log ===
const logContainer = document.getElementById('log');
export function drawLog(logStr, logColor) {
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerText = logStr;
    logItem.style.color = logColor;

    logContainer.appendChild(logItem);

    setTimeout(() => {
        logContainer.removeChild(logItem);
    }, CONFIG.log.lifeTime);
}

// === gravity ===
const gravityIndicator = document.getElementById('gravity-indicator');
const gravityCtx = gravityIndicator.getContext('2d');
const gravityCenterX = gravityIndicator.width / 2;
const gravityCenterY = gravityIndicator.height / 2;

export function drawGravityIndicator(stickX, stickY) {
    gravityCtx.clearRect(0, 0, gravityIndicator.width, gravityIndicator.height);
    gravityCtx.strokeStyle = CONFIG.colors.tier1;
    gravityCtx.fillStyle = CONFIG.colors.tier1;

    gravityCtx.beginPath();
    gravityCtx.arc(gravityCenterX, gravityCenterY, 2, 0, Math.PI * 2);
    gravityCtx.fill();

    gravityCtx.beginPath();
    gravityCtx.moveTo(gravityCenterX, gravityCenterY);
    gravityCtx.lineTo(
        gravityCenterX + stickX * gravityIndicator.width,
        gravityCenterY + stickY * gravityIndicator.height
    );
    gravityCtx.closePath();
    gravityCtx.lineWidth = 2;
    gravityCtx.stroke();
}

// === cooltime ===
export function drawCoolTime(currentTime, lastUsedTime, coolTime, indicatorId) {
    const indicator = document.getElementById(indicatorId);
    const ctx = indicator.getContext('2d');
    const centerY = indicator.height / 2;

    ctx.clearRect(0, 0, indicator.width, indicator.height);

    const timePassed = currentTime - lastUsedTime;
    let progress = 1.0 - timePassed / coolTime;

    if (progress < 0.0) progress = 0.0;

    ctx.strokeStyle = getColorByProgress(progress);
    let length = progress * indicator.width;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(length, centerY);
    ctx.closePath();
    ctx.lineWidth = 8;
    ctx.stroke();
}

// === emoji ===
export function drawEmoji(emojiStr, count, indicatorId) {
    const indicator = document.getElementById(indicatorId);
    let indicatorStr = "";
    for (let i = 0; i < count; i++) {
        indicatorStr += `${emojiStr} `;
    }
    indicator.textContent= indicatorStr;
}

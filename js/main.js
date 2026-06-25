import { CONFIG } from './config.js';
import { createRagdoll } from './ragdoll.js';
import { getGamepad } from './input.js';
import {
    drawGravityIndicator,
    drawEmoji,
    drawLog,
    drawCoolTime
} from './ui.js';

// === physics engine setup ===
let engine = Matter.Engine.create({ enableSleeping: true });
engine.gravity.y = 0;
let world = engine.world;

let windowWidth  = window.innerWidth;
let windowHeight = window.innerHeight;

let render = Matter.Render.create({
    element: document.getElementById("game"),
    engine: engine,
    options: { width: windowWidth, height: windowHeight }
});

// === game variables ===
let isGameStarted = false;
let isGameOver = false;
let playerLives = 0;
let debrisDestructionCount = 0;
let astronaut = null;
let activeBarrier = null;
let activeGuardians = [];
let timeWarpDebrisData = [];
let debrisSpawnTimer = null;
let lastFrameTime = Date.now();

let camera = {
    x: 0,
    y: 0,
    deadZoneWidth: CONFIG.camera.deadZoneWidth,
    deadZoneHeight: CONFIG.camera.deadZoneHeight
};

const gameContainer = document.getElementById('game');
let runner = Matter.Runner.create();

const skills = {
    gun: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.gun,
        indicator: 'gun-indicator'
    },
    dash: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.dash,
        indicator: 'dash-indicator'
    },
    barrier: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.barrier,
        indicator: 'barrier-indicator'
    },
    guardian: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.guardian,
        indicator: 'guardian-indicator'
    },
    invisible: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.invisible,
        indicator: 'invisible-indicator'
    },
    dwarf: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.dwarf,
        indicator: 'dwarf-indicator'
    },
    sloMo: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.sloMo,
        indicator: 'slo-mo-indicator'
    },
    timeWarp: {
        lastUsedTime: 0,
        activeTimer: 0,
        config: CONFIG.timeWarp,
        indicator: 'timewarp-indicator'
    }
};

window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    render.options.width = windowWidth;
    render.options.height = windowHeight;
    render.canvas.width = windowWidth;
    render.canvas.height = windowHeight;
});

Matter.Render.run(render);

// === helper functions ===
function initGame() {
    Matter.Composite.clear(world, false);

    // reset variables
    playerLives = CONFIG.general.maxLives;
    debrisDestructionCount = 0;
    activeBarrier = null;
    activeGuardians = [];
    timeWarpDebrisData = [];
    engine.timing.timeScale = 1.0;

    // set camera
    camera.x = windowWidth / 2;
    camera.y = windowHeight / 2;

    // reset skill timers
    Object.keys(skills).forEach(key => {
        skills[key].lastUsedTime = 0;
        skills[key].activeTimer = 0;
    });

    // regenerate astronaut
    astronaut = createRagdoll(camera.x, camera.y, CONFIG.general.playerSize);
    Matter.Composite.add(world, astronaut);

    // initial UI
    drawGravityIndicator(0, 0);
    drawEmoji('❤️', playerLives, 'life-indicator');
    drawEmoji('🪨', debrisDestructionCount, 'dd-indicator');

    // restart debris timer
    if (debrisSpawnTimer) {
        clearTimeout(debrisSpawnTimer);
        debrisSpawnTimer = null;
    }
    scheduleNextDebris();
}

function startGame() {
    isGameStarted = true;
    isGameOver = false;
    lastFrameTime = Date.now();

    document.getElementById('start-screen').style.opacity = '0';
    document.getElementById('game-over').style.opacity = '0';

    drawLog("Game Started! Good Luck ;]", CONFIG.colors.tier1);
}

function canUseSkill(skill, currentTime) {
    const isCTEnd = currentTime - skill.lastUsedTime > skill.config.coolTime;
    return isCTEnd && (skill.activeTimer <= 0);
}

function updateSkillUI(skill, currentTime) {
    drawCoolTime(
        currentTime,
        skill.lastUsedTime,
        skill.config.coolTime,
        skill.indicator
    );
}

function updateAstronautInvisibility() {
    const isInvisible = skills.invisible.activeTimer > 0;
    astronaut.bodies.forEach(body => {
        body.render.opacity = isInvisible ? CONFIG.invisible.opacity : 1.0;
    });
}

function resizeAstronaut(scale) {
    const oldChest = astronaut.bodies[0];
    const currentVelocity = { x: oldChest.velocity.x, y: oldChest.velocity.y };
    const currentAngularVelocity = oldChest.angularVelocity;

    Matter.Composite.remove(world, astronaut);

    astronaut = createRagdoll(
        oldChest.position.x,
        oldChest.position.y,
        CONFIG.general.playerSize * scale
    );

    Matter.Body.setVelocity(astronaut.bodies[0], currentVelocity);
    Matter.Body.setAngularVelocity(astronaut.bodies[0], currentAngularVelocity);

    Matter.Composite.add(world, astronaut);

    updateAstronautInvisibility();
}

// === debris ===
function spawnDebris() {
    if (isGameOver || !isGameStarted) return;

    const minX = camera.x - windowWidth / 2;
    const maxX = camera.x + windowWidth / 2;
    const minY = camera.y - windowHeight / 2;
    const maxY = camera.y + windowHeight / 2;

    //     1
    //   +---+
    // 2 |   | 3
    //   +---+
    //     0
    const side = Math.floor(Math.random() * 4);

    let spawnX, spawnY;
    let targetX = camera.x + (Math.random() - 0.5) * 200;
    let targetY = camera.y + (Math.random() - 0.5) * 200;

    const offset = 100;

    switch (side) {
        case 0:
            spawnX = minX + Math.random() * windowWidth;
            spawnY = minY - offset;
            break;
        case 1:
            spawnX = minX + Math.random() * windowWidth;
            spawnY = maxY + offset;
            break;
        case 2:
            spawnX = minX - offset;
            spawnY = minY + Math.random() * windowHeight;
            break;
        case 3:
            spawnX = maxX + offset;
            spawnY = minY + Math.random() * windowHeight;
            break;
    }


    const { minSize, maxSize } = CONFIG.debris;
    const debriSize = Math.random() * (maxSize - minSize) + minSize;
    const debris = Matter.Bodies.rectangle(
        spawnX,
        spawnY,
        debriSize,
        debriSize,
        { label: 'debris', frictionAir: 0 }
    );

    const angle = Math.atan2(targetY - spawnY, targetX - spawnX);
    Matter.Body.setVelocity(debris, {
        x: Math.cos(angle) * CONFIG.debris.speed,
        y: Math.sin(angle) * CONFIG.debris.speed
    });

    Matter.Composite.add(world, debris);

    setTimeout(() => {
        if (Matter.Composite.allBodies(world).includes(debris)) {
            if (isGameStarted) Matter.Composite.remove(world, debris);
        }
    }, CONFIG.debris.lifeTime);
}


function getSpawnInterval() {
    const {
        initialSpawnInterval,
        deltaInterval,
        minSpawnInterval
    } = CONFIG.debris;

    return Math.max(
        initialSpawnInterval - debrisDestructionCount * deltaInterval,
        minSpawnInterval
    );
}

function scheduleNextDebris() {
    const interval = getSpawnInterval();
    console.log(`spawnInterval: ${interval} ms`);

    debrisSpawnTimer = setTimeout(() => {
        spawnDebris();
        scheduleNextDebris();
    }, interval);
}

// === collision detection event ===
Matter.Events.on(engine, 'collisionStart', (event) => {
    if (isGameOver || !isGameStarted) return;

    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const labelA = pair.bodyA.label;
        const labelB = pair.bodyB.label;

        // destructed debris
        const isDebrisHit = (label, target) => {
            const isTargetDebris = target === 'debris';
            const isValidLabel = ['bullet', 'barrier', 'guardian'].includes(label);

            return isTargetDebris && isValidLabel;
        };

        if (isDebrisHit(labelA, labelB) || isDebrisHit(labelB, labelA)) {
            const debrisBody = labelA === 'debris' ? pair.bodyA : pair.bodyB;
            const otherBody  = labelA === 'debris' ? pair.bodyB : pair.bodyA;

            Matter.Composite.remove(world, debrisBody);

            if (otherBody.label === 'bullet') {
                Matter.Composite.remove(world, otherBody);
            }

            debrisDestructionCount++;
            drawEmoji('🪨', debrisDestructionCount, 'dd-indicator');
            drawLog("Destructed Debris!", CONFIG.colors.tier1);
            continue;
        }

        // lose life
        if (labelA === 'debris' || labelB === 'debris') {
            const debrisBody = labelA === 'debris' ? pair.bodyA : pair.bodyB;
            const otherBody = labelA === 'debris' ? pair.bodyB : pair.bodyA;

            if (astronaut.bodies.includes(otherBody)) {
                if (skills.invisible.activeTimer > 0) continue;

                Matter.Composite.remove(world, debrisBody);
                playerLives--;
                drawEmoji('❤️', playerLives, 'life-indicator');
                drawLog("Hit!", CONFIG.colors.tier4);

                if (playerLives <= 0) triggerGameOver();
            }
        }
    }
});

// === handle gameover ===
function triggerGameOver() {
    isGameStarted = false;
    isGameOver = true;
    document.getElementById('game-over').style.opacity = '1';
    document.getElementById('score').textContent =
        `Your score: ${debrisDestructionCount} 🎉`;
}

// === handle reload ===
function reloadWindow() {
    if (performance.now() > CONFIG.general.allowReloadTime) {
        window.location.reload();
    }
}

initGame();
Matter.Runner.run(runner, engine);

// === main game loop ===
Matter.Events.on(engine, 'beforeUpdate', () => {
    const gamepad = getGamepad();
    if (!gamepad) return;

    // simply reload when BACK button was pressed
    if(gamepad.buttons[8].pressed) {
        reloadWindow();
        return;
    }

    if (isGameOver || !isGameStarted) {
        const startButton = gamepad.buttons[9];
        if (startButton.pressed) {
            initGame();
            startGame();
        }
        return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    Object.keys(skills).forEach(key => {
        const skill = skills[key];
        if (skill.activeTimer > 0) {
            skill.activeTimer -= deltaTime;

            // only when activeTimer became under 0 right now
            if (skill.activeTimer <= 0) {
                skill.activeTimer = 0;
                if (key === 'barrier' && activeBarrier) {
                    Matter.Composite.remove(world, activeBarrier);
                    activeBarrier = null;
                }
                else if (key === 'guardian' && activeGuardians.length > 0) {
                    Matter.Composite.remove(world, activeGuardians);
                    activeGuardians = [];
                }
                else if (key === 'invisible') {
                    updateAstronautInvisibility();
                }
                else if (key === 'dwarf') {
                    resizeAstronaut(1.0);
                }
                else if (key === 'sloMo') {
                    engine.timing.timeScale = 1.0;
                }
                else if (key === 'timeWarp') {
                    const currentBodies = Matter.Composite.allBodies(world);
                    timeWarpDebrisData.forEach(saved => {
                        const debris = currentBodies.find(b => b.id === saved.id);
                        if (debris) {
                            Matter.Body.setVelocity(
                                debris,
                                { x: saved.vx, y: saved.vy }
                            );
                            Matter.Body.setAngularVelocity(debris, saved.av);
                        }
                    });
                    timeWarpDebrisData = [];
                }
            }
        }
    });

    const threshold = CONFIG.gamepad.threshold;
    const chest = astronaut.bodies[0];

    // change gravity using left stick
    let leftStickX = gamepad.axes[0];
    let leftStickY = gamepad.axes[1];
    if (Math.abs(leftStickX) < threshold) leftStickX = 0;
    if (Math.abs(leftStickY) < threshold) leftStickY = 0;

    engine.gravity.x = leftStickX * CONFIG.physics.gravityUnit;
    engine.gravity.y = leftStickY * CONFIG.physics.gravityUnit;
    drawGravityIndicator(leftStickX, leftStickY);

    // move character using right stick
    let rightStickX = gamepad.axes[2];
    let rightStickY = gamepad.axes[3];
    if (Math.abs(rightStickX) < threshold) rightStickX = 0;
    if (Math.abs(rightStickY) < threshold) rightStickY = 0;

    const forceUnit = CONFIG.physics.forceUnitFactor * chest.mass;
    Matter.Body.applyForce(chest, chest.position, {
        x: rightStickX * forceUnit,
        y: rightStickY * forceUnit
    });

    const maxSpeed = CONFIG.physics.maxSpeed;
    let currV = chest.velocity;
    let speed = Math.sqrt(currV.x * currV.x + currV.y * currV.y);
    if (speed > maxSpeed) {
        Matter.Body.setVelocity(chest, {
            x: (currV.x / speed) * maxSpeed,
            y: (currV.y / speed) * maxSpeed
        });
    }

    // spin character
    const buttonCw = gamepad.buttons[11];
    const buttonCounterCw = gamepad.buttons[10];
    const spinSpeed = CONFIG.physics.spinSpeed;

    if (buttonCw && buttonCw.pressed) {
        Matter.Body.setAngularVelocity(chest, spinSpeed);
    }
    else if (buttonCounterCw && buttonCounterCw.pressed) {
        Matter.Body.setAngularVelocity(chest, -spinSpeed);
    }

    // shoot a gun
    const shootLeftButton = gamepad.buttons[6];
    const shootRightButton = gamepad.buttons[7];

    if (canUseSkill(skills.gun, currentTime)) {
        let targetArm = null;
        let isShooting = false;

        if (shootRightButton.pressed) {
            targetArm = astronaut.bodies[4]; // rightLowerArm
            isShooting = true;
        }
        else if (shootLeftButton.pressed) {
            targetArm = astronaut.bodies[2]; // leftLowerArm
            isShooting = true;
        }

        if (isShooting && targetArm) {
            const angle = targetArm.angle + Math.PI;
            const dirX = Math.sin(angle);
            const dirY = -Math.cos(angle);

            let bullet = Matter.Bodies.circle(
                targetArm.position.x + dirX,
                targetArm.position.y + dirY,
                CONFIG.gun.bulletRadius,
                {
                    frictionAir: 0,
                    density: CONFIG.gun.bulletDensity,
                    label: "bullet"
                }
            );

            Matter.Body.setVelocity(bullet, {
                x: dirX * CONFIG.gun.bulletSpeed,
                y: dirY * CONFIG.gun.bulletSpeed
            });

            Matter.Composite.add(world, bullet);
            skills.gun.lastUsedTime = currentTime;

            setTimeout(() => {
                Matter.Composite.remove(world, bullet);
            }, CONFIG.gun.bulletLifeTime);
        }
    }

    // dash
    const dashDown = gamepad.buttons[12];
    const dashUp = gamepad.buttons[13];
    const dashLeft = gamepad.buttons[14];
    const dashRight = gamepad.buttons[15];

    let dx = 0;
    let dy = 0;

    if (dashUp.pressed) dy = 1;
    else if (dashDown.pressed) dy = -1;

    if (dashRight.pressed) dx = 1;
    else if (dashLeft.pressed) dx = -1;

    if ((dx !== 0 || dy !== 0) && canUseSkill(skills.dash, currentTime)) {
        Matter.Body.setVelocity(chest, {
            x: dx * CONFIG.dash.velocityUnit,
            y: dy * CONFIG.dash.velocityUnit
        });
        skills.dash.lastUsedTime = currentTime;

        drawLog('You Dashed ;]', CONFIG.colors.fg);
    }

    // barrier
    const barrierButton = gamepad.buttons[3];
    if (barrierButton.pressed && canUseSkill(skills.barrier, currentTime)) {
        activeBarrier =
            Matter.Bodies.circle(
                chest.position.x,
                chest.position.y,
                CONFIG.barrier.radius * CONFIG.general.playerSize,
                { label: 'barrier', isSensor: true,}
            );

        Matter.Composite.add(world, activeBarrier);
        skills.barrier.lastUsedTime = currentTime;
        skills.barrier.activeTimer = CONFIG.barrier.duration;

        drawLog('Barrier!', CONFIG.colors.fg);
    }
    if (activeBarrier) {
        Matter.Body.setPosition(activeBarrier, {
            x: chest.position.x,
            y: chest.position.y
        });
        Matter.Body.setVelocity(activeBarrier, chest.velocity);
    }

    // guardian
    const guardianButton = gamepad.buttons[0];
    if (guardianButton.pressed && canUseSkill(skills.guardian, currentTime)) {
        for (let i = 0; i < CONFIG.guardian.count; i++) {
            const gCircle =
                Matter.Bodies.circle(
                    chest.position.x,
                    chest.position.y,
                    CONFIG.guardian.bladeRadius,
                    { label: 'guardian', isSensor: true}
                );

            activeGuardians.push(gCircle);
            Matter.Composite.add(world, gCircle);
        }
        skills.guardian.lastUsedTime = currentTime;
        skills.guardian.activeTimer = CONFIG.guardian.duration;

        drawLog('Guardian guards you', CONFIG.colors.fg);
    }

    if (activeGuardians.length > 0) {
        const dAngle = 2 * Math.PI / CONFIG.guardian.count;
        const baseAngle = currentTime * CONFIG.guardian.angularSpeedFactor;
        const orbitRadius = CONFIG.guardian.radius * CONFIG.general.playerSize;

        activeGuardians.forEach((gCircle, index) => {
            const angle = baseAngle + index * dAngle;

            Matter.Body.setPosition(gCircle, {
                x: chest.position.x + Math.cos(angle) * orbitRadius,
                y: chest.position.y + Math.sin(angle) * orbitRadius
            });
            Matter.Body.setVelocity(gCircle, chest.velocity);
        });
    }

    // invisible
    const invisibleButton = gamepad.buttons[1];
    if (invisibleButton.pressed && canUseSkill(skills.invisible, currentTime)) {
        skills.invisible.lastUsedTime = currentTime;
        skills.invisible.activeTimer = CONFIG.invisible.duration;
        updateAstronautInvisibility();

        drawLog('You are invisible man', CONFIG.colors.fg);
    }

    // be dwarf
    const dwarfButton = gamepad.buttons[2];
    if (dwarfButton.pressed && canUseSkill(skills.dwarf, currentTime)) {
        skills.dwarf.lastUsedTime = currentTime;
        skills.dwarf.activeTimer = CONFIG.dwarf.duration;
        resizeAstronaut(CONFIG.dwarf.scale);

        drawLog('Dwarf Mode :]', CONFIG.colors.fg);
    }

    // slo-mo
    const sloMoButton = gamepad.buttons[4];
    if (sloMoButton.pressed && canUseSkill(skills.sloMo, currentTime)) {
        engine.timing.timeScale = 0.1;
        skills.sloMo.lastUsedTime = currentTime;
        skills.sloMo.activeTimer = CONFIG.sloMo.duration;

        drawLog('Slo-mo ~~', CONFIG.colors.fg);
    }

    // time warp
    const timeWarpButton = gamepad.buttons[5];
    if (timeWarpButton.pressed && canUseSkill(skills.timeWarp, currentTime)) {
        const debris =
            Matter.Composite.allBodies(world).filter(b => b.label === 'debris');

        debris.forEach(debris => {
            timeWarpDebrisData.push({
                id: debris.id,
                vx: debris.velocity.x,
                vy: debris.velocity.y,
                av: debris.angularVelocity
            });

            // reverse velocity
            Matter.Body.setVelocity(
                debris,
                { x: -debris.velocity.x, y: -debris.velocity.y }
            );
            Matter.Body.setAngularVelocity(debris, -debris.angularVelocity);
        });

        skills.timeWarp.lastUsedTime = currentTime;
        skills.timeWarp.activeTimer = CONFIG.timeWarp.duration;
        drawLog('Time Warp!', CONFIG.colors.fg);
    }

    // update each ui
    Object.keys(skills).forEach(key => updateSkillUI(skills[key], currentTime));

    // camera following logic
    if (chest.position.x > camera.x + camera.deadZoneWidth / 2) {
        camera.x = chest.position.x - camera.deadZoneWidth / 2;
    }
    else if (chest.position.x < camera.x - camera.deadZoneWidth / 2) {
        camera.x = chest.position.x + camera.deadZoneWidth / 2;
    }

    if (chest.position.y > camera.y + camera.deadZoneHeight / 2) {
        camera.y = chest.position.y - camera.deadZoneHeight / 2;
    }
    else if (chest.position.y < camera.y - camera.deadZoneHeight / 2) {
        camera.y = chest.position.y + camera.deadZoneHeight / 2;
    }

    Matter.Render.lookAt(render, {
        min: { x: camera.x - windowWidth / 2, y: camera.y - windowHeight / 2 },
        max: { x: camera.x + windowWidth / 2, y: camera.y + windowHeight / 2 }
    });

    const scrollFactor = CONFIG.camera.scrollFactor;
    gameContainer.style.backgroundPosition =
        `${-camera.x * scrollFactor}px ${-camera.y * scrollFactor}px`;
});

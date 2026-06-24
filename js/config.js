export const CONFIG = {
    general: {
        allowReloadTime: 1000,
        maxLives: 3,
        playerSize: 0.5,
    },

    gamepad: {
        threshold: 0.1,
    },

    physics: {
        gravityUnit: 1,
        forceUnitFactor: 0.02,
        maxSpeed: 7,
        spinSpeed: 0.1,
    },

    gun: {
        coolTime: 300,
        bulletRadius: 5,
        bulletDensity: 0.01,
        bulletSpeed: 15,
        bulletLifeTime: 2000,
    },

    dash: {
        coolTime: 3000,
        velocityUnit: 90,
    },

    barrier: {
        radius: 200,
        coolTime: 10000,
        duration: 2000
    },

    guardian: {
        radius: 350,
        bladeRadius: 20,
        count: 5,
        angularSpeedFactor: 0.01,
        coolTime: 20000,
        duration: 5000
    },

    invisible: {
        opacity: 0.4,
        coolTime: 10000,
        duration: 5000
    },

    dwarf: {
        scale: 0.5,
        coolTime: 20000,
        duration: 10000
    },

    sloMo: {
        coolTime: 10000,
        duration: 2000
    },

    timeWarp: {
        coolTime: 5000,
        duration: 2000
    },

    camera: {
        deadZoneWidth: 200,
        deadZoneHeight: 200,
        scrollFactor: 0.5,
    },

    player: {
        maxLives: 3,
    },

    debris: {
        initialSpawnInterval: 600,
        deltaInterval: 30,
        minSpawnInterval: 50,
        minSize: 10,
        maxSize: 50,
        speed: 5,
        lifeTime: 6000,
    },

    colors: {
        fg: '#d8dee9',
        active: '#88c0d0',
        tier1: '#a3be8c',
        tier2: '#ebcb8b',
        tier3: '#d08770',
        tier4: '#bf616a',
    },

    log: {
        lifeTime: 3000,
    }
};

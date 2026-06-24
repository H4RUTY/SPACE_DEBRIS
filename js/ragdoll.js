// refer to https://github.com/liabru/matter-js/blob/master/examples/ragdoll.js
export const createRagdoll = (x, y, scale = 1, options = {}) => {
    const { Body, Bodies, Constraint, Composite } = Matter;

    const baseCollisionGroup = Body.nextGroup(true);

    const headOptions = {
        label: 'head',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale] },
        ...options
    };

    const chestOptions = {
        label: 'chest',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale] },
        ...options
    };

    const leftArmOptions = {
        label: 'left-arm',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const leftLowerArmOptions = { ...leftArmOptions };

    const rightArmOptions = {
        label: 'right-arm',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const rightLowerArmOptions = { ...rightArmOptions };

    const leftLegOptions = {
        label: 'left-leg',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const leftLowerLegOptions = { ...leftLegOptions };

    const rightLegOptions = {
        label: 'right-leg',
        collisionFilter: { group: baseCollisionGroup },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const rightLowerLegOptions = { ...rightLegOptions };

    const head = Bodies.rectangle(x, y - 60 * scale, 34 * scale, 40 * scale, headOptions);
    const chest = Bodies.rectangle(x, y, 55 * scale, 80 * scale, chestOptions);
    const rightUpperArm = Bodies.rectangle(x + 39 * scale, y - 15 * scale, 20 * scale, 40 * scale, rightArmOptions);
    const rightLowerArm = Bodies.rectangle(x + 39 * scale, y + 25 * scale, 20 * scale, 60 * scale, rightLowerArmOptions);
    const leftUpperArm = Bodies.rectangle(x - 39 * scale, y - 15 * scale, 20 * scale, 40 * scale, leftArmOptions);
    const leftLowerArm = Bodies.rectangle(x - 39 * scale, y + 25 * scale, 20 * scale, 60 * scale, leftLowerArmOptions);
    const leftUpperLeg = Bodies.rectangle(x - 20 * scale, y + 57 * scale, 20 * scale, 40 * scale, leftLegOptions);
    const leftLowerLeg = Bodies.rectangle(x - 20 * scale, y + 97 * scale, 20 * scale, 60 * scale, leftLowerLegOptions);
    const rightUpperLeg = Bodies.rectangle(x + 20 * scale, y + 57 * scale, 20 * scale, 40 * scale, rightLegOptions);
    const rightLowerLeg = Bodies.rectangle(x + 20 * scale, y + 97 * scale, 20 * scale, 60 * scale, rightLowerLegOptions);

    const chestToRightUpperArm = Constraint.create({
        bodyA: chest,
        bodyB: rightUpperArm,
        pointA: { x: 24 * scale, y: -23 * scale },
        pointB: { x: 0, y: -8 * scale },
        stiffness: 0.6,
    });

    const chestToLeftUpperArm = Constraint.create({
        bodyA: chest,
        bodyB: leftUpperArm,
        pointA: { x: -24 * scale, y: -23 * scale },
        pointB: { x: 0, y: -8 * scale },
        stiffness: 0.6,
    });

    const chestToLeftUpperLeg = Constraint.create({
        bodyA: chest,
        bodyB: leftUpperLeg,
        pointA: { x: -10 * scale, y: 30 * scale },
        pointB: { x: 0, y: -10 * scale },
        stiffness: 0.6,
    });

    const chestToRightUpperLeg = Constraint.create({
        bodyA: chest,
        bodyB: rightUpperLeg,
        pointA: { x: 10 * scale, y: 30 * scale },
        pointB: { x: 0, y: -10 * scale },
        stiffness: 0.6,
    });

    const upperToLowerRightArm = Constraint.create({
        bodyA: rightUpperArm,
        bodyB: rightLowerArm,
        pointA: { x: 0, y: 15 * scale },
        pointB: { x: 0, y: -25 * scale },
        stiffness: 0.6,
    });

    const upperToLowerLeftArm = Constraint.create({
        bodyA: leftUpperArm,
        bodyB: leftLowerArm,
        pointA: { x: 0, y: 15 * scale },
        pointB: { x: 0, y: -25 * scale },
        stiffness: 0.6,
    });

    const upperToLowerLeftLeg = Constraint.create({
        bodyA: leftUpperLeg,
        bodyB: leftLowerLeg,
        pointA: { x: 0, y: 20 * scale },
        pointB: { x: 0, y: -20 * scale },
        stiffness: 0.6,
    });

    const upperToLowerRightLeg = Constraint.create({
        bodyA: rightUpperLeg,
        bodyB: rightLowerLeg,
        pointA: { x: 0, y: 20 * scale },
        pointB: { x: 0, y: -20 * scale },
        stiffness: 0.6,
    });

    const headContraint = Constraint.create({
        bodyA: head,
        bodyB: chest,
        pointA: { x: 0, y: 25 * scale },
        pointB: { x: 0, y: -35 * scale },
        stiffness: 0.6,
    });

    const legToLeg = Constraint.create({
        bodyA: leftLowerLeg,
        bodyB: rightLowerLeg,
        stiffness: 0.01,
    });

    return Composite.create({
        bodies: [
            chest, head, leftLowerArm, leftUpperArm,
            rightLowerArm, rightUpperArm, leftLowerLeg,
            rightLowerLeg, leftUpperLeg, rightUpperLeg
        ],
        constraints: [
            upperToLowerLeftArm, upperToLowerRightArm, chestToLeftUpperArm,
            chestToRightUpperArm, headContraint, upperToLowerLeftLeg,
            upperToLowerRightLeg, chestToLeftUpperLeg, chestToRightUpperLeg,
            legToLeg
        ]
    });
};

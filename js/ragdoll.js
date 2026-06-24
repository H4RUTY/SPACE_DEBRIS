// refer to https://github.com/liabru/matter-js/blob/master/examples/ragdoll.js
export const createRagdoll = (x, y, scale = 1, options = {}) => {
    const { Body, Bodies, Constraint, Composite } = Matter;

    const headOptions = {
        label: 'head',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale] },
        ...options
    };

    const chestOptions = {
        label: 'chest',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale] },
        ...options
    };

    const leftArmOptions = {
        label: 'left-arm',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const leftLowerArmOptions = { ...leftArmOptions };

    const rightArmOptions = {
        label: 'right-arm',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const rightLowerArmOptions = { ...rightArmOptions };

    const leftLegOptions = {
        label: 'left-leg',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const leftLowerLegOptions = { ...leftLegOptions };

    const rightLegOptions = {
        label: 'right-leg',
        collisionFilter: { group: Body.nextGroup(true) },
        chamfer: { radius: 10 * scale },
        ...options
    };

    const rightLowerLegOptions = { ...rightLegOptions };

    const createPart = (dx, dy, w, h, options) => {
        return Bodies.rectangle(
            x + dx * scale,
            y + dy * scale,
            w * scale,
            h * scale,
            options
        );
    };

    const head          = createPart(  0, -60, 34, 40, headOptions);
    const chest         = createPart(  0,   0, 55, 80, chestOptions);
    const rightUpperArm = createPart( 39, -15, 20, 40, rightArmOptions);
    const rightLowerArm = createPart( 39,  25, 20, 60, rightLowerArmOptions);
    const leftUpperArm  = createPart(-39, -15, 20, 40, leftArmOptions);
    const leftLowerArm  = createPart(-39,  25, 20, 60, leftLowerArmOptions);
    const leftUpperLeg  = createPart(-20,  57, 20, 40, leftLegOptions);
    const leftLowerLeg  = createPart(-20,  97, 20, 60, leftLowerLegOptions);
    const rightUpperLeg = createPart( 20,  57, 20, 40, rightLegOptions);
    const rightLowerLeg = createPart( 20,  97, 20, 60, rightLowerLegOptions);

    const constraintRenderOption = { visible: false };

    const chestToRightUpperArm = Constraint.create({
        bodyA: chest,
        bodyB: rightUpperArm,
        pointA: { x: 24 * scale, y: -23 * scale },
        pointB: { x: 0, y: -8 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const chestToLeftUpperArm = Constraint.create({
        bodyA: chest,
        bodyB: leftUpperArm,
        pointA: { x: -24 * scale, y: -23 * scale },
        pointB: { x: 0, y: -8 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const chestToLeftUpperLeg = Constraint.create({
        bodyA: chest,
        bodyB: leftUpperLeg,
        pointA: { x: -10 * scale, y: 30 * scale },
        pointB: { x: 0, y: -10 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const chestToRightUpperLeg = Constraint.create({
        bodyA: chest,
        bodyB: rightUpperLeg,
        pointA: { x: 10 * scale, y: 30 * scale },
        pointB: { x: 0, y: -10 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const upperToLowerRightArm = Constraint.create({
        bodyA: rightUpperArm,
        bodyB: rightLowerArm,
        pointA: { x: 0, y: 15 * scale },
        pointB: { x: 0, y: -25 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const upperToLowerLeftArm = Constraint.create({
        bodyA: leftUpperArm,
        bodyB: leftLowerArm,
        pointA: { x: 0, y: 15 * scale },
        pointB: { x: 0, y: -25 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const upperToLowerLeftLeg = Constraint.create({
        bodyA: leftUpperLeg,
        bodyB: leftLowerLeg,
        pointA: { x: 0, y: 20 * scale },
        pointB: { x: 0, y: -20 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const upperToLowerRightLeg = Constraint.create({
        bodyA: rightUpperLeg,
        bodyB: rightLowerLeg,
        pointA: { x: 0, y: 20 * scale },
        pointB: { x: 0, y: -20 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const headContraint = Constraint.create({
        bodyA: head,
        bodyB: chest,
        pointA: { x: 0, y: 25 * scale },
        pointB: { x: 0, y: -35 * scale },
        stiffness: 0.6,
        render: constraintRenderOption
    });

    const legToLeg = Constraint.create({
        bodyA: leftLowerLeg,
        bodyB: rightLowerLeg,
        stiffness: 0.01,
        render: constraintRenderOption
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

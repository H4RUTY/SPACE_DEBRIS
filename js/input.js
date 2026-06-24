let activeGamepad = null;

window.addEventListener("gamepadconnected", (e) => {
    activeGamepad = e.gamepad;
    console.log(activeGamepad);
    console.log("gamepad connected");
});

window.addEventListener("gamepaddisconnected", () => {
    activeGamepad = null;
    console.log("gamepad disconnected");
});

export function getGamepad() {
    return navigator.getGamepads()[0] || activeGamepad;
}

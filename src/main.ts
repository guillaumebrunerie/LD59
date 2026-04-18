import "pixi.js/math-extras";
import { sound } from "@pixi/sound";

import { CreationEngine } from "./engine/engine";

import { setEngine } from "./getEngine";
import { LoadScreen } from "./app/loadScreen/LoadScreen";
import { userSettings } from "./app/utils/userSettings";
import { StartScreen } from "./app/startScreen/StartScreen";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";
import { GameScreen } from "./app/gameScreen/GameScreen";
import { MapScreen } from "./app/mapScreen/MapScreen";
// import "pixi.js/advanced-blend-modes";
// import "@esotericsoftware/spine-pixi-v8";
sound.disableAutoPause = true;

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
	// Initialize the creation engine instance
	await engine.init({
		background: "black",
		backgroundAlpha: 0,
		resizeOptions: { minWidth: 1080, minHeight: 1920 },
		// useBackBuffer: true,
	});

	// Initialize the user settings
	userSettings.init();

	// Show the load screen
	await engine.navigation.showScreen(LoadScreen);
	// Show the main screen once the load screen is dismissed
	await engine.navigation.showScreen(GameScreen);
})();

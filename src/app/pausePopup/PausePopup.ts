import { BlurFilter, Container, Graphics } from "pixi.js";

import { engine } from "../../getEngine";
import { Label } from "../ui/Label";
import { FancyButton } from "@pixi/ui";
import { SAVE_KEY } from "../mapScreen/city";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
	constructor() {
		super();

		// const width = 800;
		// const height = 300;
		// const x = 0;
		// const y = 0;

		const bg = this.addChild(
			new Graphics()
				.rect(-1920 / 2, -1920 / 2, 1920, 1920)
				.fill("#00000040"),
		);
		bg.cursor = "pointer";
		bg.interactive = true;
		bg.on("pointertap", () => engine().navigation.dismissPopup());

		const resumeButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: `Go back to the game`,
					style: {
						fontFamily: "Roboto",
						fill: "#DDD",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resumeButton.y = -75;
		resumeButton.on("pointertap", () => engine().navigation.dismissPopup());

		const resetButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: `Reset all progress`,
					style: {
						fontFamily: "Roboto",
						fill: "#D22",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resetButton.y = 150;
		resetButton.on("pointertap", () => {
			resetConfirmButton.visible = true;
		});

		const resetConfirmButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: `Confirm reset`,
					style: {
						fontFamily: "Roboto",
						fill: "#D00",
						fontWeight: "bold",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resetConfirmButton.visible = false;
		resetConfirmButton.y = 300;
		resetConfirmButton.on("pointertap", () => this.onReset());
	}

	onReset() {
		localStorage.removeItem(SAVE_KEY);
		window.location.reload();
	}

	/** Resize the popup, fired whenever window size changes */
	public resize(width: number, height: number) {
		this.x = width / 2;
		this.y = height / 2;
	}

	/** Present the popup, animated */
	public show() {
		const currentEngine = engine();
		if (currentEngine.navigation.currentScreen) {
			currentEngine.navigation.currentScreen.filters = [
				new BlurFilter({ strength: 3 }),
			];
		}
		// this.alpha = 0;
		// await animate<PausePopup>(
		// 	this,
		// 	{ alpha: 1 },
		// 	{ duration: 0.2, ease: "linear" },
		// );
	}

	/** Dismiss the popup, animated */
	public async hide() {
		const currentEngine = engine();
		if (currentEngine.navigation.currentScreen) {
			currentEngine.navigation.currentScreen.filters = [];
		}
		// await animate<PausePopup>(
		// 	this,
		// 	{ alpha: 0 },
		// 	{ duration: 0.2, ease: "linear" },
		// );
	}
}

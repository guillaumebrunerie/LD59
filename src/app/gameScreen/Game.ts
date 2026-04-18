import { type DestroyOptions, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { MapScreen } from "../mapScreen/MapScreen";
import { Device } from "./Device";
import { randomInt } from "../../engine/utils/random";

export const gameWidth = 1000;
export const gameHeight = 1000;

const randomBasicWaveData = () => ({
	baseline: randomInt(-2, 2),
	wave1: {
		amplitude: {
			base: randomInt(1, 10),
			amplitude: 0, //randomInt(0, 5),
			speed: 3, //randomInt(0, 5),
			phase: 0,
		},
		waves: {
			base: randomInt(1, 7),
			amplitude: 0,
			speed: 0,
			phase: 0,
		},
		speed: 0,
		phase: randomInt(0, 9),
	},
	wave2: {
		amplitude: {
			base: 0,
			amplitude: 0,
			speed: 0,
			phase: 0,
		},
		waves: {
			base: 0,
			amplitude: 0,
			speed: 0,
			phase: 0,
		},
		speed: 0,
		phase: 0,
	},
});

export class Game extends Container {
	ticker: Ticker;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addToTicker(this);

		const device = this.addChild(
			new Device({
				scale: 1.7,
				// angle: -2,
				targetWaveData: randomBasicWaveData(),
				initialWaveData: randomBasicWaveData(),
				onMatch: () => {
					device.reset({
						targetWaveData: randomBasicWaveData(),
						initialWaveData: randomBasicWaveData(),
					});
				},
			}),
		);
		this.addToTicker(device);

		const button = this.addChild(
			new Graphics().rect(-300, 700, 100, 100).fill("red"),
		);
		button.pivot = 50;
		button.interactive = true;
		button.on("pointerdown", () => {
			engine().navigation.showScreen(MapScreen);
		});
	}

	start() {
		this.ticker.start();
	}

	pause() {
		super.pause();
		this.ticker.stop();
	}

	resume() {
		super.resume();
		this.ticker.start();
	}

	destroy(options?: DestroyOptions) {
		this.ticker.destroy();
		super.destroy(options);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => {
			if (!this.destroyed) {
				this.ticker.remove(callback);
			}
		});
	}

	update() {}
}

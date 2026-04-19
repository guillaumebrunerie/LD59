import { type DestroyOptions, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { MapScreen } from "../mapScreen/MapScreen";
import { Device } from "./Device";
import { level1, level2 } from "./levels";
import { pickCombinedWaveData } from "./levelsUtils";

export const gameWidth = 1000;
export const gameHeight = 1000;

export class Game extends Container {
	ticker: Ticker;
	device?: Device;
	level = level1;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addToTicker(this);

		this.resetDevice();
	}

	resetDevice() {
		if (this.device) {
			this.device.destroy();
		}
		const device = this.addChild(
			new Device({
				scale: 1.7,
				// angle: -2,
				level: this.level,
				targetWaveData: pickCombinedWaveData(this.level),
				initialWaveData: pickCombinedWaveData(this.level),
				onMatch: () => {
					device.reset();
					this.resetDevice();
					engine().navigation.dismissPopup();
				},
			}),
		);
		this.device = device;
		this.addToTicker(this.device);
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

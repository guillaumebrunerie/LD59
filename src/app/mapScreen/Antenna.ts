import {
	Assets,
	Graphics,
	Sprite,
	Ticker,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";

const SHOCKWAVE_MAX_DISTANCE = 1000;
const SHOCKWAVE_SPEED = 0.1;

export class Antenna extends Container {
	antennaId: string;
	antenna: Sprite;
	shockwave: Graphics;
	shockwaveDistance = 0;
	isEmitting = true;

	constructor(options: ViewContainerOptions) {
		super(options);
		const antennaIds = [];
		for (let i = 1; i < 99; i++) {
			if (
				Assets.cache.has(`Antennas_${String(i).padStart(2, "0")}.png`)
			) {
				antennaIds.push(`Antennas_${String(i).padStart(2, "0")}.png`);
			}
		}
		this.antennaId =
			antennaIds[Math.floor(Math.random() * antennaIds.length)];
		this.antenna = this.addChild(
			new Sprite({
				texture: Assets.get(this.antennaId),
				anchor: 0.5,
			}),
		);
		this.shockwave = this.addChild(new Graphics());
		this.shockwaveDistance = Math.random() * SHOCKWAVE_MAX_DISTANCE;
	}

	update(ticker: Ticker) {
		if (!this.isEmitting) {
			return;
		}
		this.angle += ticker.deltaMS / 10;
		this.shockwaveDistance += ticker.deltaMS * SHOCKWAVE_SPEED;
		if (this.shockwaveDistance > SHOCKWAVE_MAX_DISTANCE) {
			this.shockwaveDistance = 0;
		}
		this.shockwave.clear();
		this.shockwave.circle(0, 0, this.shockwaveDistance).stroke({
			width: 2,
			color: 0xffffff,
			alpha: 1 - this.shockwaveDistance / SHOCKWAVE_MAX_DISTANCE,
		});
	}

	turnOff() {
		this.isEmitting = false;
		this.antenna.alpha = 0.5;
		this.shockwave.clear();
	}
}

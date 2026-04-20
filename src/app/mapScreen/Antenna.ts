import {
	AnimatedSprite,
	Assets,
	Sprite,
	Ticker,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { getIdleAnimation } from "../utils/animation";

export class Antenna extends Container {
	antennaId: string;
	antenna: Sprite;
	shadow: Sprite;
	shockwave: AnimatedSprite;
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
		this.addChild(
			new Sprite({
				texture: Assets.get(
					this.antennaId.replace("Antennas", "AntennasBase"),
				),
				y: -30,
				anchor: 0.5,
			}),
		);
		this.shadow = this.addChild(
			new Sprite({
				texture: Assets.get(
					this.antennaId.replace("Antennas", "AntennasShadow"),
				),
				y: -20,
				anchor: 0.5,
			}),
		);
		this.antenna = this.addChild(
			new Sprite({
				texture: Assets.get(this.antennaId),
				y: -30,
				anchor: 0.5,
			}),
		);
		this.antenna.angle = Math.random() * 360;
		this.shadow.angle = this.antenna.angle;

		this.shockwave = this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("RadioWave"),
				animationSpeed: 15 / 60,
				scale: 3,
				blendMode: "add",
				anchor: 0.5,
				autoPlay: true,
				y: -30,
			}),
		);
	}

	update(ticker: Ticker) {
		if (!this.isEmitting) {
			return;
		}
		this.antenna.angle += ticker.deltaMS / 30;
		this.shadow.angle += ticker.deltaMS / 30;
	}

	turnOff() {
		this.isEmitting = false;
		this.shockwave.destroy();
		this.antenna.texture = Assets.get(
			this.antennaId.replace("Antennas", "AntennasDead"),
		);
	}
}

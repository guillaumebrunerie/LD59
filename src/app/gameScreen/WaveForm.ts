import { Color, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";

type WaveData = {
	baseline: number;
	amplitude: number | WaveData;
	waves: number | WaveData;
	speed: number | WaveData;
	phaseShift: number;
};

const frequencyValue = (waves: number) => {
	return Math.sqrt((waves * 10) / (11 - waves));
};

const waveValue = (
	waveData: number | WaveData,
	u: number,
	t: number,
): number => {
	if (typeof waveData == "number") {
		return waveData;
	}
	const { baseline, amplitude, waves, speed, phaseShift } = waveData;

	const a = baseline / 5;
	const b = waveValue(amplitude, 0, t) / 5;
	const c = phaseShift;
	const d = 2 * Math.PI * frequencyValue(waveValue(waves, 0, t));
	const e = waveValue(speed, 0, t) * 2 * Math.PI;
	return a + b * Math.cos((u + c) * d - t * e);
};

const interpolate = <T extends string>(
	key: T,
	currentObject: Record<T, number>,
	targetObject: Record<T, number>,
	speed: number,
	dt: number,
) => {
	if (currentObject[key] < targetObject[key]) {
		currentObject[key] += dt * speed;
		currentObject[key] = Math.min(currentObject[key], targetObject[key]);
	}
	if (currentObject[key] > targetObject[key]) {
		currentObject[key] -= dt * speed;
		currentObject[key] = Math.max(currentObject[key], targetObject[key]);
	}
};

const STEPS = 100;

export class WaveForm extends Container {
	curve: Graphics;
	targetWaveData: WaveData;
	t = 0;

	constructor(
		public waveData: WaveData,
		public w: number,
		public h: number,
		public color: Color,
	) {
		super();
		this.curve = new Graphics();
		this.addChild(this.curve);
		this.targetWaveData = structuredClone(waveData);
		this.draw();
	}

	update(ticker: Ticker) {
		this.t += ticker.deltaMS / 1000;

		interpolate(
			"baseline",
			this.waveData,
			this.targetWaveData,
			3,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"amplitude",
			this.waveData,
			this.targetWaveData,
			3,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"waves",
			this.waveData,
			this.targetWaveData,
			3,
			ticker.deltaMS / 1000,
		);
		// interpolate(
		// 	"speed",
		// 	this.waveData,
		// 	this.targetWaveData,
		// 	8,
		// 	ticker.deltaMS / 1000,
		// );
		// interpolate(
		// 	"phaseShift",
		// 	this.waveData,
		// 	this.targetWaveData,
		// 	8,
		// 	ticker.deltaMS / 1000,
		// );

		this.draw();
	}

	draw() {
		this.curve.clear();
		for (let i = -STEPS; i <= STEPS; i++) {
			const u = i / STEPS;
			const x = u * this.w;
			const y = waveValue(this.waveData, u, this.t) * this.h;
			if (i == -STEPS) {
				this.curve.moveTo(x, y);
			} else {
				this.curve.lineTo(x, y);
			}
		}
		this.curve.stroke({ width: 10, color: this.color });
	}

	baselineChange(delta: number) {
		this.targetWaveData.baseline += delta;
		this.draw();
	}

	amplitudeChange(delta: number) {
		this.targetWaveData.amplitude += delta;
		this.draw();
	}

	wavesChange(delta: number) {
		this.targetWaveData.waves += delta;
		this.draw();
	}

	speedChange(delta: number) {
		this.waveData.speed += delta;
		this.waveData.phaseShift =
			Math.round(
				(this.waveData.phaseShift +
					(this.t * delta) / frequencyValue(this.waveData.waves)) *
					10,
			) / 10;
		this.draw();
	}
}

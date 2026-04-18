import { Color, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { mod } from "../utils/maths";

type WaveData = {
	baseline: number;
	amplitude: number | WaveData;
	waves: number | WaveData;
	speed: number | WaveData;
	phase: number;
};

const getFrequency = (waves: number) => {
	return Math.sqrt((waves * 10) / (11 - waves));
};

const waveValue = (waveData: number | WaveData, gt: number, u = 0): number => {
	if (typeof waveData == "number") {
		return waveData;
	}
	const { baseline, amplitude, waves, speed, phase } = waveData;

	const a = baseline / 5;
	const b = waveValue(amplitude, gt) / 5;
	const c = phase / 5;
	const d = getFrequency(waveValue(waves, gt)) * 2 * Math.PI;
	const e = waveValue(speed, gt) * 2 * Math.PI;
	return a + b * Math.cos(u * d + c * 2 * Math.PI - gt * e);
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

		const speed = 5;
		interpolate(
			"baseline",
			this.waveData,
			this.targetWaveData,
			speed,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"amplitude",
			this.waveData,
			this.targetWaveData,
			speed,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"waves",
			this.waveData,
			this.targetWaveData,
			speed,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"speed",
			this.waveData,
			this.targetWaveData,
			Infinity,
			ticker.deltaMS / 1000,
		);
		interpolate(
			"phase",
			this.waveData,
			this.targetWaveData,
			Infinity,
			ticker.deltaMS / 1000,
		);

		this.draw();
	}

	draw() {
		this.curve.clear();
		for (let i = -STEPS; i <= STEPS; i++) {
			const u = i / STEPS;
			const x = u * this.w;
			const y = waveValue(this.waveData, this.t, u) * this.h;
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
		const valueBefore =
			this.waveData.phase / 5 -
			this.t * waveValue(this.waveData.speed, this.t);
		this.targetWaveData.speed += delta;
		const newPhase =
			(valueBefore +
				this.t * waveValue(this.targetWaveData.speed, this.t)) *
			5;
		this.targetWaveData.phase = newPhase;
		this.draw();
	}
}

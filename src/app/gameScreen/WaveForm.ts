import { Color, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";

type BasicWaveData = {
	base: number;
	amplitude: number;
	speed: number;
	phase: number;
};

type WaveData = {
	amplitude: BasicWaveData;
	waves: BasicWaveData;
	speed: number;
	phase: number;
};

type CombinedWaveData = {
	baseline: number;
	wave1: WaveData;
	wave2: WaveData;
};

const getFrequency = (waves: number) => {
	return Math.sqrt((waves * 10) / (11 - waves));
};

const basicWaveValue = (
	{ base, amplitude, speed, phase }: BasicWaveData,
	t: number,
) => {
	return base + amplitude * Math.sin(t * speed + phase);
};

const waveValue = (
	{ amplitude, waves, speed, phase }: WaveData,
	gt: number,
	u = 0,
): number => {
	const b = basicWaveValue(amplitude, gt) / 5;
	const c = phase;
	const d = getFrequency(basicWaveValue(waves, gt)) * 2 * Math.PI;
	const e = speed * 2 * Math.PI;
	return b * Math.cos(u * d + c * 2 * Math.PI - gt * e);
};

const combinedWaveValue = (
	{ baseline, wave1, wave2 }: CombinedWaveData,
	gt: number,
	u = 0,
): number => {
	return -baseline / 5 + waveValue(wave1, gt, u) + waveValue(wave2, gt, u);
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

const interpolateBasicWaveData = (
	current: BasicWaveData,
	target: BasicWaveData,
	speed: number,
	dt: number,
) => {
	interpolate("base", current, target, speed, dt);
	interpolate("amplitude", current, target, speed, dt);
	interpolate("speed", current, target, Infinity, dt);
	interpolate("phase", current, target, Infinity, dt);
};

const interpolateWaveData = (
	current: WaveData,
	target: WaveData,
	speed: number,
	dt: number,
) => {
	interpolateBasicWaveData(current.amplitude, target.amplitude, speed, dt);
	interpolateBasicWaveData(current.waves, target.waves, speed, dt);
	interpolate("speed", current, target, Infinity, dt);
	interpolate("phase", current, target, Infinity, dt);
};

const interpolateCombinedWaveData = (
	current: CombinedWaveData,
	target: CombinedWaveData,
	speed: number,
	dt: number,
) => {
	interpolate("baseline", current, target, speed, dt);
	interpolateWaveData(current.wave1, target.wave1, speed, dt);
	interpolateWaveData(current.wave2, target.wave2, speed, dt);
};

const STEPS = 100;

export class WaveForm extends Container {
	curve: Graphics;
	targetWaveData: CombinedWaveData;
	t = 0;

	constructor(
		public waveData: CombinedWaveData,
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

		const speed = 8;
		interpolateCombinedWaveData(
			this.waveData,
			this.targetWaveData,
			speed,
			ticker.deltaMS / 1000,
		);
		this.draw();
	}

	draw() {
		this.curve.clear();
		for (let i = -STEPS; i <= STEPS; i++) {
			const u = i / STEPS;
			const x = u * this.w;
			const y = combinedWaveValue(this.waveData, this.t, u) * this.h;
			if (i == -STEPS) {
				this.curve.moveTo(x, y);
			} else {
				this.curve.lineTo(x, y);
			}
		}
		this.curve.stroke({ width: 10, color: this.color });
	}

	amplitudeSpeedChange1(delta: number) {
		this.targetWaveData.wave1.amplitude.speed += delta;
		this.targetWaveData.wave1.amplitude.phase -= this.t * delta;
	}

	amplitudeSpeedChange2(delta: number) {
		this.targetWaveData.wave2.amplitude.speed += delta;
		this.targetWaveData.wave2.amplitude.phase -= this.t * delta;
	}

	wavesSpeedChange1(delta: number) {
		this.targetWaveData.wave1.waves.speed += delta;
		this.targetWaveData.wave1.waves.phase -= this.t * delta;
	}

	wavesSpeedChange2(delta: number) {
		this.targetWaveData.wave2.waves.speed += delta;
		this.targetWaveData.wave2.waves.phase -= this.t * delta;
	}

	speedChange1(delta: number) {
		this.targetWaveData.wave1.speed += delta;
		this.targetWaveData.wave1.phase += this.t * delta;
	}
}

import { Color, Graphics, Ticker, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import type { Param } from "./Device";

type BasicWaveData = {
	base: number;
	amplitude: number;
	speed: number;
	phase: number;
};

type WaveData = {
	amplitude: BasicWaveData;
	waves: BasicWaveData; // Maybe should be number
	speed: number;
	phase: number;
};

export type CombinedWaveData = {
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
	const b = basicWaveValue(amplitude, gt) / 10;
	const c = phase;
	const d = getFrequency(basicWaveValue(waves, gt)) * 2 * Math.PI;
	const e = (speed / 2) * 2 * Math.PI;
	return b * Math.cos(u * d + c * 2 * Math.PI - gt * e);
};

const combinedWaveValue = (
	{ baseline, wave1, wave2 }: CombinedWaveData,
	gt: number,
	u = 0,
): number => {
	return -baseline / 10 + waveValue(wave1, gt, u) + waveValue(wave2, gt, u);
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

export class Waveform extends Container {
	curve: Graphics;
	waveData: CombinedWaveData;
	targetWaveData: CombinedWaveData;
	t = 0;
	w: number;
	h: number;
	color: Color;

	constructor(
		options: ViewContainerOptions & {
			waveData: CombinedWaveData;
			w: number;
			h: number;
			color: Color;
		},
	) {
		super(options);
		this.curve = new Graphics();
		this.addChild(this.curve);
		this.waveData = structuredClone(options.waveData);
		this.targetWaveData = structuredClone(options.waveData);
		this.w = options.w;
		this.h = options.h;
		this.color = options.color;
		this.draw();
	}

	updateSpeed = 8;
	update(ticker: Ticker) {
		this.t += ticker.deltaMS / 1000;

		interpolateCombinedWaveData(
			this.waveData,
			this.targetWaveData,
			this.updateSpeed,
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
		this.curve.stroke({ width: 5, color: this.color });
	}

	baselineParam: Param = {
		minValue: -5,
		maxValue: 5,
		get: () => this.targetWaveData.baseline,
		change: (delta: number, updateSpeed: number) => {
			this.updateSpeed = updateSpeed;
			this.targetWaveData.baseline += delta;
		},
	};

	amplitude1Param: Param = {
		minValue: 0,
		maxValue: 10,
		get: () => this.targetWaveData.wave1.amplitude.base,
		change: (delta: number, updateSpeed: number) => {
			this.updateSpeed = updateSpeed;
			this.targetWaveData.wave1.amplitude.base += delta;
		},
	};

	frequency1Param: Param = {
		minValue: 1,
		maxValue: 7,
		get: () => this.targetWaveData.wave1.waves.base,
		change: (delta: number, updateSpeed: number) => {
			this.updateSpeed = updateSpeed;
			this.targetWaveData.wave1.waves.base += delta;
		},
	};

	speed1Param: Param = {
		minValue: -5,
		maxValue: 5,
		get: () => this.targetWaveData.wave1.speed,
		change: (delta: number, updateSpeed: number) => {
			this.updateSpeed = updateSpeed;
			this.speedChange1(delta);
		},
	};

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
		this.targetWaveData.wave1.phase += (this.t * delta) / 2;
	}
}

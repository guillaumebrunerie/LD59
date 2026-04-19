import { Color, Graphics, Ticker, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import type { Param } from "./Device";
import { mod } from "../utils/maths";
import { assertReturn, type Level } from "./levelsUtils";

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
	return base + ((amplitude * base) / 5) * Math.sin(t * speed * 4 + phase);
};

const waveValue = (
	{ amplitude, waves, speed, phase }: WaveData,
	gt: number,
	u = 0,
): number => {
	const b = basicWaveValue(amplitude, gt) / 10;
	const c = phase / 10;
	const d = getFrequency(basicWaveValue(waves, gt));
	const e = getFrequency(basicWaveValue(waves, gt)) * (speed / 4);
	return b * Math.cos((u * d - gt * e - c) * 2 * Math.PI);
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
	if (speed < 10) {
		interpolate("phase", current, target, 5, dt);
	}
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

const basicWaveDataMatch = (
	wavedata1: BasicWaveData,
	wavedata2: BasicWaveData,
) => {
	return (
		wavedata1.base == wavedata2.base &&
		wavedata1.amplitude == wavedata2.amplitude &&
		wavedata1.speed == wavedata2.speed
	); // && mod(wavedata1.phase - wavedata2.phase, 10) == 0;
};

const waveDataMatch = (wavedata1: WaveData, wavedata2: WaveData) => {
	return (
		basicWaveDataMatch(wavedata1.amplitude, wavedata2.amplitude) &&
		basicWaveDataMatch(wavedata1.waves, wavedata2.waves) &&
		wavedata1.speed == wavedata2.speed &&
		mod(wavedata1.phase - wavedata2.phase, 10) == 0
	);
};

export const combinedWaveDataMatch = (
	waveform1: CombinedWaveData,
	waveform2: CombinedWaveData,
) => {
	return (
		waveform1.baseline == waveform2.baseline &&
		waveDataMatch(waveform1.wave1, waveform2.wave1) &&
		waveDataMatch(waveform1.wave2, waveform2.wave2)
	);
};

const STEPS = 300;

export class Waveform extends Container {
	curve: Graphics;
	waveData: CombinedWaveData;
	targetWaveData: CombinedWaveData;
	t = 0;
	w: number;
	h: number;
	color: Color;
	level: Level;

	constructor(
		options: ViewContainerOptions & {
			waveData: CombinedWaveData;
			w: number;
			h: number;
			color: Color;
			level: Level;
		},
	) {
		super(options);
		this.curve = new Graphics();
		this.addChild(this.curve);
		this.waveData = options.waveData;
		this.targetWaveData = structuredClone(options.waveData);
		this.w = options.w;
		this.h = options.h;
		this.color = options.color;
		this.level = options.level;
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

	baselineParam(): Param {
		return {
			range: assertReturn(this.level.waves.baseline),
			get: () => this.targetWaveData.baseline,
			set: (value: number, updateSpeed: number) => {
				this.updateSpeed = updateSpeed;
				this.targetWaveData.baseline = value;
			},
		};
	}

	amplitudeXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.waves[key]?.amplitude?.base),
			get: () => this.targetWaveData[key].amplitude.base,
			set: (value: number, updateSpeed: number) => {
				this.updateSpeed = updateSpeed;
				this.targetWaveData[key].amplitude.base = value;
			},
		};
	}

	frequencyXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.waves[key]?.waves?.base),
			get: () => this.targetWaveData[key].waves.base,
			set: (value: number, updateSpeed: number) => {
				this.updateSpeed = updateSpeed;
				const oldFrequency = getFrequency(
					this.targetWaveData[key].waves.base,
				);
				this.targetWaveData[key].waves.base = value;
				const newFrequency = getFrequency(
					this.targetWaveData[key].waves.base,
				);
				const delta = newFrequency - oldFrequency;
				this.waveData[key].phase -=
					this.t * delta * this.targetWaveData[key].speed * 2.5;
				this.targetWaveData[key].phase =
					Math.round(this.waveData[key].phase / 2) * 2;
			},
		};
	}

	phaseXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.waves[key]?.phase),
			get: () => mod(this.targetWaveData[key].phase, 10),
			set: (value: number, updateSpeed: number) => {
				this.updateSpeed = updateSpeed;
				this.targetWaveData[key].phase = value;
			},
		};
	}

	speedXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.waves[key]?.speed),
			get: () => this.targetWaveData[key].speed,
			set: (value: number, updateSpeed: number) => {
				this.updateSpeed = updateSpeed;
				const delta = value - this.targetWaveData[key].speed;
				this.targetWaveData[key].speed = value;
				this.waveData[key].phase -=
					this.t *
					delta *
					getFrequency(
						basicWaveValue(this.waveData[key].waves, this.t),
					) *
					2.5;
				this.targetWaveData[key].phase =
					Math.round(this.waveData[key].phase / 2) * 2;
			},
		};
	}

	// amplitudeMod1Param: Param = {
	// 	minValue: 0,
	// 	maxValue: 5,
	// 	get: () => this.targetWaveData.wave1.amplitude.amplitude,
	// 	set: (value: number, updateSpeed: number) => {
	// 		this.updateSpeed = updateSpeed;
	// 		this.targetWaveData.wave1.amplitude.amplitude = value;
	// 	},
	// };

	// amplitudeModFrequency1Param: Param = {
	// 	minValue: 0,
	// 	maxValue: 5,
	// 	get: () => this.targetWaveData.wave1.amplitude.speed,
	// 	set: (value: number, updateSpeed: number) => {
	// 		this.updateSpeed = updateSpeed;
	// 		const delta = value - this.targetWaveData.wave1.amplitude.speed;
	// 		this.targetWaveData.wave1.amplitude.speed = value;
	// 		this.targetWaveData.wave1.amplitude.phase -= this.t * delta * 4;
	// 	},
	// };
}

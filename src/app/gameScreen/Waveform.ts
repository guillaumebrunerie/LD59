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
	frequency: number;
	speed: number;
	offset: number;
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
	{ amplitude, frequency, speed, offset, phase }: WaveData,
	gt: number,
	u = 0,
): number => {
	const b = basicWaveValue(amplitude, gt) / 10;
	const c = (offset + phase) / 10;
	const d = getFrequency(frequency);
	const e = getFrequency(frequency) * (speed / 4);
	return b * Math.cos((u * d - gt * e - c) * 2 * Math.PI);
};

const combinedWaveValue = (
	{ baseline, wave1, wave2 }: CombinedWaveData,
	gt: number,
	u = 0,
): number => {
	return -baseline / 10 + waveValue(wave1, gt, u) + waveValue(wave2, gt, u);
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
		wavedata1.frequency == wavedata2.frequency &&
		wavedata1.speed == wavedata2.speed &&
		mod(
			wavedata1.offset +
				wavedata1.phase -
				wavedata2.offset -
				wavedata2.phase,
			10,
		) == 0
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

const STEPS = 100;

export class Waveform extends Container {
	curve: Graphics;
	waveData: CombinedWaveData;
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
		this.w = options.w;
		this.h = options.h;
		this.color = options.color;
		this.level = options.level;
		this.draw();
		// this.filters = [new PixelateFilter(20)];
	}

	updateSpeed = 8;
	update(ticker: Ticker) {
		const dt = ticker.deltaMS / 1000;
		this.t += dt;

		const speed = 5;
		const snapPhase = (phase: number) => {
			const target = Math.round(phase / 2) * 2;
			let value = phase;
			if (value < target) {
				value += dt * speed;
				value = Math.min(value, target);
			}
			if (value > target) {
				value -= dt * speed;
				value = Math.max(value, target);
			}
			return value;
		};
		this.waveData.wave1.phase = snapPhase(this.waveData.wave1.phase);
		this.waveData.wave2.phase = snapPhase(this.waveData.wave2.phase);

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
		this.curve.stroke({ width: 4, color: this.color, join: "round" });
	}

	baselineParam(): Param {
		return {
			range: assertReturn(this.level.ranges.baseline),
			get: () => this.waveData.baseline,
			set: (value: number) => {
				this.waveData.baseline = value;
			},
		};
	}

	amplitudeXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.ranges[key]?.amplitude?.base),
			get: () => this.waveData[key].amplitude.base,
			set: (value: number) => {
				this.waveData[key].amplitude.base = value;
			},
		};
	}

	modulationXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(
				this.level.ranges[key]?.amplitude?.modulationStrength,
			),
			get: () => this.waveData[key].amplitude.amplitude,
			set: (value: number) => {
				this.waveData[key].amplitude.amplitude = value;
			},
		};
	}

	frequencyXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.ranges[key]?.frequency),
			get: () => this.waveData[key].frequency,
			set: (value: number) => {
				const oldFrequency = getFrequency(this.waveData[key].frequency);
				this.waveData[key].frequency = value;
				const newFrequency = getFrequency(this.waveData[key].frequency);
				const delta = newFrequency - oldFrequency;
				this.waveData[key].phase -=
					this.t * delta * this.waveData[key].speed * 2.5;
			},
		};
	}

	offsetXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.ranges[key]?.offset),
			get: () => mod(this.waveData[key].offset, 10),
			set: (value: number) => {
				this.waveData[key].offset = value;
			},
		};
	}

	speedXParam(key: "wave1" | "wave2"): Param {
		return {
			range: assertReturn(this.level.ranges[key]?.speed),
			get: () => this.waveData[key].speed,
			set: (value: number) => {
				const delta = value - this.waveData[key].speed;
				this.waveData[key].speed = value;
				this.waveData[key].phase -=
					this.t *
					delta *
					getFrequency(this.waveData[key].frequency) *
					2.5;
				// this.targetWaveData[key].phase =
				// 	Math.round(this.waveData[key].phase / 2) * 2;
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

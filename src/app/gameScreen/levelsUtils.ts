import type { CombinedWaveData } from "./Waveform";

export type Range = {
	min: number;
	max: number;
	step?: number;
};

export type KnobType = {
	type: "vertical-slider" | "horizontal-slider" | "knob";
	x: number;
	y: number;
	param:
		| "baseline"
		| "amplitude1"
		| "frequency1"
		| "speed1"
		| "phase1"
		| "amplitude2"
		| "frequency2"
		| "speed2"
		| "phase2";
};

export type Level = {
	waves: {
		baseline?: Range;
		wave1?: {
			amplitude?: {
				base?: Range;
			};
			waves?: {
				base?: Range;
			};
			speed?: Range;
			phase?: Range;
		};
		wave2?: {
			amplitude?: {
				base?: Range;
			};
			waves?: {
				base?: Range;
			};
			speed?: Range;
			phase?: Range;
		};
	};
	condition: (waveData: CombinedWaveData) => boolean;
	device: KnobType[];
};

const zeroWaveData = (): CombinedWaveData => ({
	baseline: 0,
	wave1: {
		amplitude: {
			base: 0,
			amplitude: 0,
			speed: 1,
			phase: 0,
		},
		waves: {
			base: 0,
			amplitude: 0,
			speed: 1,
			phase: 0,
		},
		speed: 0,
		phase: 0,
	},
	wave2: {
		amplitude: {
			base: 0,
			amplitude: 0,
			speed: 1,
			phase: 0,
		},
		waves: {
			base: 0,
			amplitude: 0,
			speed: 1,
			phase: 0,
		},
		speed: 0,
		phase: 0,
	},
});

const pickRange = <T extends string>(
	object: Record<T, number>,
	key: T,
	range?: Range,
) => {
	if (!range) {
		return;
	}
	const { min, max, step = 1 } = range;
	const steps = Math.round((max - min) / step) + 1;
	const randomStep = Math.floor(Math.random() * steps);
	object[key] = range.min + randomStep * step;
};

export const pickCombinedWaveData = (level: Level): CombinedWaveData => {
	const result = zeroWaveData();
	const data = level.waves;

	pickRange(result, "baseline", data.baseline);

	pickRange(result.wave1.amplitude, "base", data.wave1?.amplitude?.base);
	pickRange(result.wave1.waves, "base", data.wave1?.waves?.base);
	pickRange(result.wave1, "speed", data.wave1?.speed);
	pickRange(result.wave1, "phase", data.wave1?.phase);

	pickRange(result.wave2.amplitude, "base", data.wave2?.amplitude?.base);
	pickRange(result.wave2.waves, "base", data.wave2?.waves?.base);
	pickRange(result.wave2, "speed", data.wave2?.speed);
	pickRange(result.wave2, "phase", data.wave2?.phase);

	if (!level.condition(result)) {
		return pickCombinedWaveData(level);
	}
	return result;
};

export const assertReturn = (v?: T): T => {
	if (!v) {
		throw new Error("no value");
	}
	return v;
};

import type { CombinedWaveData } from "./Waveform";

export type Range = {
	min: number;
	max: number;
	step?: number;
};

export type KnobType = {
	type: "vertical-slider" | "horizontal-slider" | "knob" | "buttons";
	x: number;
	y: number;
	param:
		| "baseline"
		| "amplitude1"
		| "modulation1"
		| "frequency1"
		| "speed1"
		| "offset1"
		| "amplitude2"
		| "modulation2"
		| "frequency2"
		| "speed2"
		| "offset2";
};

export type Ranges = {
	baseline?: Range;
	wave1?: {
		amplitude?: {
			base?: Range;
			modulationStrength?: Range;
			modulationSpeed?: Range;
			modulationPhase?: Range;
		};
		frequency?: Range;
		speed?: Range;
		offset?: Range;
		phase?: Range;
	};
	wave2?: {
		amplitude?: {
			base?: Range;
			modulationStrength?: Range;
			modulationSpeed?: Range;
			modulationPhase?: Range;
		};
		frequency?: Range;
		speed?: Range;
		offset?: Range;
		phase?: Range;
	};
};

export type Level = {
	ranges: Ranges;
	toBeSolved: {
		baseline?: true;
		wave1?: {
			amplitude?: {
				base?: true;
				modulationStrength?: true;
				// modulationSpeed?: true;
			};
			frequency?: true;
			speed?: true;
			offset?: true;
		};
		wave2?: {
			amplitude?: {
				base?: true;
				modulationStrength?: true;
				// modulationSpeed?: true;
			};
			frequency?: true;
			speed?: true;
			offset?: true;
		};
	};
	condition: (waveData: CombinedWaveData) => boolean;
	conditionInitial?: (
		blueprint: CombinedWaveData,
		waveData: CombinedWaveData,
	) => boolean;
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
		frequency: 0,
		speed: 0,
		offset: 0,
		phase: 0,
	},
	wave2: {
		amplitude: {
			base: 0,
			amplitude: 0,
			speed: 1,
			phase: 0,
		},
		frequency: 0,
		speed: 0,
		offset: 0,
		phase: 0,
	},
});

const pickRange = <T extends string>(
	object: Record<T, number>,
	key: T,
	range?: Range,
	toAvoid?: number,
) => {
	if (!range) {
		return;
	}
	const { min, max, step = 1 } = range;
	const steps = Math.round((max - min) / step) + 1;
	const randomStep = Math.floor(Math.random() * steps);
	const value = range.min + randomStep * step;
	if (value === toAvoid) {
		pickRange(object, key, range, toAvoid);
		return;
	}
	object[key] = value;
};

export const pickCombinedWaveData = (level: Level): CombinedWaveData => {
	const result = zeroWaveData();
	const ranges = level.ranges;

	pickRange(result, "baseline", ranges.baseline);

	for (const key of ["wave1", "wave2"] as const) {
		pickRange(result[key].amplitude, "base", ranges[key]?.amplitude?.base);
		pickRange(
			result[key].amplitude,
			"amplitude",
			ranges[key]?.amplitude?.modulationStrength,
		);
		pickRange(
			result[key].amplitude,
			"speed",
			ranges[key]?.amplitude?.modulationSpeed,
		);
		pickRange(
			result[key].amplitude,
			"phase",
			ranges[key]?.amplitude?.modulationPhase,
		);
		pickRange(result[key], "frequency", ranges[key]?.frequency);
		pickRange(result[key], "speed", ranges[key]?.speed);
		pickRange(result[key], "offset", ranges[key]?.offset);
		pickRange(result[key], "phase", ranges[key]?.phase);
	}

	if (!level.condition(result)) {
		return pickCombinedWaveData(level);
	}
	return result;
};

const pickSecondWaveData = (
	level: Level,
	blueprint: CombinedWaveData,
): CombinedWaveData => {
	const result = structuredClone(blueprint);
	const ranges = level.ranges;

	pickRange(result, "baseline", level.toBeSolved.baseline && ranges.baseline);

	for (const key of ["wave1", "wave2"] as const) {
		pickRange(
			result[key].amplitude,
			"base",
			level.toBeSolved[key]?.amplitude?.base &&
				ranges[key]?.amplitude?.base,
			blueprint[key].amplitude.base,
		);
		pickRange(
			result[key].amplitude,
			"amplitude",
			level.toBeSolved[key]?.amplitude?.modulationStrength &&
				ranges[key]?.amplitude?.modulationStrength,
			blueprint[key].amplitude.amplitude,
		);
		pickRange(
			result[key],
			"frequency",
			level.toBeSolved[key]?.frequency && ranges[key]?.frequency,
			blueprint[key].frequency,
		);
		pickRange(
			result[key],
			"speed",
			level.toBeSolved[key]?.speed && ranges[key]?.speed,
			blueprint[key].speed,
		);
		pickRange(
			result[key],
			"offset",
			level.toBeSolved[key]?.offset && ranges[key]?.offset,
			blueprint[key].offset,
		);
	}

	if (!level.condition(result)) {
		return pickSecondWaveData(level, blueprint);
	}
	return result;
};
export const pickBothWaveData = (
	level: Level,
): {
	level: Level;
	blueprint: CombinedWaveData;
	waveform: CombinedWaveData;
	isSolved: false;
} => {
	const blueprint = pickCombinedWaveData(level);
	const waveform = pickSecondWaveData(level, blueprint);
	return { level, blueprint, waveform, isSolved: false };
};

export const assertReturn = <T>(v?: T): T => {
	if (!v) {
		throw new Error("no value");
	}
	return v;
};

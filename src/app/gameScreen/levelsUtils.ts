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
		| "frequency1"
		| "speed1"
		| "offset1"
		| "amplitude2"
		| "frequency2"
		| "speed2"
		| "offset2";
};

export type Level = {
	waves: {
		baseline?: Range;
		wave1?: {
			amplitude?: {
				base?: Range;
			};
			waves?: Range;
			speed?: Range;
			offset?: Range;
			phase?: Range;
		};
		wave2?: {
			amplitude?: {
				base?: Range;
			};
			waves?: Range;
			speed?: Range;
			offset?: Range;
			phase?: Range;
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
		waves: 0,
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
		waves: 0,
		speed: 0,
		offset: 0,
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
	pickRange(result.wave1, "waves", data.wave1?.waves);
	pickRange(result.wave1, "speed", data.wave1?.speed);
	pickRange(result.wave1, "offset", data.wave1?.offset);
	pickRange(result.wave1, "phase", data.wave1?.phase);

	pickRange(result.wave2.amplitude, "base", data.wave2?.amplitude?.base);
	pickRange(result.wave2, "waves", data.wave2?.waves);
	pickRange(result.wave2, "speed", data.wave2?.speed);
	pickRange(result.wave2, "offset", data.wave2?.offset);
	pickRange(result.wave2, "phase", data.wave2?.phase);

	if (!level.condition(result)) {
		return pickCombinedWaveData(level);
	}
	return result;
};

const pickSecondWaveData = (
	level: Level,
	blueprint: CombinedWaveData,
): CombinedWaveData => {
	const result = pickCombinedWaveData(level);
	if (level.conditionInitial && !level.conditionInitial(blueprint, result)) {
		return pickSecondWaveData(level, blueprint);
	}
	return result;
};
export const pickBothWaveData = (
	level: Level,
): { blueprint: CombinedWaveData; waveform: CombinedWaveData } => {
	const blueprint = pickCombinedWaveData(level);
	const waveform = pickSecondWaveData(level, blueprint);
	return { blueprint, waveform };
};

export const assertReturn = <T>(v?: T): T => {
	if (!v) {
		throw new Error("no value");
	}
	return v;
};

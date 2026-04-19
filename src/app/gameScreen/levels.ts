import type { Level } from "./levelsUtils";

export const level1: Level = {
	waves: {
		baseline: { min: -5, max: 5 },
		wave1: {
			amplitude: { base: { min: 1, max: 10 } },
			waves: { base: { min: 1, max: 7 } },
			speed: { min: -4, max: 4 },
			phase: { min: 0, max: 8, step: 2 },
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device: [
		{
			type: "vertical-slider",
			x: -125,
			y: 100,
			param: "baseline",
		},
		{
			type: "vertical-slider",
			x: 125,
			y: 100,
			param: "amplitude1",
		},
		{
			type: "knob",
			x: 0,
			y: 100,
			param: "frequency1",
		},
		{
			type: "horizontal-slider",
			x: 0,
			y: 300,
			param: "speed1",
		},
	],
};

export const level2: Level = {
	waves: {
		wave1: {
			amplitude: { base: { min: 6, max: 10 } },
			waves: { base: { min: 1, max: 3, step: 0.5 } },
			speed: { min: -1, max: 1, step: 0.5 },
			phase: { min: 0, max: 8, step: 2 },
		},
		wave2: {
			amplitude: { base: { min: 1, max: 5 } },
			waves: { base: { min: 8, max: 10, step: 0.5 } },
			speed: { min: -1, max: 1, step: 0.5 },
			phase: { min: 0, max: 8, step: 2 },
		},
	},
	condition: (waveData) =>
		(waveData.wave1.speed != 0 || waveData.wave2.speed != 0) &&
		waveData.wave1.speed != waveData.wave2.speed,
	device: [
		{
			type: "vertical-slider",
			x: -150,
			y: 10,
			param: "amplitude1",
		},
		{
			type: "knob",
			x: 50,
			y: -40,
			param: "frequency1",
		},
		{
			type: "horizontal-slider",
			x: 50,
			y: 100,
			param: "speed1",
		},

		{
			type: "vertical-slider",
			x: -150,
			y: 310,
			param: "amplitude2",
		},
		{
			type: "knob",
			x: 50,
			y: 260,
			param: "frequency2",
		},
		{
			type: "horizontal-slider",
			x: 50,
			y: 400,
			param: "speed2",
		},
	],
};

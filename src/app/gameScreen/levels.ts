import type { Level, Ranges } from "./levelsUtils";

const ranges1: Ranges = {
	wave1: {
		amplitude: { base: { min: 1, max: 10 } },
		frequency: { min: 1, max: 10 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

const level1: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: {
				base: true,
			},
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device: [
		{
			type: "vertical-slider",
			x: -150,
			y: 0,
			param: "amplitude1",
		},
		{
			type: "vertical-slider",
			x: -50,
			y: 0,
			param: "offset1",
		},
	],
};

const level2: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: {
				base: true,
			},
			frequency: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device: [
		{
			type: "vertical-slider",
			x: -150,
			y: 0,
			param: "amplitude1",
		},
		{
			type: "vertical-slider",
			x: -50,
			y: 0,
			param: "offset1",
		},
		{
			type: "vertical-slider",
			x: 50,
			y: 0,
			param: "frequency1",
		},
	],
};

const level3: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: {
				base: true,
			},
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device: [
		{
			type: "vertical-slider",
			x: -150,
			y: 0,
			param: "amplitude1",
		},
		{
			type: "vertical-slider",
			x: -50,
			y: 0,
			param: "offset1",
		},
		{
			type: "buttons",
			x: 150,
			y: 0,
			param: "speed1",
		},
	],
};

const level4: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: {
				base: true,
			},
			frequency: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device: [
		{
			type: "vertical-slider",
			x: -150,
			y: 0,
			param: "amplitude1",
		},
		{
			type: "vertical-slider",
			x: -50,
			y: 0,
			param: "offset1",
		},
		{
			type: "vertical-slider",
			x: 50,
			y: 0,
			param: "frequency1",
		},
		{
			type: "buttons",
			x: 150,
			y: 0,
			param: "speed1",
		},
	],
};

// export const level2: Level = {
// 	ranges: {
// 		wave1: {
// 			amplitude: { base: { min: 6, max: 10 } },
// 			frequency: { min: 1, max: 3, step: 0.5 },
// 			speed: { min: -0.5, max: 0.5, step: 0.2 },
// 			offset: { min: 0, max: 8, step: 2 },
// 		},
// 		wave2: {
// 			amplitude: { base: { min: 1, max: 5 } },
// 			frequency: { min: 8, max: 10, step: 0.5 },
// 			speed: { min: -0.5, max: 0.5, step: 0.2 },
// 			offset: { min: 0, max: 8, step: 2 },
// 		},
// 	},
// 	toBeSolved: {
// 		wave1: {
// 			amplitude: {
// 				base: true,
// 			},
// 			frequency: true,
// 			offset: true,
// 		},
// 		wave2: {
// 			amplitude: {
// 				base: true,
// 			},
// 			frequency: true,
// 			offset: true,
// 		},
// 	},
// 	condition: (waveData) =>
// 		(waveData.wave1.speed != 0 || waveData.wave2.speed != 0) &&
// 		waveData.wave1.speed != waveData.wave2.speed,
// 	device: [
// 		{
// 			type: "vertical-slider",
// 			x: -150,
// 			y: 10,
// 			param: "amplitude1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 0,
// 			y: 10,
// 			param: "frequency1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 150,
// 			y: 10,
// 			param: "offset1",
// 		},

// 		{
// 			type: "vertical-slider",
// 			x: -150,
// 			y: 310,
// 			param: "amplitude2",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 0,
// 			y: 310,
// 			param: "frequency2",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 150,
// 			y: 310,
// 			param: "offset2",
// 		},
// 	],
// };

// export const level3: Level = {
// 	ranges: {
// 		wave1: {
// 			amplitude: {
// 				base: { min: 1, max: 4, step: 0.5 },
// 				modulationStrength: { min: 3, max: 6, step: 1 },
// 			},
// 			frequency: { min: 1, max: 7, step: 1 },
// 			speed: { min: -1, max: 1, step: 0.5 },
// 			offset: { min: 0, max: 8, step: 2 },
// 		},
// 	},
// 	toBeSolved: {
// 		wave1: {
// 			amplitude: {
// 				base: true,
// 				// modulationStrength: true,
// 			},
// 			frequency: true,
// 			speed: true,
// 			offset: true,
// 		},
// 	},
// 	condition: (waveData) => waveData.wave1.speed != 0,
// 	device: [
// 		{
// 			type: "vertical-slider",
// 			x: -150,
// 			y: 0,
// 			param: "speed1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: -50,
// 			y: 0,
// 			param: "amplitude1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 50,
// 			y: 0,
// 			param: "frequency1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 150,
// 			y: 0,
// 			param: "offset1",
// 		},
// 	],
// };

// export const level4: Level = {
// 	ranges: {
// 		wave1: {
// 			amplitude: { base: { min: 5, max: 8 } },
// 			frequency: { min: 1, max: 3 },
// 			speed: { min: -1, max: 1 },
// 			offset: { min: 0, max: 8, step: 2 },
// 		},
// 		wave2: {
// 			amplitude: { base: { min: 1, max: 3 } },
// 			frequency: { min: 6, max: 10 },
// 			speed: { min: -1, max: 1 },
// 			offset: { min: 0, max: 8, step: 2 },
// 		},
// 	},
// 	toBeSolved: {
// 		wave1: {
// 			amplitude: {
// 				base: true,
// 			},
// 			frequency: true,
// 			speed: true,
// 			offset: true,
// 		},
// 		wave2: {
// 			amplitude: {
// 				base: true,
// 			},
// 			frequency: true,
// 			speed: true,
// 			offset: true,
// 		},
// 	},
// 	condition: (waveData) => waveData.wave1.speed != 0,
// 	device: [
// 		{
// 			type: "vertical-slider",
// 			x: -150,
// 			y: 0,
// 			param: "amplitude1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: -50,
// 			y: 0,
// 			param: "frequency1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 50,
// 			y: 0,
// 			param: "offset1",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 150,
// 			y: 0,
// 			param: "speed1",
// 		},

// 		{
// 			type: "vertical-slider",
// 			x: -150,
// 			y: 300,
// 			param: "amplitude2",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: -50,
// 			y: 300,
// 			param: "frequency2",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 50,
// 			y: 300,
// 			param: "offset2",
// 		},
// 		{
// 			type: "vertical-slider",
// 			x: 150,
// 			y: 300,
// 			param: "speed2",
// 		},
// 	],
// };

export const levels = [
	{ level: level1, count: 5 },
	{ level: level2, count: 3 },
	{ level: level3, count: 3 },
	{ level: level4, count: 5 },
];

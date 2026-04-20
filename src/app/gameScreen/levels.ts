import type { DeviceSpecification, Level, Ranges } from "./levelsUtils";

const ranges1: Ranges = {
	wave1: {
		amplitude: { min: 1, max: 10 },
		frequency: { min: 1, max: 7 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

const ranges2: Ranges = {
	wave1: {
		amplitude: { min: 2, max: 10 },
		frequency: { min: 1, max: 9 },
		am: { min: 0, max: 3 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

const ranges3: Ranges = {
	wave1: {
		amplitude: { min: 1, max: 10 },
		am: { min: 0, max: 2 },
		frequency: { min: 1, max: 7 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
	wave2: {
		amplitude: { min: 0, max: 4 },
		am: { min: 0, max: 2 },
		frequency: { min: 7, max: 10 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

const device: DeviceSpecification = [
	{
		type: "vertical-slider",
		x: -220,
		y: 60,
		param: "amplitude1",
	},
	{
		type: "vertical-slider2",
		x: -70,
		y: 60,
		param: "frequency1",
	},
	{
		type: "horizontal-roller",
		x: 180,
		y: 50,
		param: "offset1",
	},
	{
		type: "switch",
		x: 80,
		y: -120,
		param: "am1",
	},
	{
		type: "switch",
		x: 220,
		y: -120,
		param: "shape1",
	},
	{
		type: "horizontal-buttons",
		x: 150,
		y: 240,
		param: "speed1",
	},

	{
		type: "vertical-slider",
		x: -150,
		y: 300,
		param: "amplitude2",
	},
	{
		type: "horizontal-roller",
		x: 80,
		y: 300,
		param: "offset2",
	},
	{
		type: "vertical-slider",
		x: -50,
		y: 300,
		param: "frequency2",
	},
	{
		type: "switch",
		x: 40,
		y: 220,
		param: "am2",
	},
	{
		type: "switch",
		x: 160,
		y: 220,
		param: "shape2",
	},
	{
		type: "horizontal-buttons",
		x: 100,
		y: 380,
		param: "speed2",
	},
];

const level1: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level2: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level3: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level4: Level = {
	ranges: ranges1,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level5: Level = {
	ranges: ranges2,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			am: true,
			shape: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level6: Level = {
	ranges: ranges3,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			am: true,
			shape: true,
			speed: true,
			offset: true,
		},
		wave2: {
			amplitude: true,
			frequency: true,
			am: true,
			shape: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) =>
		waveData.wave1.speed != 0 || waveData.wave2.speed != 0,
	device,
};

export const levels = [
	// { level: level1, count: 5 },
	// { level: level2, count: 3 },
	// { level: level3, count: 3 },
	// { level: level4, count: 5 },
	{ level: level5, count: 10 },
	{ level: level6, count: 10 },
];

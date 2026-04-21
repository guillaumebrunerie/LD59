import type { DeviceSpecification, Level, Ranges } from "./levelsUtils";

// Beginner
const ranges1: Ranges = {
	wave1: {
		amplitude: { min: 1, max: 10 },
		frequency: { min: 1, max: 7 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

// Intermediate
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

// Advanced
const ranges3: Ranges = {
	wave1: {
		amplitude: { min: 4, max: 10 },
		// am: { min: 0, max: 3 },
		frequency: { min: 1, max: 5 },
		// shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
	wave2: {
		amplitude: { min: 1, max: 5 },
		// am: { min: 0, max: 3 },
		frequency: { min: 12, max: 15, step: 0.5 },
		// shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

// Advanced
const ranges4: Ranges = {
	wave1: {
		amplitude: { min: 4, max: 10 },
		am: { min: 0, max: 3 },
		frequency: { min: 1, max: 5 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
	wave2: {
		amplitude: { min: 1, max: 5 },
		// am: { min: 0, max: 3 },
		frequency: { min: 12, max: 15, step: 0.5 },
		// shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

// Advanced
const ranges5: Ranges = {
	wave1: {
		amplitude: { min: 4, max: 10 },
		// am: { min: 0, max: 3 },
		frequency: { min: 1, max: 5 },
		// shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
	wave2: {
		amplitude: { min: 1, max: 5 },
		am: { min: 0, max: 3 },
		frequency: { min: 12, max: 15, step: 0.5 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

// Advanced
const ranges6: Ranges = {
	wave1: {
		amplitude: { min: 4, max: 10 },
		am: { min: 0, max: 3 },
		frequency: { min: 1, max: 5 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
	wave2: {
		amplitude: { min: 1, max: 5 },
		am: { min: 0, max: 3 },
		frequency: { min: 12, max: 15, step: 0.5 },
		shape: { min: 0, max: 2 },
		speed: { min: -1.5, max: 1.5, step: 0.5 },
		offset: { min: 0, max: 8, step: 2 },
	},
};

const halfDevice: DeviceSpecification = [
	{
		type: "vertical-slider",
		x: -219,
		y: 9,
		param: "amplitude1",
	},
	{
		type: "vertical-slider2",
		x: -93,
		y: 8,
		param: "frequency1",
	},
	{
		type: "horizontal-roller",
		x: 134,
		y: 26,
		param: "offset1",
	},
	{
		type: "pulse",
		x: 55,
		y: -112,
		param: "am1",
	},
	{
		type: "shape",
		x: 201,
		y: -113,
		param: "shape1",
	},
	{
		type: "speed1",
		x: 128,
		y: 145,
		param: "speed1",
	},
];
const device: DeviceSpecification = [
	...halfDevice,
	...halfDevice.map((knob) => ({
		...knob,
		y: knob.y + 514,
		type: knob.type.replace("1", "2") as never,
		param: knob.param.replace("1", "2") as never,
	})),
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
			shape: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level6: Level = {
	ranges: ranges2,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			am: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level7: Level = {
	ranges: ranges2,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			am: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) => waveData.wave1.speed != 0,
	device,
};

const level8: Level = {
	ranges: ranges3,
	toBeSolved: {
		wave1: {
			amplitude: true,
			// frequency: true,
			// am: true,
			// shape: true,
			// speed: true,
			offset: true,
		},
		wave2: {
			amplitude: true,
			// frequency: true,
			// am: true,
			// shape: true,
			// speed: true,
			offset: true,
		},
	},
	condition: (waveData) =>
		waveData.wave1.speed != 0 || waveData.wave2.speed != 0,
	device,
};

const level9: Level = {
	ranges: ranges3,
	toBeSolved: {
		wave1: {
			amplitude: true,
			frequency: true,
			// am: true,
			// shape: true,
			speed: true,
			offset: true,
		},
		wave2: {
			amplitude: true,
			frequency: true,
			// am: true,
			// shape: true,
			speed: true,
			offset: true,
		},
	},
	condition: (waveData) =>
		waveData.wave1.speed != 0 || waveData.wave2.speed != 0,
	device,
};

const level10: Level = {
	ranges: ranges4,
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
			// frequency: true,
			// am: true,
			// shape: true,
			// speed: true,
			offset: true,
		},
	},
	condition: (waveData) =>
		waveData.wave1.speed != 0 || waveData.wave2.speed != 0,
	device,
};

const level11: Level = {
	ranges: ranges5,
	toBeSolved: {
		wave1: {
			amplitude: true,
			// frequency: true,
			// am: true,
			// shape: true,
			// speed: true,
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

const levelInfinity: Level = {
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
	// Beginner (16 levels)
	{ level: level1, count: 5 },
	{ level: level2, count: 3 },
	{ level: level3, count: 3 },
	{ level: level4, count: 5 },
	// Intermediate (9 levels)
	{ level: level5, count: 3 },
	{ level: level6, count: 3 },
	{ level: level7, count: 3 },
	// Advanced (15 levels)
	{ level: level8, count: 3 },
	{ level: level9, count: 4 },
	{ level: level10, count: 4 },
	{ level: level11, count: 4 },
	// Expert (10 levels)
	{ level: levelInfinity, count: 10 },
];

export const levelCount = levels.reduce((sum, { count }) => sum + count, 0);

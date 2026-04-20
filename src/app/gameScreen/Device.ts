import {
	Assets,
	Color,
	FederatedPointerEvent,
	Graphics,
	Rectangle,
	Sprite,
	Ticker,
	type ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import {
	combinedWaveDataMatch,
	Waveform,
	type CombinedWaveData,
} from "./Waveform";
import type { Level, Range } from "./levelsUtils";
import { mod } from "../utils/maths";

const getParamAndTarget = (
	waveform: Waveform,
	blueprint: Waveform,
	paramKey: Level["device"][number]["param"],
) => {
	switch (paramKey) {
		case "baseline":
			return {
				param: waveform.baselineParam(),
				target: blueprint.baselineParam().get(),
			};
		case "amplitude1":
			return {
				param: waveform.amplitudeXParam("wave1"),
				target: blueprint.amplitudeXParam("wave1").get(),
			};
		case "am1":
			return {
				param: waveform.amXParam("wave1"),
				target: blueprint.amXParam("wave1").get(),
			};
		case "frequency1":
			return {
				param: waveform.frequencyXParam("wave1"),
				target: blueprint.frequencyXParam("wave1").get(),
			};
		case "fm1":
			return {
				param: waveform.fmXParam("wave1"),
				target: blueprint.fmXParam("wave1").get(),
			};
		case "shape1":
			return {
				param: waveform.shapeXParam("wave1"),
				target: blueprint.shapeXParam("wave1").get(),
			};
		case "offset1":
			return {
				param: waveform.offsetXParam("wave1"),
				target: blueprint.offsetXParam("wave1").get(),
			};
		case "speed1":
			return {
				param: waveform.speedXParam("wave1"),
				target: blueprint.speedXParam("wave1").get(),
			};
		case "amplitude2":
			return {
				param: waveform.amplitudeXParam("wave2"),
				target: blueprint.amplitudeXParam("wave2").get(),
			};
		case "am2":
			return {
				param: waveform.amXParam("wave2"),
				target: blueprint.amXParam("wave2").get(),
			};
		case "frequency2":
			return {
				param: waveform.frequencyXParam("wave2"),
				target: blueprint.frequencyXParam("wave2").get(),
			};
		case "fm2":
			return {
				param: waveform.fmXParam("wave2"),
				target: blueprint.fmXParam("wave2").get(),
			};
		case "shape2":
			return {
				param: waveform.shapeXParam("wave2"),
				target: blueprint.shapeXParam("wave2").get(),
			};
		case "offset2":
			return {
				param: waveform.offsetXParam("wave2"),
				target: blueprint.offsetXParam("wave2").get(),
			};
		case "speed2":
			return {
				param: waveform.speedXParam("wave2"),
				target: blueprint.speedXParam("wave2").get(),
			};
	}
};

export class Device extends Container {
	blueprint: Waveform;
	waveform: Waveform;
	onEnd: (isMatch: boolean) => void;
	batteryLights: Sprite[];
	knobs: Knob[];

	constructor(
		options: ViewContainerOptions & {
			targetWaveData: CombinedWaveData;
			initialWaveData: CombinedWaveData;
			onEnd: (isMatch: boolean) => void;
			level: Level;
		},
	) {
		super(options);
		this.onEnd = options.onEnd;
		const darkOverlay = this.addChild(
			new Graphics().rect(-1000, -1000, 2000, 2000).fill("#20200080"),
		);
		darkOverlay.interactive = true;
		darkOverlay.on("click", (event) => {
			if (event.currentTarget === darkOverlay) {
				this.onEnd(false);
			}
		});
		darkOverlay.on("tap", (event) => {
			if (event.currentTarget === darkOverlay) {
				this.onEnd(false);
			}
		});

		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("DeviceScreen.png"),
			}),
		);

		const waveformOptions = {
			y: -570,
			w: 425,
			h: 170,
		};
		this.blueprint = this.addChild(
			new Waveform({
				...waveformOptions,
				waveData: options.targetWaveData,
				color: new Color("#6d381340"),
				level: options.level,
			}),
		);
		this.waveform = this.addChild(
			new Waveform({
				...waveformOptions,
				waveData: options.initialWaveData,
				color: new Color("#6d3813"),
				level: options.level,
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("DeviceScreenLines.png"),
				alpha: 0.5,
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Device.png"),
				interactive: true,
				hitArea: new Rectangle(-380, -850, 760, 1700),
			}),
		);
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(
		// 			device.hitArea.x,
		// 			device.hitArea.y,
		// 			device.hitArea.width,
		// 			device.hitArea.height,
		// 		)
		// 		.fill("#FF00FF20"),
		// );
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("HelpButton.png"),
				interactive: true,
				hitArea: new Rectangle(0, -930, 400, 150),
				onpointerdown: () => {
					this.askForHelp();
				},
			}),
		);
		// this.addChild(
		// 	new Graphics()
		// 		.rect(
		// 			help.hitArea.x,
		// 			help.hitArea.y,
		// 			help.hitArea.width,
		// 			help.hitArea.height,
		// 		)
		// 		.fill("#FF00FF20"),
		// );
		this.batteryLights = [];
		for (let i = 1; i < 6; i++) {
			this.batteryLights.push(
				this.addChild(
					new Sprite({
						anchor: 0.5,
						texture: Assets.get(`Battery_0${i}.png`),
					}),
				),
			);
		}

		this.knobs = [];
		for (const knobSpec of options.level.device) {
			const {
				param: { range, get, set },
				target: desiredValue,
			} = getParamAndTarget(
				this.waveform,
				this.blueprint,
				knobSpec.param,
			);
			if (!range) {
				continue;
			}
			const param = { range, get, set };
			switch (knobSpec.type) {
				case "vertical-slider":
					this.knobs.push(
						this.addChild(
							new Slider({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
								orientation: "vertical",
								wrapAround: false,
								id: "",
							}),
						),
					);
					break;
				case "vertical-slider2":
					this.knobs.push(
						this.addChild(
							new Slider({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
								orientation: "vertical",
								wrapAround: false,
								id: "2",
							}),
						),
					);
					break;
				case "horizontal-slider":
					this.knobs.push(
						this.addChild(
							new Slider({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
								orientation: "horizontal",
								wrapAround: false,
								id: "",
							}),
						),
					);
					break;
				case "horizontal-roller":
					this.knobs.push(
						this.addChild(
							new Roller({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
								orientation: "horizontal",
							}),
						),
					);
					break;
				case "horizontal-buttons":
					this.knobs.push(
						this.addChild(
							new HorizontalButtons({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
							}),
						),
					);
					break;
				case "switch":
					this.knobs.push(
						this.addChild(
							new Switch({
								x: knobSpec.x,
								y: knobSpec.y,
								param,
								desiredValue,
							}),
						),
					);
					break;
			}
		}
	}

	batteryCount = 5;
	askForHelp() {
		if (this.batteryCount > 0) {
			this.batteryCount--;
			for (const knob of this.knobs) {
				if (!knob.isSolved()) {
					knob.solve();
					break;
				}
			}
		}
		this.redrawBatteryLights();
	}

	redrawBatteryLights() {
		this.batteryLights.forEach((light, index) => {
			light.visible = index < this.batteryCount;
		});
	}

	isMatching = false;
	matchedSince = 0;
	update(ticker: Ticker) {
		if (this.isMatching) {
			this.matchedSince += ticker.deltaMS / 1000;
			if (this.matchedSince > 0.7) {
				this.onEnd(true);
			}
		}
		this.blueprint.update(ticker);
		this.waveform.update(ticker);
		if (
			combinedWaveDataMatch(
				this.waveform.waveData,
				this.blueprint.waveData,
			) &&
			!this.isMatching
		) {
			this.waveform.color = new Color("green");
			this.eventMode = "none";
			this.isMatching = true;
			navigator.vibrate?.(200);
			console.log("MATCH!");
			console.log(this.waveform.waveData, this.blueprint.waveData);
		}
		for (const child of this.children) {
			child.update?.(ticker);
		}
	}

	reset() {
		this.waveform.color = new Color("#6d3813");
		this.eventMode = "auto";
		this.isMatching = false;
		this.matchedSince = 0;
	}
}

export type OptionalParam = {
	range?: Range;
	get: () => number;
	set: (newValue: number) => void;
};

export type Param = {
	range: Range;
	get: () => number;
	set: (newValue: number) => void;
};

type KnobOptions = ViewContainerOptions & {
	param: Param;
	desiredValue: number;
};

export class Knob extends Container {
	param: Param;
	desiredValue: number;
	constructor(options: KnobOptions) {
		super(options);
		this.param = options.param;
		this.desiredValue = options.desiredValue;
	}

	solve() {
		this.param.set(this.desiredValue);
	}

	isSolved() {
		return this.param.get() === this.desiredValue;
	}
}

export abstract class AbstractSlider extends Knob {
	target: number;
	wrapAround: boolean;

	constructor(
		options: KnobOptions & {
			wrapAround: boolean;
		},
	) {
		super(options);
		const { wrapAround } = options;
		this.wrapAround = wrapAround;
		this.target = this.param.get();
	}

	minY = 220;
	maxY = -220;
	redraw() {}
	update(ticker: Ticker) {
		const dt = ticker.deltaMS / 1000;
		const speed = 8;

		let value = this.param.get();
		if (value < this.target) {
			value += dt * speed;
			value = Math.min(value, this.target);
			this.param.set(value);
		}
		if (value > this.target) {
			value -= dt * speed;
			value = Math.max(value, this.target);
			this.param.set(value);
		}
		this.redraw();
	}

	solve() {
		this.target = this.desiredValue;
	}

	isPressed = false;
	previousY = 0;
	onpointerdown = (event: FederatedPointerEvent) => {
		this.isPressed = true;
		this.previousY = event.getLocalPosition(this).y;
	};

	onglobalpointermove = (event: FederatedPointerEvent) => {
		if (!this.isPressed) {
			return;
		}

		const delta = event.getLocalPosition(this).y - this.previousY;
		const valueDelta =
			(-delta / (this.minY - this.maxY)) *
			(this.param.range.max - this.param.range.min);
		const previousValue = this.param.get();
		const newValue =
			this.wrapAround ?
				previousValue + valueDelta
			:	Math.max(
					this.param.range.min,
					Math.min(this.param.range.max, previousValue + valueDelta),
				);
		const actualValueDelta = newValue - previousValue;
		const actualDelta =
			(-actualValueDelta /
				(this.param.range.max - this.param.range.min)) *
			(this.minY - this.maxY);
		this.previousY += actualDelta;
		this.param.set(newValue);
		this.target = newValue;
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
		this.target = snap(this.param.range, this.param.get());
	});
}

const snap = (range: Range, value: number) => {
	const { step = 1 } = range;
	return Math.round(value / step) * step;
};

export class Slider extends AbstractSlider {
	knob: Sprite;

	constructor(
		options: KnobOptions & {
			orientation: "vertical" | "horizontal";
			wrapAround: boolean;
			id: string;
		},
	) {
		super(options);
		if (options.orientation === "horizontal") {
			this.angle += 90;
		}

		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider${options.id}Socket.png`),
			}),
		);
		this.knob = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider${options.id}.png`),
			}),
		);

		this.interactive = true;
		const hitArea = new Rectangle(-60, -275, 120, 550);
		this.hitArea = hitArea;
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF20"),
		// );
	}

	redraw() {
		this.knob.y =
			this.minY +
			((this.param.get() - this.param.range.min) /
				(this.param.range.max - this.param.range.min)) *
				(this.maxY - this.minY);
	}

	// onclick = (this.ontap = (event: FederatedPointerEvent) => {
	// 	const clickedY = event.getLocalPosition(this).y;
	// 	const clickedValue =
	// 		this.param.minValue +
	// 		((clickedY - this.minY) / (this.maxY - this.minY)) *
	// 			(this.param.maxValue - this.param.minValue);

	// 	const value = this.param.get();
	// 	if (clickedValue < value - 1 && value >= this.param.minValue + 1) {
	// 		this.param.set(value - 1, 8);
	// 	} else if (
	// 		clickedValue > value + 1 &&
	// 		value <= this.param.maxValue - 1
	// 	) {
	// 		this.param.set(value + 1, 8);
	// 	}
	// 	this.update();
	// });
}

export class Roller extends AbstractSlider {
	knob: Sprite;

	minY = 100;
	maxY = -100;
	constructor(
		options: KnobOptions & {
			orientation: "vertical" | "horizontal";
		},
	) {
		super({ ...options, wrapAround: true });
		if (options.orientation === "horizontal") {
			this.angle += 90;
		}

		this.knob = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider3Stripe.png`),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider3Shadow.png`),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider3Socket.png`),
			}),
		);

		this.interactive = true;
		const mask = new Rectangle(-45, -210, 90, 420);
		this.knob.mask = new Graphics()
			.rect(mask.x, mask.y, mask.width, mask.height)
			.fill(); //.fill("black");
		this.addChild(this.knob.mask);

		const hitArea = new Rectangle(-55, -220, 110, 440);
		this.hitArea = hitArea;
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF20"),
		// );
	}

	redraw() {
		this.knob.y =
			this.minY +
			((this.param.get() - this.param.range.min) /
				(this.param.range.max - this.param.range.min)) *
				(this.maxY - this.minY);
	}

	// onclick = (this.ontap = (event: FederatedPointerEvent) => {
	// 	const clickedY = event.getLocalPosition(this).y;
	// 	const clickedValue =
	// 		this.param.minValue +
	// 		((clickedY - this.minY) / (this.maxY - this.minY)) *
	// 			(this.param.maxValue - this.param.minValue);

	// 	const value = this.param.get();
	// 	if (clickedValue < value - 1 && value >= this.param.minValue + 1) {
	// 		this.param.set(value - 1, 8);
	// 	} else if (
	// 		clickedValue > value + 1 &&
	// 		value <= this.param.maxValue - 1
	// 	) {
	// 		this.param.set(value + 1, 8);
	// 	}
	// 	this.update();
	// });
}

export class Button extends Container {
	button: Sprite;
	delta: number;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
			texture: string;
			delta: number;
			hitArea: Rectangle;
		},
	) {
		super(options);
		this.delta = options.delta;

		this.button = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(options.texture),
			}),
		);
		this.button.interactive = true;
		const hitArea = options.hitArea;
		this.button.hitArea = hitArea;
		this.button.on("pointerdown", () => {
			const value = options.param.get();
			const newValue = value + this.delta;
			if (
				newValue >= options.param.range.min &&
				newValue <= options.param.range.max
			) {
				options.param.set(newValue);
			}
		});

		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF20"),
		// );
	}
}

// export class VerticalButtons extends Container {
// 	constructor(options: ViewContainerOptions & { param: Param }) {
// 		super(options);
// 		const {
// 			param: {
// 				range: { step = 1 },
// 			},
// 		} = options;
// 		this.addChild(
// 			new Button({
// 				y: 0,
// 				param: options.param,
// 				texture: "MoveDownBtn.png",
// 				delta: -step,
// 				hitArea: new Rectangle(-55, 0, 110, 65),
// 			}),
// 		);
// 		this.addChild(
// 			new Button({
// 				y: 0,
// 				param: options.param,
// 				texture: "MoveUpBtn.png",
// 				delta: step,
// 				hitArea: new Rectangle(-55, -65, 110, 65),
// 			}),
// 		);
// 	}
// }

export class HorizontalButtons extends Knob {
	constructor(options: KnobOptions) {
		super(options);
		this.angle = 90;
		const {
			param: {
				range: { step = 1 },
			},
		} = options;
		this.addChild(
			new Button({
				y: 30,
				param: options.param,
				texture: "MoveDownBtn.png",
				delta: -step,
				hitArea: new Rectangle(-55, 0, 110, 65),
			}),
		);
		this.addChild(
			new Button({
				y: -30,
				param: options.param,
				texture: "MoveUpBtn.png",
				delta: step,
				hitArea: new Rectangle(-55, -65, 110, 65),
			}),
		);
	}
}

export class Switch extends Knob {
	switch: Sprite;

	constructor(options: KnobOptions) {
		super(options);

		this.switch = this.addChild(
			new Sprite({
				anchor: 0.5,
			}),
		);
		this.switch.interactive = true;
		const hitArea = new Rectangle(-45, -45, 90, 90);
		this.switch.hitArea = hitArea;
		this.switch.on("pointerdown", () => {
			const value = options.param.get();
			const newValue = mod(value + 1, options.param.range.max + 1);
			options.param.set(newValue);
			this.redraw();
		});
		this.redraw();
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF20"),
		// );
	}

	redraw() {
		this.switch.texture = Assets.get(
			this.param.get() > 0 ? "ButtonOn.png" : "ButtonOff.png",
		);
		this.switch.blendMode = this.param.get() == 2 ? "add" : "normal";
	}
}

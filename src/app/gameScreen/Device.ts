import {
	AnimatedSprite,
	Assets,
	Color,
	FederatedPointerEvent,
	Graphics,
	Rectangle,
	Sprite,
	Texture,
	Ticker,
	type ContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import {
	combinedWaveDataMatch,
	Waveform,
	type CombinedWaveData,
} from "./Waveform";
import type { Level, Range, ToBeSolved } from "./levelsUtils";
import { mod } from "../utils/maths";
import { randomItem } from "../../engine/utils/random";
import { Label } from "../ui/Label";
import { engine } from "../../getEngine";

const getParamAndTarget = (
	waveform: Waveform,
	blueprint: Waveform,
	paramKey: Level["device"][number]["param"],
	toBeSolved: ToBeSolved,
) => {
	switch (paramKey) {
		case "baseline":
			return (
				toBeSolved.baseline && {
					param: waveform.baselineParam(),
					target: blueprint.baselineParam().get(),
					hintPriority: -1,
				}
			);
		case "amplitude1":
			return (
				toBeSolved.wave1?.amplitude && {
					param: waveform.amplitudeXParam("wave1"),
					target: blueprint.amplitudeXParam("wave1").get(),
					hintPriority: 2,
				}
			);
		case "am1":
			return (
				toBeSolved.wave1?.am && {
					param: waveform.amXParam("wave1"),
					target: blueprint.amXParam("wave1").get(),
					hintPriority: 1,
				}
			);
		case "frequency1":
			return (
				toBeSolved.wave1?.frequency && {
					param: waveform.frequencyXParam("wave1"),
					target: blueprint.frequencyXParam("wave1").get(),
					hintPriority: 2,
				}
			);
		case "fm1":
			return (
				toBeSolved.wave1?.fm && {
					param: waveform.fmXParam("wave1"),
					target: blueprint.fmXParam("wave1").get(),
					hintPriority: -1,
				}
			);
		case "shape1":
			return (
				toBeSolved.wave1?.shape && {
					param: waveform.shapeXParam("wave1"),
					target: blueprint.shapeXParam("wave1").get(),
					hintPriority: 1,
				}
			);
		case "offset1":
			return (
				toBeSolved.wave1?.offset && {
					param: waveform.offsetXParam("wave1"),
					target: blueprint.offsetXParam("wave1").get(),
					hintPriority: 0,
				}
			);
		case "speed1":
			return (
				toBeSolved.wave1?.speed && {
					param: waveform.speedXParam("wave1"),
					target: blueprint.speedXParam("wave1").get(),
					hintPriority: 2,
				}
			);

		case "amplitude2":
			return (
				toBeSolved.wave2?.amplitude && {
					param: waveform.amplitudeXParam("wave2"),
					target: blueprint.amplitudeXParam("wave2").get(),
					hintPriority: 2,
				}
			);
		case "am2":
			return (
				toBeSolved.wave2?.am && {
					param: waveform.amXParam("wave2"),
					target: blueprint.amXParam("wave2").get(),
					hintPriority: 1,
				}
			);
		case "frequency2":
			return (
				toBeSolved.wave2?.frequency && {
					param: waveform.frequencyXParam("wave2"),
					target: blueprint.frequencyXParam("wave2").get(),
					hintPriority: 2,
				}
			);
		case "fm2":
			return (
				toBeSolved.wave2?.fm && {
					param: waveform.fmXParam("wave2"),
					target: blueprint.fmXParam("wave2").get(),
					hintPriority: -1,
				}
			);
		case "shape2":
			return (
				toBeSolved.wave2?.shape && {
					param: waveform.shapeXParam("wave2"),
					target: blueprint.shapeXParam("wave2").get(),
					hintPriority: 1,
				}
			);
		case "offset2":
			return (
				toBeSolved.wave2?.offset && {
					param: waveform.offsetXParam("wave2"),
					target: blueprint.offsetXParam("wave2").get(),
					hintPriority: 0,
				}
			);
		case "speed2":
			return (
				toBeSolved.wave2?.speed && {
					param: waveform.speedXParam("wave2"),
					target: blueprint.speedXParam("wave2").get(),
					hintPriority: 2,
				}
			);
	}
};

export class Device extends Container {
	blueprint: Waveform;
	waveform: Waveform;
	onEnd: (isSolved: boolean, isHinted: boolean) => void;
	useHint: () => boolean;
	getHintsLeft: () => number;
	batteryLights: Sprite[];
	knobs: Knob[];

	constructor(
		options: ContainerOptions & {
			targetWaveData: CombinedWaveData;
			initialWaveData: CombinedWaveData;
			onEnd: (isSolved: boolean, isHinted: boolean) => void;
			useHint: () => boolean;
			getHintsLeft: () => number;
			onMovedSlider: () => void;
			level: Level;
		},
	) {
		super(options);
		this.onEnd = options.onEnd;
		this.useHint = options.useHint;
		this.getHintsLeft = options.getHintsLeft;
		const darkOverlay = this.addChild(
			new Graphics().rect(-1000, -1000, 2000, 2000).fill("#20200080"),
		);
		darkOverlay.interactive = true;
		darkOverlay.on("click", (event) => {
			if (event.currentTarget === darkOverlay) {
				this.onEnd(false, false);
			}
		});
		darkOverlay.on("tap", (event) => {
			if (event.currentTarget === darkOverlay) {
				this.onEnd(false, false);
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
				color: new Color("#6d381380"),
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
		this.redrawBatteryLights();

		this.knobs = [];
		for (const knobSpec of options.level.device) {
			const data = getParamAndTarget(
				this.waveform,
				this.blueprint,
				knobSpec.param,
				options.level.toBeSolved,
			);
			if (!data) {
				continue;
			}
			const {
				param: { range, get, set, solve },
				target: desiredValue,
				hintPriority,
			} = data;
			if (!range) {
				continue;
			}
			const commonProps = {
				x: knobSpec.x,
				y: knobSpec.y,
				param: { range, get, set, solve },
				desiredValue,
				onMovedSlider: options.onMovedSlider,
				hintPriority,
			};
			switch (knobSpec.type) {
				case "vertical-slider":
					this.knobs.push(
						this.addChild(
							new Slider({
								...commonProps,
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
								...commonProps,
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
								...commonProps,
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
								...commonProps,
								orientation: "horizontal",
							}),
						),
					);
					break;
				case "horizontal-buttons":
					this.knobs.push(
						this.addChild(
							new HorizontalButtons({
								...commonProps,
							}),
						),
					);
					break;
				case "pulse":
					this.knobs.push(
						this.addChild(
							new PulseButton({
								...commonProps,
							}),
						),
					);
					break;
				case "shape":
					this.knobs.push(
						this.addChild(
							new ShapeButton({
								...commonProps,
							}),
						),
					);
					break;
				case "speed1":
					this.knobs.push(
						this.addChild(
							new SpeedButtons({
								...commonProps,
								id: "01",
							}),
						),
					);
					break;
				case "speed2":
					this.knobs.push(
						this.addChild(
							new SpeedButtons({
								...commonProps,
								id: "02",
							}),
						),
					);
					break;
				case "switch":
					this.knobs.push(
						this.addChild(
							new Switch({
								...commonProps,
							}),
						),
					);
					break;
			}
		}
	}

	askForHelp() {
		if (this.useHint()) {
			for (const priority of [2, 1, 0]) {
				const prioKnobs = this.knobs.filter(
					(knob) =>
						knob.hintPriority === priority && !knob.isSolved(),
				);
				if (prioKnobs.length > 0) {
					randomItem(prioKnobs).solve();
					break;
				}
			}
		}
		this.redrawBatteryLights();
	}

	redrawBatteryLights() {
		const hintsLeft = this.getHintsLeft();
		this.batteryLights.forEach((light, index) => {
			light.visible = index < hintsLeft;
		});
	}

	isMatching = false;
	matchedSince = 0;
	update(ticker: Ticker) {
		if (this.isMatching) {
			this.matchedSince += ticker.deltaMS / 1000;
			// if (this.matchedSince > 0.7) {
			// 	this.onEnd(
			// 		true,
			// 		this.knobs.some((knob) => knob.hinted),
			// 	);
			// }
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
			this.knobs.forEach((knob) => knob.freeze());
			navigator.vibrate?.(200);
			engine().audio.playSound("Win");
			this.addChild(
				new AnimatedSprite({
					scale: 2,
					x: -500,
					y: -870,
					textures: Assets.get("DeviceWin").animations["DeviceWin"],
					animationSpeed: 15 / 60,
					autoPlay: true,
					loop: false,
					onComplete: () => {
						this.onEnd(
							true,
							this.knobs.some((knob) => knob.hinted),
						);
					},
				}),
			);
			// console.log("MATCH!");
			// console.log(this.waveform.waveData, this.blueprint.waveData);
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
	solve?: (target: number) => number;
};

export type Param = {
	range: Range;
	get: () => number;
	set: (newValue: number) => void;
	solve?: (target: number) => number;
};

type KnobOptions = ContainerOptions & {
	param: Param;
	desiredValue: number;
	hintPriority: number;
	onMovedSlider: () => void;
};

export class Knob extends Container {
	param: Param;
	desiredValue: number;
	onMovedSlider: () => void;
	hinted = false;
	hintPriority;
	constructor(options: KnobOptions) {
		super(options);
		this.param = options.param;
		this.desiredValue = options.desiredValue;
		this.hintPriority = options.hintPriority;
		this.onMovedSlider = options.onMovedSlider;
	}

	solve() {
		this.param.set(this.desiredValue);
		this.hinted = true;
	}

	isFrozen = false;
	freeze() {
		this.isFrozen = true;
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

	minY = 160;
	maxY = -this.minY;
	redraw() {}
	update(ticker: Ticker) {
		if (this.isFrozen) {
			return;
		}
		const dt = ticker.deltaMS / 1000;
		const speed = 8;

		let value = this.param.get();
		if (this.wrapAround) {
			const targets = [
				this.target,
				this.target - this.param.range.max,
				this.target + this.param.range.max,
			];
			targets.sort((a, b) => Math.abs(a - value) - Math.abs(b - value));
			this.target = targets[0];
		}

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
		this.hinted = true;
	}

	isPressed = false;
	previousY = 0;
	onpointerdown = (event: FederatedPointerEvent) => {
		if (!this.hinted) {
			this.isPressed = true;
			this.previousY = event.getLocalPosition(this).y;
		}
	};

	factor = 1;
	onglobalpointermove = (event: FederatedPointerEvent) => {
		if (!this.isPressed) {
			return;
		}

		const delta = event.getLocalPosition(this).y - this.previousY;
		const valueDelta =
			(-delta / (this.minY - this.maxY)) *
			(this.param.range.max - this.param.range.min) *
			this.factor;
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
			((-actualValueDelta /
				(this.param.range.max - this.param.range.min)) *
				(this.minY - this.maxY)) /
			this.factor;
		this.previousY += actualDelta;
		this.param.set(newValue);
		this.target = this.param.get();
	};

	onpointerup = (this.onpointerupoutside = () => {
		if (this.isPressed) {
			this.isPressed = false;
			this.target = snap(this.param.range, this.param.get());
			this.onMovedSlider();
		}
	});
}

const snap = (range: Range, value: number) => {
	const { step = 1 } = range;
	return Math.round(value / step) * step;
};

export class Slider extends AbstractSlider {
	knob: Sprite;
	id: string;

	constructor(
		options: KnobOptions & {
			orientation: "vertical" | "horizontal";
			wrapAround: boolean;
			id: string;
		},
	) {
		super(options);
		this.id = options.id;
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
		const hitArea = new Rectangle(-55, -205, 110, 410);
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

	solve() {
		super.solve();
		this.addChildAt(
			new Sprite({
				texture: Assets.get(`Slider${this.id}Lock.png`),
				anchor: 0.5,
			}),
			1,
		);
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

	minY = 50;
	maxY = -50;
	factor = 0.3;
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
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get(`Slider3WheelShadow.png`),
			}),
		);

		this.interactive = true;
		const mask = new Rectangle(-45, -120, 90, 260);
		this.knob.mask = new Graphics()
			.rect(mask.x, mask.y, mask.width, mask.height)
			.fill(); //.fill("black");
		this.addChild(this.knob.mask);

		const hitArea = new Rectangle(-50, -140, 100, 300);
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

	solve() {
		this.target = this.param.solve!(this.desiredValue);
		this.hinted = true;
		this.addChild(
			new Sprite({
				texture: Assets.get(`Slider3Lock.png`),
				anchor: 0.5,
			}),
		);
	}

	isSolved() {
		return false;
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
		options: ContainerOptions & {
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

export class PulseButton extends Knob {
	lights: Sprite[];

	constructor(options: KnobOptions) {
		super(options);

		const button = this.addChild(
			new Sprite({
				texture: Assets.get("PulseButton.png"),
				anchor: 0.5,
			}),
		);
		button.interactive = true;
		const hitArea = new Rectangle(-70, -85, 140, 170);
		button.hitArea = hitArea;
		button.on("pointerdown", () => {
			const value = options.param.get();
			const newValue = mod(value + 1, options.param.range.max + 1);
			options.param.set(newValue);
			this.redraw();
		});
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF80"),
		// );

		this.lights = [];
		for (const id of ["01", "02", "03"]) {
			const light = this.addChild(
				new Sprite({
					texture: Assets.get(`PulseLight_${id}.png`),
					anchor: 0.5,
				}),
			);
			light.visible = false;
			this.lights.push(light);
		}
		this.redraw();
	}

	redraw() {
		this.lights.forEach((light, index) => {
			light.visible = this.param.get() > index;
		});
	}

	solve() {
		super.solve();
		this.addChild(
			new Sprite({
				texture: Assets.get(`PulseLock.png`),
				anchor: 0.5,
			}),
		);
	}
}

export class ShapeButton extends Knob {
	button: Sprite;
	lights: Sprite[];

	constructor(options: KnobOptions) {
		super(options);

		const base = this.addChild(
			new Sprite({
				texture: Assets.get("ShapeButtonBase.png"),
				anchor: 0.5,
			}),
		);
		base.interactive = true;
		const hitArea = new Rectangle(-70, -85, 140, 170);
		base.hitArea = hitArea;
		base.on("pointerdown", () => {
			const value = options.param.get();
			const newValue = mod(value + 1, options.param.range.max + 1);
			options.param.set(newValue);
			this.redraw();
		});
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF60"),
		// );

		this.button = this.addChild(
			new Sprite({
				anchor: 0.5,
			}),
		);

		this.lights = [];
		for (const id of ["01", "02", "03"]) {
			const light = this.addChild(
				new Sprite({
					texture: Assets.get(`ShapeButtonLight_${id}.png`),
					anchor: 0.5,
				}),
			);
			light.visible = false;
			this.lights.push(light);
		}
		this.redraw();
	}

	redraw() {
		this.button.texture = Assets.get(
			`ShapeButton_0${this.param.get() + 1}.png`,
		);
		this.lights.forEach((light, index) => {
			light.visible = this.param.get() == index;
		});
	}

	solve() {
		super.solve();
		this.addChild(
			new Sprite({
				texture: Assets.get(`ShapeLock.png`),
				anchor: 0.5,
			}),
		);
	}
}

export class SpeedButton extends Container {
	delta: number;

	constructor(
		options: ContainerOptions & {
			param: Param;
			delta: number;
			hitArea: Rectangle;
			redraw: () => void;
		},
	) {
		super(options);
		this.delta = options.delta;

		const button = this.addChild(
			new Sprite({
				texture: Texture.EMPTY,
			}),
		);
		button.interactive = true;
		const hitArea = options.hitArea;
		button.hitArea = hitArea;
		button.on("pointerdown", () => {
			const value = options.param.get();
			const newValue = value + this.delta;
			if (
				newValue >= options.param.range.min &&
				newValue <= options.param.range.max
			) {
				options.param.set(newValue);
				options.redraw();
			}
		});

		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF80"),
		// );
	}
}

export class SpeedButtons extends Knob {
	labelX: Label;
	constructor(options: KnobOptions & { id: string }) {
		super(options);
		const {
			param: {
				range: { step = 1 },
			},
		} = options;
		this.addChild(
			new Sprite({
				texture: Assets.get(`SpeedControl_${options.id}.png`),
				anchor: 0.5,
			}),
		);
		this.addChild(
			new SpeedButton({
				param: options.param,
				delta: -step,
				hitArea: new Rectangle(-135, -55, 75, 110),
				redraw: () => this.redraw(),
			}),
		);
		this.addChild(
			new SpeedButton({
				param: options.param,
				delta: step,
				hitArea: new Rectangle(60, -55, 75, 110),
				redraw: () => this.redraw(),
			}),
		);
		this.labelX = this.addChild(
			new Label({
				x: 1,
				y: -4,
				scale: 1.5,
				style: {
					fontFamily: "Jersey10",
					fill: "#0F360A",
					fontSize: 48,
				},
			}),
		);
		this.redraw();
	}

	redraw() {
		const v = this.param.get() * 2;
		this.labelX.text = `${v > 0 ? "+" : ""}${v}`;
	}

	solve() {
		super.solve();
		this.addChild(
			new Sprite({
				texture: Assets.get(`SpeedControlLock.png`),
				anchor: 0.5,
			}),
		);
	}
}

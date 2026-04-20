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
			y: -340,
			w: 250,
			h: 100,
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
				hitArea: new Rectangle(-225, -500, 450, 1000),
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

		for (const knobSpec of options.level.device) {
			const {
				param: { range, get, set },
				target,
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
					this.addChild(
						new Slider({
							x: knobSpec.x,
							y: knobSpec.y,
							orientation: "vertical",
							param,
							target,
						}),
					);
					break;
				case "horizontal-slider":
					this.addChild(
						new Slider({
							x: knobSpec.x,
							y: knobSpec.y,
							orientation: "horizontal",
							param,
							target,
						}),
					);
					break;
				case "knob":
					this.addChild(
						new Knob({
							x: knobSpec.x,
							y: knobSpec.y,
							param,
							target,
						}),
					);
					break;
				case "vertical-buttons":
					this.addChild(
						new VerticalButtons({
							x: knobSpec.x,
							y: knobSpec.y,
							param,
						}),
					);
					break;
				case "horizontal-buttons":
					this.addChild(
						new HorizontalButtons({
							x: knobSpec.x,
							y: knobSpec.y,
							param,
						}),
					);
					break;
				case "switch":
					this.addChild(
						new Switch({ x: knobSpec.x, y: knobSpec.y, param }),
					);
					break;
			}
		}
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

export abstract class AbstractSlider extends Container {
	param: Param;
	target: number;
	target2: number;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
			target: number;
		},
	) {
		super(options);
		const { param, target } = options;
		this.param = param;
		this.target = target;
		this.target2 = param.get();
	}

	minY = 115;
	maxY = -115;
	redraw() {}
	update(ticker: Ticker) {
		const dt = ticker.deltaMS / 1000;
		const speed = 8;

		let value = this.param.get();
		if (value < this.target2) {
			value += dt * speed;
			value = Math.min(value, this.target2);
			this.param.set(value);
		}
		if (value > this.target2) {
			value -= dt * speed;
			value = Math.max(value, this.target2);
			this.param.set(value);
		}
		this.redraw();
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
		const newValue = Math.max(
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
		this.target2 = newValue;
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
		this.target2 = snap(this.param.range, this.param.get(), this.target);
	});
}

const snap = (range: Range, value: number, target: number) => {
	const { step = 1 } = range;
	const nTarget = target / step;

	let nValue = value / step;
	if (nValue < nTarget) {
		nValue = Math.round(nValue);
	} else if (nValue > nTarget) {
		nValue = Math.round(nValue);
	}
	return nValue * step;
};

export class Slider extends AbstractSlider {
	knob: Sprite;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
			target: number;
			orientation: "vertical" | "horizontal";
		},
	) {
		super(options);
		if (options.orientation === "horizontal") {
			this.angle += 90;
		}

		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("SliderSocket.png"),
			}),
		);
		this.knob = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Slider.png"),
			}),
		);

		this.interactive = true;
		const hitArea = new Rectangle(-45, -150, 90, 300);
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

export class Knob extends AbstractSlider {
	knob: Sprite;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
			target: number;
		},
	) {
		super(options);
		this.angle = 90;

		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Knob_01_Socket.png"),
			}),
		);
		this.knob = this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Knob_01.png"),
			}),
		);

		this.interactive = true;
		const hitArea = new Rectangle(-80, -80, 160, 160);
		this.hitArea = hitArea;
		// Uncomment to visualize hit area
		// this.addChild(
		// 	new Graphics()
		// 		.rect(hitArea.x, hitArea.y, hitArea.width, hitArea.height)
		// 		.fill("#FF00FF20"),
		// );
	}

	redraw() {
		const angleRange = 120;
		this.knob.angle =
			-angleRange / 2 +
			((this.param.get() - this.param.range.min) /
				(this.param.range.max - this.param.range.min)) *
				angleRange -
			90;
	}

	// onclick = (this.ontap = (event: FederatedPointerEvent) => {
	// 	const clickedY = event.getLocalPosition(this).y;
	// 	const value = this.param.get();
	// 	if (clickedY > 0 && value >= this.param.minValue + 1) {
	// 		this.param.change(-1, 8);
	// 	} else if (clickedY < 0 && value <= this.param.maxValue - 1) {
	// 		this.param.change(1, 8);
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

export class VerticalButtons extends Container {
	constructor(options: ViewContainerOptions & { param: Param }) {
		super(options);
		const {
			param: {
				range: { step = 1 },
			},
		} = options;
		this.addChild(
			new Button({
				y: 0,
				param: options.param,
				texture: "MoveDownBtn.png",
				delta: -step,
				hitArea: new Rectangle(-55, 0, 110, 65),
			}),
		);
		this.addChild(
			new Button({
				y: 0,
				param: options.param,
				texture: "MoveUpBtn.png",
				delta: step,
				hitArea: new Rectangle(-55, -65, 110, 65),
			}),
		);
	}
}

export class HorizontalButtons extends Container {
	constructor(options: ViewContainerOptions & { param: Param }) {
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

export class Switch extends Container {
	switch: Sprite;
	param: Param;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
		},
	) {
		super(options);
		this.param = options.param;

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
			const newValue = 1 - value;
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
			this.param.get() == 1 ? "ButtonOn.png" : "ButtonOff.png",
		);
	}
}

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
import { Label } from "../ui/Label";

export class Device extends Container {
	blueprint: Waveform;
	waveform: Waveform;
	onMatch: () => void;

	constructor(
		options: ViewContainerOptions & {
			targetWaveData: CombinedWaveData;
			initialWaveData: CombinedWaveData;
			onMatch: () => void;
		},
	) {
		super(options);
		this.onMatch = options.onMatch;
		this.addChild(
			new Sprite({
				anchor: 0.5,
				y: -340,
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
			}),
		);
		this.waveform = this.addChild(
			new Waveform({
				...waveformOptions,
				waveData: options.initialWaveData,
				color: new Color("#6d3813"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Device.png"),
			}),
		);
		this.addChild(new Battery({ x: -165, y: -420 }));

		this.addChild(
			new Slider({
				x: -125,
				y: 100,
				orientation: "vertical",
				param: this.waveform.baselineParam,
				target: this.blueprint.baselineParam.get(),
			}),
		);

		this.addChild(
			new Slider({
				x: 125,
				y: 100,
				orientation: "vertical",
				param: this.waveform.amplitude1Param,
				target: this.blueprint.amplitude1Param.get(),
			}),
		);

		this.addChild(
			new Knob({
				x: 0,
				y: 100,
				param: this.waveform.frequency1Param,
				target: this.blueprint.frequency1Param.get(),
			}),
		);

		// this.addChild(
		// 	new Slider({
		// 		y: 300,
		// 		orientation: "horizontal",
		// 		param: this.waveform.phase1Param,
		// 		target: this.blueprint.phase1Param.get(),
		// 	}),
		// );

		this.addChild(
			new Slider({
				y: 300,
				orientation: "horizontal",
				param: this.waveform.speed1Param,
				target: this.blueprint.speed1Param.get(),
			}),
		);
	}

	isMatching = false;
	matchedSince = 0;
	update(ticker: Ticker) {
		if (this.isMatching) {
			this.matchedSince += ticker.deltaMS / 1000;
			if (this.matchedSince > 1) {
				this.onMatch();
			}
		}
		this.blueprint.update(ticker);
		this.waveform.update(ticker);
		if (
			combinedWaveDataMatch(
				this.waveform.targetWaveData,
				this.blueprint.targetWaveData,
			)
		) {
			this.waveform.color = new Color("green");
			this.eventMode = "none";
			this.isMatching = true;
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

export class TestButton extends Container {
	constructor(options: ViewContainerOptions & { onClick: () => void }) {
		super(options);
		const button = this.addChild(
			new Graphics().rect(0, 0, 100, 100).fill("blue"),
		);
		button.pivot = 50;
		button.interactive = true;
		button.on("pointerdown", options.onClick);
	}
}

export class TestButtons extends Container {
	constructor(
		options: ViewContainerOptions & {
			callback: (delta: number) => void;
			getValue: () => number;
		},
	) {
		super(options);

		const label = this.addChild(
			new Label({ text: String(options.getValue()) }),
		);
		this.addChild(
			new TestButton({
				x: -150,
				onClick: () => {
					options.callback(-1);
					label.text = String(options.getValue());
				},
			}),
		);
		this.addChild(
			new TestButton({
				x: 150,
				onClick: () => {
					options.callback(1);
					label.text = String(options.getValue());
				},
			}),
		);
	}
}

export class BasicButtons<T extends string> extends Container {
	constructor(
		options: ViewContainerOptions & { key: T; object: Record<T, number> },
	) {
		super(options);

		this.addChild(
			new TestButtons({
				callback: (delta) => {
					options.object[options.key] += delta;
				},
				getValue: () => options.object[options.key],
			}),
		);
	}
}

export type Param = {
	minValue: number;
	maxValue: number;
	get: () => number;
	set: (newValue: number, updateSpeed: number) => void;
};

export abstract class AbstractSlider extends Container {
	param: Param;
	target: number;

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
	}

	minY = 115;
	maxY = -115;
	abstract update(): void;

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
			(this.param.maxValue - this.param.minValue);
		const previousValue = this.param.get();
		const newValue = Math.max(
			this.param.minValue,
			Math.min(this.param.maxValue, previousValue + valueDelta),
		);
		const actualValueDelta = newValue - previousValue;
		const actualDelta =
			(-actualValueDelta / (this.param.maxValue - this.param.minValue)) *
			(this.minY - this.maxY);
		this.previousY += actualDelta;
		this.param.set(newValue, Infinity);
		this.update();
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
		if (this.param.get() < this.target) {
			this.param.set(Math.ceil(this.param.get()), 8);
		} else if (this.param.get() > this.target) {
			this.param.set(Math.floor(this.param.get()), 8);
		}
		this.update();
	});
}

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

		this.update();
	}

	update() {
		this.knob.y =
			this.minY +
			((this.param.get() - this.param.minValue) /
				(this.param.maxValue - this.param.minValue)) *
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

		this.update();
	}

	update() {
		const angleRange = 120;
		this.knob.angle =
			-angleRange / 2 +
			((this.param.get() - this.param.minValue) /
				(this.param.maxValue - this.param.minValue)) *
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

class Battery extends Container {
	constructor(options: ViewContainerOptions) {
		super(options);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("BatteryBody.png"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Battery01.png"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Battery02.png"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Battery03.png"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Battery04.png"),
			}),
		);
		this.addChild(
			new Sprite({
				anchor: 0.5,
				texture: Assets.get("Battery05.png"),
			}),
		);
	}
}

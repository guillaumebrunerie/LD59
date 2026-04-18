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
import { Waveform, type CombinedWaveData } from "./Waveform";
import { Label } from "../ui/Label";

export class Device extends Container {
	blueprint: Waveform;
	waveform: Waveform;

	constructor(
		options: ViewContainerOptions & {
			targetWaveData: CombinedWaveData;
			initialWaveData: CombinedWaveData;
		},
	) {
		super(options);
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

		this.addChild(
			new Slider({
				x: -125,
				y: 100,
				param: this.waveform.baselineParam,
				orientation: "vertical",
			}),
		);

		this.addChild(
			new Slider({
				x: 125,
				y: 100,
				param: this.waveform.amplitude1Param,
				orientation: "vertical",
			}),
		);

		this.addChild(
			new Knob({
				x: 0,
				y: 100,
				param: this.waveform.frequency1Param,
			}),
		);

		this.addChild(
			new Slider({
				y: 300,
				param: this.waveform.speed1Param,
				orientation: "horizontal",
			}),
		);

		// // Baseline
		// this.addChild(
		// 	new BasicButtons({
		// 		y: -150,
		// 		key: "baseline",
		// 		object: this.waveform.targetWaveData,
		// 	}),
		// );

		// // Amplitude
		// this.addChild(
		// 	new BasicButtons({
		// 		y: 0,
		// 		key: "base",
		// 		object: this.waveform.targetWaveData.wave1.amplitude,
		// 	}),
		// );
		// this.addChild(
		// 	new BasicButtons({
		// 		y: 125,
		// 		key: "amplitude",
		// 		object: this.waveform.targetWaveData.wave1.amplitude,
		// 	}),
		// );
		// this.addChild(
		// 	new TestButtons({
		// 		y: 250,
		// 		callback: (delta) => this.waveform.amplitudeSpeedChange1(delta),
		// 		getValue: () =>
		// 			this.waveform.targetWaveData.wave1.amplitude.speed,
		// 	}),
		// );

		// // Waves
		// this.addChild(
		// 	new BasicButtons({
		// 		y: 400,
		// 		key: "base",
		// 		object: this.waveform.targetWaveData.wave1.waves,
		// 	}),
		// );
		// this.addChild(
		// 	new BasicButtons({
		// 		y: 525,
		// 		key: "amplitude",
		// 		object: this.waveform.targetWaveData.wave1.waves,
		// 	}),
		// );
		// this.addChild(
		// 	new TestButtons({
		// 		y: 650,
		// 		callback: (delta) => this.waveform.wavesSpeedChange1(delta),
		// 		getValue: () => this.waveform.targetWaveData.wave1.waves.speed,
		// 	}),
		// );

		// // Speed
		// this.addChild(
		// 	new TestButtons({
		// 		y: 800,
		// 		callback: (delta) => this.waveform.speedChange1(delta),
		// 		getValue: () => this.waveform.targetWaveData.wave1.speed,
		// 	}),
		// );
	}

	update(ticker: Ticker) {
		this.blueprint.update(ticker);
		this.waveform.update(ticker);
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
	change: (delta: number, updateSpeed: number) => void;
};

export abstract class AbstractSlider extends Container {
	param: Param;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
		},
	) {
		super(options);
		const { param } = options;
		this.param = param;
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
		this.param.change(actualValueDelta, 100);
		this.update();
	};

	onpointerup = (this.onpointerupoutside = () => {
		this.isPressed = false;
		const delta = Math.round(this.param.get()) - this.param.get();
		this.param.change(delta, 8);
		this.update();
	});

	onclick = (this.ontap = (event: FederatedPointerEvent) => {
		const clickedY = event.getLocalPosition(this).y;
		const clickedValue =
			this.param.minValue +
			((clickedY - this.minY) / (this.maxY - this.minY)) *
				(this.param.maxValue - this.param.minValue);

		const value = this.param.get();
		if (clickedValue < value - 1 && value >= this.param.minValue + 1) {
			this.param.change(-1, 8);
		} else if (
			clickedValue > value + 1 &&
			value <= this.param.maxValue - 1
		) {
			this.param.change(1, 8);
		}
		this.update();
	});
}

export class Slider extends AbstractSlider {
	knob: Sprite;
	param: Param;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
			orientation: "vertical" | "horizontal";
		},
	) {
		super(options);
		const { param } = options;
		this.param = param;
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
}

export class Knob extends AbstractSlider {
	knob: Sprite;
	param: Param;

	constructor(
		options: ViewContainerOptions & {
			param: Param;
		},
	) {
		super(options);
		const { param } = options;
		this.param = param;
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
}

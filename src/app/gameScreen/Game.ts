import { Color, type DestroyOptions, Graphics, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { WaveForm } from "./WaveForm";
import { MapScreen } from "../mapScreen/MapScreen";
import { Label } from "../ui/Label";

export const gameWidth = 1000;
export const gameHeight = 1000;

export class Game extends Container {
	ticker: Ticker;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addToTicker(this);

		const blueprint = this.addChild(
			new WaveForm(
				{
					baseline: 1,
					wave1: {
						amplitude: {
							base: 3,
							amplitude: 1,
							speed: 3,
							phase: 0,
						},
						waves: {
							base: 3,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						speed: 1,
						phase: 0,
					},
					wave2: {
						amplitude: {
							base: 0,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						waves: {
							base: 0,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						speed: 0,
						phase: 0,
					},
				},
				1000,
				300,
				new Color("grey"),
			),
		);
		blueprint.y = -500;
		this.addToTicker(blueprint);

		const waveForm = this.addChild(
			new WaveForm(
				{
					baseline: 1,
					wave1: {
						amplitude: {
							base: 1,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						waves: {
							base: 3,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						speed: 0,
						phase: 0,
					},
					wave2: {
						amplitude: {
							base: 0,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						waves: {
							base: 0,
							amplitude: 0,
							speed: 0,
							phase: 0,
						},
						speed: 0,
						phase: 0,
					},
				},
				1000,
				300,
				new Color("red"),
			),
		);
		waveForm.y = -500;
		this.addToTicker(waveForm);

		const makeButton = (x: number, y: number, callback: () => void) => {
			const button = this.addChild(
				new Graphics().rect(x, y, 100, 100).fill("blue"),
			);
			button.pivot = 50;
			button.interactive = true;
			button.on("pointerdown", callback);
		};
		const makeButtons = (
			y: number,
			callback: (delta: number) => void,
			getValue: () => number,
		) => {
			const label = this.addChild(
				new Label({ x: 0, y, text: String(getValue()) }),
			);
			makeButton(-150, y, () => {
				callback(-1);
				label.text = String(getValue());
			});
			makeButton(150, y, () => {
				callback(+1);
				label.text = String(getValue());
			});
		};
		const makeBasicButtons = <T extends string>(
			y: number,
			key: T,
			object: Record<T, number>,
		) => {
			makeButtons(
				y,
				(delta) => {
					object[key] += delta;
				},
				() => object[key],
			);
		};

		makeBasicButtons(-150, "baseline", waveForm.targetWaveData);
		makeBasicButtons(0, "base", waveForm.targetWaveData.wave1.amplitude);
		makeBasicButtons(
			125,
			"amplitude",
			waveForm.targetWaveData.wave1.amplitude,
		);
		makeButtons(
			250,
			(delta) => waveForm.amplitudeSpeedChange1(delta),
			() => waveForm.targetWaveData.wave1.amplitude.speed,
		);
		makeBasicButtons(400, "base", waveForm.targetWaveData.wave1.waves);
		makeBasicButtons(525, "amplitude", waveForm.targetWaveData.wave1.waves);
		makeButtons(
			650,
			(delta) => waveForm.wavesSpeedChange1(delta),
			() => waveForm.targetWaveData.wave1.waves.speed,
		);
		makeButtons(
			800,
			(delta) => {
				waveForm.speedChange1(delta);
			},
			() => waveForm.targetWaveData.wave1.speed,
		);
		// makeBasicButtons(350, "speed", waveForm.targetWaveData.wave1.amplitude);

		const button = this.addChild(
			new Graphics().rect(-300, 700, 100, 100).fill("red"),
		);
		button.pivot = 50;
		button.interactive = true;
		button.on("pointerdown", () => {
			engine().navigation.showScreen(MapScreen);
		});
	}

	start() {
		this.ticker.start();
	}

	pause() {
		super.pause();
		this.ticker.stop();
	}

	resume() {
		super.resume();
		this.ticker.start();
	}

	destroy(options?: DestroyOptions) {
		this.ticker.destroy();
		super.destroy(options);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => {
			if (!this.destroyed) {
				this.ticker.remove(callback);
			}
		});
	}

	update() {}
}

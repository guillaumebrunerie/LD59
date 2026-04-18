import { Color, type DestroyOptions, Graphics, Point, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Player } from "./Player";
import { Background } from "./Background";
import { engine } from "../../getEngine";
import { WaveForm } from "./WaveForm";
import { Tile } from "./Tile";
import { GameMap } from "./GameMap";

export const gameWidth = 1000;
export const gameHeight = 1000;

export class Game extends Container {
	ticker: Ticker;
	player: Player;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.player = this.addChild(new Player({ game: this, scale: 0.3 }));
		this.addToTicker(this);

		const blueprint = this.addChild(
			new WaveForm(
				{
					baseline: -2,
					amplitude: 3,
					waves: 4,
					// amplitude: {
					// 	baseline: 10,
					// 	amplitude: 3,
					// 	waves: 2,
					// 	speed: 1,
					// 	phaseShift: 0,
					// },
					// waves: {
					// 	baseline: 15,
					// 	amplitude: 1,
					// 	waves: 5,
					// 	speed: 2,
					// 	phaseShift: 0,
					// },
					speed: 1,
					phase: 3,
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
					baseline: 0,
					amplitude: 4,
					waves: 2,
					speed: 0,
					phase: 0,
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
		const makeButtons = (y: number, callback: (delta: number) => void) => {
			makeButton(-150, y, () => {
				callback(-1);
			});
			makeButton(150, y, () => {
				callback(+1);
			});
		};
		makeButtons(-150, (delta) => {
			waveForm.baselineChange(delta);
			console.log(waveForm.waveData);
			console.log(blueprint.waveData);
		});
		makeButtons(0, (delta) => waveForm.amplitudeChange(delta));
		makeButtons(150, (delta) => waveForm.wavesChange(delta));
		makeButtons(300, (delta) => {
			waveForm.speedChange(delta);
			console.log(waveForm.targetWaveData);
			console.log(blueprint.waveData);
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

	click(position: Point) {
		if (!this.ticker.started) {
			return;
		}

		engine().audio.playSound("WebStart");

		this.player.position = position;
	}
}

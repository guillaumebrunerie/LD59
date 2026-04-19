import { Ticker, type DestroyOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { SoundButton } from "../ui/SoundButton";
import { PauseButton } from "../ui/PauseButton";
import { PausePopup } from "../pausePopup/PausePopup";
import { GameMap } from "./GameMap";
import { Device } from "../gameScreen/Device";
import { level2 } from "../gameScreen/levels";
import { generateCity } from "./city";

const TILE_SIZE = 300;

export class MapScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	gameMap: GameMap;
	pauseButton: PauseButton;
	soundButton: SoundButton;
	ticker: Ticker;
	level = level2;
	city = generateCity(this.level);

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addToTicker(this);

		this.gameContainer = this.addChild(new Container());
		this.gameMap = this.gameContainer.addChild(
			new GameMap({
				x: -TILE_SIZE * 5,
				y: -TILE_SIZE * 4,
				city: this.city,
				startLevel: (i: number, j: number) => this.startLevel(i, j),
			}),
		);

		this.pauseButton = this.addChild(
			new PauseButton({
				x: 60,
				y: 60,
			}),
		);
		this.soundButton = this.addChild(new SoundButton());
	}

	device?: Device;
	startLevel(i: number, j: number) {
		const antenna = this.city[i][j].antenna;
		if (!antenna) {
			throw new Error("No antenna at this location");
		}
		const device = this.addChild(
			new Device({
				scale: 1.7,
				//angle: -2,
				x: 540,
				y: 1920 / 2,
				level: this.level,
				targetWaveData: antenna.blueprint,
				initialWaveData: antenna.waveform,
				onEnd: (isMatch: boolean) => {
					device.destroy();
					this.gameMap.interactive = true;
					if (isMatch) {
						this.gameMap.levelSolved(i, j);
					}
				},
			}),
		);
		this.device = device;
		this.gameMap.interactive = false;
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

	update(ticker: Ticker) {
		this.gameMap.update(ticker);
		this.device?.update(ticker);
	}

	show() {
		// this.game.start();
	}

	blur() {
		if (!engine().navigation.currentPopup) {
			engine().navigation.presentPopup(PausePopup);
		}
	}

	isLandscape = true;
	resize(width: number, height: number) {
		super.resize(width, height);
		this.gameContainer.position.set(width / 2, height / 2);
		this.isLandscape = width > height;
		this.soundButton.resize(width, height);
	}
}

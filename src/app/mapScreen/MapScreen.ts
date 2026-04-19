import { FederatedPointerEvent, Ticker, type DestroyOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { SoundButton } from "../ui/SoundButton";
import { PauseButton } from "../ui/PauseButton";
import { PausePopup } from "../pausePopup/PausePopup";
import { GameMap } from "./GameMap";

export class MapScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	gameMap: GameMap;
	pauseButton: PauseButton;
	soundButton: SoundButton;
	ticker: Ticker;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addToTicker(this);

		this.gameContainer = this.addChild(new Container());
		this.gameMap = this.gameContainer.addChild(new GameMap());

		this.pauseButton = this.addChild(
			new PauseButton({
				x: 60,
				y: 60,
			}),
		);
		this.soundButton = this.addChild(new SoundButton());
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

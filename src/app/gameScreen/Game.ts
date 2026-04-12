import { DestroyOptions, Point, Ticker } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Player } from "./Player";
import { Background } from "./Background";
import { engine } from "../../getEngine";

export const gameWidth = 1000;
export const gameHeight = 1000;

export class Game extends Container {
	ticker: Ticker;
	player: Player;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.addChild(new Background());
		this.player = this.addChild(new Player({ game: this, scale: 0.3 }));
		this.addToTicker(this);
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

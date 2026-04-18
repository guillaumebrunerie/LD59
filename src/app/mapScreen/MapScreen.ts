import { FederatedPointerEvent, Graphics } from "pixi.js";
import { Container } from "../../PausableContainer";
import { engine } from "../../getEngine";
import { SoundButton } from "../ui/SoundButton";
import { PauseButton } from "../ui/PauseButton";
import { PausePopup } from "../pausePopup/PausePopup";
import { GameMap } from "./GameMap";
import { GameScreen } from "../gameScreen/GameScreen";

export class MapScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	game: GameMap;
	touchArea: Graphics;
	pauseButton: PauseButton;
	soundButton: SoundButton;

	constructor() {
		super();

		this.gameContainer = this.addChild(new Container());
		this.game = this.gameContainer.addChild(new GameMap());

		this.touchArea = this.addChild(
			new Graphics().rect(0, 0, 100, 100).fill("#00000001"),
		);
		this.touchArea.interactive = true;
		this.touchArea.on("pointerdown", (e) => this.pointerDown(e));

		this.pauseButton = this.addChild(
			new PauseButton({
				x: 60,
				y: 60,
			}),
		);
		this.soundButton = this.addChild(new SoundButton());
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
		this.touchArea.clear().rect(0, 0, width, height).fill("#00000001");
		this.isLandscape = width > height;
		this.soundButton.resize(width, height);
	}

	pointerDown(_event: FederatedPointerEvent) {
		engine().navigation.showScreen(GameScreen);
	}
}

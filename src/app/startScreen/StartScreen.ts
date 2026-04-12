import { Container } from "../../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { engine } from "../../getEngine";
import { Background } from "../gameScreen/Background";
import { Assets, Graphics, Sprite } from "pixi.js";
import { SoundButton } from "../ui/SoundButton";
import { GameScreen } from "../gameScreen/GameScreen";

export class StartScreen extends Container {
	public static assetBundles = ["main"];

	background: Background;
	logo: Sprite;
	startButton: FancyButton;
	soundButton: SoundButton;

	constructor() {
		super();

		this.background = this.addChild(new Background());
		this.logo = this.addChild(
			new Sprite({
				texture: Assets.get("Logo.png"),
				anchor: 0.5,
			}),
		);
		this.startButton = this.addChild(
			new FancyButton({
				defaultView: Assets.get("StartButton.png"),
				anchor: 0.5,
			}),
		);
		this.startButton.on("pointertap", () => this.startGame());

		this.soundButton = this.addChild(new SoundButton());
	}

	resize(width: number, height: number) {
		super.resize(width, height);
		this.startButton.position.set(width / 2, (3 * height) / 4);
		this.logo.position.set(width / 2, height / 3);
		this.background.position.set(width / 2, height / 2);
		this.soundButton.resize(width, height);
	}

	async startGame() {
		engine().audio.playMusic("Music", { volume: 0.3 });
		engine().audio.playSound("Click");
		await engine().navigation.showScreen(GameScreen);
	}

	async hide() {
		const rectangle = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("black"),
		);
		rectangle.alpha = 0;
		await this.animate(rectangle, { alpha: 1 }, { duration: 0.5 });
		rectangle.destroy();
	}
}

import { ViewContainerOptions, AnimatedSprite } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "./Game";
import { getIdleAnimation } from "../utils/animation";

export class Player extends Container {
	game: Game;
	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("SpiderIdle"),
				animationSpeed: 15 / 60,
				anchor: 0.5,
				autoPlay: true,
			}),
		);
		this.game = options.game;
		this.game.addToTicker(this);
	}
	update() {}
}

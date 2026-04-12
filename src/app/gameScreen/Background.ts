import { Graphics, type ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";

export class Background extends Container {
	rect: Graphics;
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.rect = new Graphics();
		this.addChild(this.rect);
	}

	resize(width: number, height: number) {
		super.resize(width, height);
		const padding = 50;
		this.rect
			.clear()
			.rect(padding, padding, width - padding * 2, height - padding * 2)
			.fill("#00AA00");
		this.rect.position.set(-width / 2, -height / 2);
	}
}

import { Assets, Texture } from "pixi.js";
import { randomCyclic } from "../../engine/utils/random";

export const getIdleAnimation = (key: string) =>
	randomCyclic(Assets.get(key).animations[key]);

export const getAnimation = (key: string) =>
	Object.values(Assets.get(key).textures) as Texture[];

import { CompareFunction, CullMode, Engine, Material, Shader, TextureCubeMap } from "oasis-engine";
import frag from "./frag";
import vertex from "./vertex";

Shader.create("HDR-skybox", vertex, frag);

/**
 * HDRSkyBoxMaterial, use cube map from HDRLoader
 */
export class HDRSkyBoxMaterial extends Material {
  constructor(engine: Engine) {
    super(engine, Shader.find("HDR-skybox"));

    this.renderState.rasterState.cullMode = CullMode.Off;
    this.renderState.depthState.compareFunction = CompareFunction.LessEqual;
  }

  /** TextureCubeMap from HDRLoader */
  get map(): TextureCubeMap {
    return this.shaderData.getTexture("u_cube") as TextureCubeMap;
  }

  set map(v: TextureCubeMap) {
    this.shaderData.setTexture("u_cube", v);
  }
}

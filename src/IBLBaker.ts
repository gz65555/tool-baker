import {
  Camera,
  Material,
  MeshRenderer,
  PrimitiveMesh,
  RenderTarget,
  Scene,
  Shader,
  TextureCubeFace,
  TextureCube,
  TextureFilterMode,
  TextureFormat
} from "oasis-engine";
import { DecodeMode } from "./enums/DecodeMode";
import frag from "./shader/ibl_frag";
import vertex from "./shader/vertex";

const SHADER_NAME = "Oasis-IBL-baker";
Shader.create(SHADER_NAME, vertex, frag);

/**
 * Prefilterd, Mipmaped Environment map.
 */
export class IBLBaker {
  /**
   * Bake from Cube texture.
   * @param texture - Cube texture
   */
  static fromTextureCubeMap(texture: TextureCube, decodeMode: DecodeMode): TextureCube {
    const engine = texture.engine;
    const originalScene = engine.sceneManager.activeScene;
    const isPaused = engine.isPaused;
    const bakerSize = 256;

    engine.pause();

    // prepare baker scene
    const bakerScene = new Scene(engine);
    engine.sceneManager.activeScene = bakerScene;
    const bakerEntity = bakerScene.createRootEntity("IBL Baker Entity");
    const bakerCamera = bakerEntity.addComponent(Camera);
    bakerCamera.enableFrustumCulling = false;
    const bakerMaterial = new Material(engine, Shader.find(SHADER_NAME));
    const bakerRenderer = bakerEntity.addComponent(MeshRenderer);
    const bakerShaderData = bakerMaterial.shaderData;
    bakerRenderer.mesh = PrimitiveMesh.createPlane(engine, 2, 2);
    bakerRenderer.setMaterial(bakerMaterial);

    const renderColorTexture = new TextureCube(engine, bakerSize);
    const bakerMipmapCount = renderColorTexture.mipmapCount;

    renderColorTexture.filterMode = TextureFilterMode.Trilinear;
    const renderTarget = new RenderTarget(engine, bakerSize, bakerSize, renderColorTexture, TextureFormat.Depth);
    renderTarget.autoGenerateMipmaps = false;
    bakerCamera.renderTarget = renderTarget;

    // render
    bakerShaderData.setTexture("environmentMap", texture);
    bakerShaderData.enableMacro("DECODE_MODE", decodeMode + "");

    for (let face = 0; face < 6; face++) {
      for (let lod = 0; lod < bakerMipmapCount; lod++) {
        bakerShaderData.setFloat("face", face);
        const lodRoughness = lod / (bakerMipmapCount - 1); // linear
        // let lodRoughness = Math.pow(2, lod) / bakerSize;
        // if (lod === 0) {
        //   lodRoughness = 0;
        // }
        bakerShaderData.setFloat("lodRoughness", lodRoughness);

        bakerCamera.render(TextureCubeFace.PositiveX + face, lod);
      }
    }

    // destroy
    bakerCamera.renderTarget = null;
    bakerScene.destroy();
    renderTarget.destroy();

    // revert
    engine.sceneManager.activeScene = originalScene;
    !isPaused && engine.resume();

    return renderColorTexture;
  }
}

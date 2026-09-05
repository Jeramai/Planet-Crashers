import { SRGBColorSpace } from 'three';

export function setUpTexture(texture) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
}

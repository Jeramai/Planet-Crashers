export const assetPrefix = process.env.NODE_ENV === 'production' ? '/Planet-Crashers/' : '/';

export const textureUrl = (name) => `${assetPrefix}textures/${name}`;
export const soundUrl = (name) => `${assetPrefix}sounds/${name}.mp3`;

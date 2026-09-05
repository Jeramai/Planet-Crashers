export const assetPrefix = process.env.NODE_ENV === 'production' ? '/Planet-Crashers/' : '/';

export const textureUrl = (name) => `${assetPrefix}textures/${name}`;

/* The HUD draws these at 26 to 64 pixels. Handing it the full sphere texture for
   that was most of a megabyte of nothing. */
export const thumbUrl = (type) => `${assetPrefix}textures/thumbs/${type}.webp`;

export const soundUrl = (name) => `${assetPrefix}sounds/${name}.mp3`;

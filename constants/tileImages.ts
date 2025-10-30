// app/constants/tileImages.ts
// IMPORTANT: keys must be known at build time; no computed require().
export const tileImages = {
    car:   require('../assets/tiles/car.png'),
    bike:  require('../assets/tiles/bike.png'),
    train: require('../assets/tiles/train.png'),
    // go:    require('../assets/tiles/go.png'),
    // stop:  require('../assets/tiles/stop.png'),
    // water: require('../assets/tiles/water.png'),
  } as const;
  
  export type TileImageKey = keyof typeof tileImages;
  
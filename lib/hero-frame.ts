/**
 * Единый источник размеров фото в рамке.
 * CSS (memorial-hero) читает padding через inline-переменные в MemorialPageView.
 */

/** Прозрачное окно в frame.png (логический размер). */
export const HERO_FRAME_WINDOW_WIDTH = 492;
export const HERO_FRAME_WINDOW_HEIGHT = 680;

/** Внутренние отступы внутри окна рамки (уменьшают видимую область фото). */
export const HERO_PHOTO_PADDING_X = 52;
export const HERO_PHOTO_PADDING_Y = 72;

/** Видимая область фото = окно минус отступы. */
export const HERO_PHOTO_CROP_WIDTH =
  HERO_FRAME_WINDOW_WIDTH - HERO_PHOTO_PADDING_X * 2;
export const HERO_PHOTO_CROP_HEIGHT =
  HERO_FRAME_WINDOW_HEIGHT - HERO_PHOTO_PADDING_Y * 2;

export const HERO_PHOTO_CROP_ASPECT =
  HERO_PHOTO_CROP_WIDTH / HERO_PHOTO_CROP_HEIGHT;

/** Множитель для файла (3× — запас для retina и крупной рамки на десктопе). */
export const HERO_PHOTO_OUTPUT_SCALE = 3;

/** Размер файла обложки после обрезки в редакторе. */
export const HERO_PHOTO_OUTPUT_WIDTH = HERO_PHOTO_CROP_WIDTH * HERO_PHOTO_OUTPUT_SCALE;
export const HERO_PHOTO_OUTPUT_HEIGHT = HERO_PHOTO_CROP_HEIGHT * HERO_PHOTO_OUTPUT_SCALE;

/** Качество JPEG при сохранении обложки (0–100), одно сжатие в браузере. */
export const HERO_PHOTO_JPEG_QUALITY = 95;

/** @deprecated Используйте HERO_PHOTO_CROP_* */
export const HERO_PHOTO_WIDTH = HERO_PHOTO_CROP_WIDTH;
/** @deprecated Используйте HERO_PHOTO_CROP_* */
export const HERO_PHOTO_HEIGHT = HERO_PHOTO_CROP_HEIGHT;
/** @deprecated Используйте HERO_PHOTO_CROP_ASPECT */
export const HERO_PHOTO_ASPECT = HERO_PHOTO_CROP_ASPECT;

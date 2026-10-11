/** Atkinson dithering, the method the first Macintosh used to show photos in black and white. */
export function atkinson(pixels: ImageData): void {
  const { data, width, height } = pixels
  const grey = new Float32Array(width * height)
  for (let i = 0; i < grey.length; i++) {
    grey[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  }
  const spread = [1, 2, width - 1, width, width + 1, 2 * width]
  for (let i = 0; i < grey.length; i++) {
    const value = grey[i] < 128 ? 0 : 255
    const error = (grey[i] - value) / 8
    const x = i % width
    for (const offset of spread) {
      const j = i + offset
      const dx = (j % width) - x
      if (j < grey.length && dx >= -1 && dx <= 2) grey[j] += error
    }
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = value
    data[i * 4 + 3] = 255
  }
}

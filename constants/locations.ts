export const initialDirections = [
  'top',
  'bottom',
  'left',
  'right',
  'front',
  'back',
  'middle',
  'inside',
]

export const initialSpots = [
  'cabinet',
  'drawer',
  'shelf',
  'counter',
  'fridge',
  'freezer',
  'pantry',
  'closet',
  'box',
  'basket',
  'container',
  'rack',
]

// Type definitions for better TypeScript support
export type Direction = (typeof initialDirections)[number]
export type Spot = (typeof initialSpots)[number]

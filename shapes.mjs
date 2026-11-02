// Clean vector interpretations of the supplied silhouette references.
export const SHAPES=[
  {
    "name": "Circle",
    "body": "<circle cx=\"32\" cy=\"32\" r=\"26\"/>"
  },
  {
    "name": "Square",
    "body": "<rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"3\"/>"
  },
  {
    "name": "Triangle",
    "body": "<polygon points=\"32,5 61,57 3,57\"/>"
  },
  {
    "name": "Star",
    "body": "<polygon points=\"32,3 40,22 61,24 45,38 50,60 32,48 14,60 19,38 3,24 24,22\"/>"
  },
  {
    "name": "Heart",
    "body": "<path d=\"M32 57C24 50 4 37 4 21C4 6 23 2 32 17C41 2 60 6 60 21C60 37 40 50 32 57Z\"/>"
  },
  {
    "name": "Diamond",
    "body": "<polygon points=\"32,3 61,32 32,61 3,32\"/>"
  },
  {
    "name": "Pentagon",
    "body": "<polygon points=\"32,4 60,24 50,58 14,58 4,24\"/>"
  },
  {
    "name": "Hexagon",
    "body": "<polygon points=\"17,6 47,6 62,32 47,58 17,58 2,32\"/>"
  },
  {
    "name": "Crescent",
    "body": "<path d=\"M45 4A28 28 0 1 0 54 53A24 24 0 0 1 45 4Z\"/>"
  },
  {
    "name": "Cloud",
    "body": "<path d=\"M17 55C0 55-1 33 13 29C11 10 34 6 41 23C59 18 69 43 54 53C49 57 23 55 17 55Z\"/>"
  },
  {
    "name": "Lightning",
    "body": "<polygon points=\"30,3 54,3 38,25 59,25 14,62 25,38 6,38\"/>"
  },
  {
    "name": "Droplet",
    "body": "<path d=\"M32 3C29 14 9 29 9 42A23 20 0 0 0 55 42C55 29 35 14 32 3Z\"/>"
  },
  {
    "name": "Leaf",
    "body": "<path d=\"M6 55C-1 25 23 11 59 4C58 40 44 62 16 56L8 62L4 59L32 29L11 50Z\"/>"
  },
  {
    "name": "Flower",
    "body": "<path d=\"M32 7C43-4 50 11 45 19C61 12 70 31 53 38C66 49 50 65 39 52C35 69 16 64 18 49C3 56-4 37 12 30C-1 18 15 4 24 17C23 11 26 7 32 7ZM32 25A8 8 0 1 0 32 41A8 8 0 1 0 32 25Z\"/>"
  },
  {
    "name": "Plus",
    "body": "<path d=\"M23 5H41V23H59V41H41V59H23V41H5V23H23Z\"/>"
  },
  {
    "name": "Arrow",
    "body": "<path d=\"M4 21H35V5L62 32L35 59V43H4Z\"/>"
  },
  {
    "name": "Oval",
    "body": "<ellipse cx=\"32\" cy=\"32\" rx=\"29\" ry=\"20\"/>"
  },
  {
    "name": "Speech bubble",
    "body": "<path d=\"M32 6C-4 6-7 47 18 51L12 61L31 53C70 56 75 6 32 6Z\"/>"
  },
  {
    "name": "Shield",
    "body": "<path d=\"M32 3C39 9 49 12 58 13V32C58 47 45 56 32 62C19 56 6 47 6 32V13C15 12 25 9 32 3Z\"/>"
  },
  {
    "name": "Crown",
    "body": "<path d=\"M7 53L3 18L20 31L32 9L44 31L61 18L57 53ZM7 55H57V61H7Z\"/><circle cx=\"5\" cy=\"15\" r=\"5\"/><circle cx=\"32\" cy=\"7\" r=\"5\"/><circle cx=\"59\" cy=\"15\" r=\"5\"/>"
  },
  {
    "name": "Sun",
    "body": "<polygon points=\"32.00,2.00 37.95,9.78 47.00,6.02 48.26,15.74 57.98,17.00 54.22,26.05 62.00,32.00 54.22,37.95 57.98,47.00 48.26,48.26 47.00,57.98 37.95,54.22 32.00,62.00 26.05,54.22 17.00,57.98 15.74,48.26 6.02,47.00 9.78,37.95 2.00,32.00 9.78,26.05 6.02,17.00 15.74,15.74 17.00,6.02 26.05,9.78\"/>"
  },
  {
    "name": "Maple leaf",
    "body": "<polygon points=\"31,3 38,18 44,12 43,27 57,20 53,32 62,35 43,47 45,54 35,52 35,62 29,62 29,52 19,54 21,47 2,35 11,32 7,20 21,27 20,12 26,18\"/>"
  },
  {
    "name": "Butterfly",
    "body": "<path d=\"M30 29C19 3 2 3 5 21C-5 31 13 42 24 35C3 44 9 63 25 54L31 42L33 42L39 54C55 63 61 44 40 35C51 42 69 31 59 21C62 3 45 3 34 29L34 14H30ZM30 5L26 1L24 4L29 12H35L40 4L38 1L34 5Z\"/>"
  },
  {
    "name": "Pine tree",
    "body": "<path d=\"M32 3L13 23H22L5 42H17L2 57H27V63H37V57H62L47 42H59L42 23H51Z\"/>"
  },
  {
    "name": "Apple",
    "body": "<path d=\"M31 18C20 5 3 16 5 35C6 54 20 64 31 56C43 64 58 53 59 34C61 16 44 6 33 18ZM31 14C28 5 34 0 38 2L36 14ZM38 11C40 0 53 1 57 4C52 11 47 15 38 11Z\"/>"
  },
  {
    "name": "Paw",
    "body": "<ellipse cx=\"32\" cy=\"44\" rx=\"20\" ry=\"15\"/><ellipse cx=\"10\" cy=\"28\" rx=\"7\" ry=\"9\" transform=\"rotate(-25 10 28)\"/><ellipse cx=\"23\" cy=\"13\" rx=\"7\" ry=\"10\"/><ellipse cx=\"42\" cy=\"13\" rx=\"7\" ry=\"10\"/><ellipse cx=\"55\" cy=\"28\" rx=\"7\" ry=\"9\" transform=\"rotate(25 55 28)\"/>"
  },
  {
    "name": "Sparkle",
    "body": "<path d=\"M32 2C35 21 41 28 62 32C41 36 35 43 32 62C29 43 23 36 2 32C23 28 29 21 32 2Z\"/>"
  },
  {
    "name": "Club",
    "body": "<circle cx=\"32\" cy=\"17\" r=\"14\"/><circle cx=\"17\" cy=\"36\" r=\"14\"/><circle cx=\"47\" cy=\"36\" r=\"14\"/><path d=\"M26 35H38C36 46 36 51 45 59H19C28 51 28 46 26 35Z\"/>"
  },
  {
    "name": "Spade",
    "body": "<path d=\"M32 3C26 16 4 24 4 39C4 55 23 55 29 43C28 52 24 56 18 61H46C40 56 36 52 35 43C41 55 60 55 60 39C60 24 38 16 32 3Z\"/>"
  },
  {
    "name": "Bow",
    "body": "<path d=\"M27 21C15 10 2 2 3 18L8 34L2 52L20 53L28 38H36L44 53L62 52L56 34L61 18C62 2 49 10 37 21ZM26 22H38V39H26Z\"/>"
  },
  {
    "name": "Gear",
    "body": "<path d=\"M61.00 32.00L60.64 36.54L54.83 39.42L53.38 42.90L55.46 49.05L52.51 52.51L46.11 51.42L42.90 53.38L40.96 59.58L36.54 60.64L32.00 56.00L28.25 55.70L23.04 59.58L18.83 57.84L17.89 51.42L15.03 48.97L8.54 49.05L6.16 45.17L9.17 39.42L8.30 35.75L3.00 32.00L3.36 27.46L9.17 24.58L10.62 21.10L8.54 14.95L11.49 11.49L17.89 12.58L21.10 10.62L23.04 4.42L27.46 3.36L32.00 8.00L35.75 8.30L40.96 4.42L45.17 6.16L46.11 12.58L48.97 15.03L55.46 14.95L57.84 18.83L54.83 24.58L55.70 28.25ZM32 21A11 11 0 1 0 32 43A11 11 0 1 0 32 21Z\"/>"
  },
  {
    "name": "Flame",
    "body": "<path d=\"M36 2C39 18 55 20 57 38C60 63 23 71 10 49C0 33 17 23 20 15C22 26 26 28 26 28C33 19 26 12 36 2ZM32 36C17 50 27 63 36 56C44 51 34 43 32 36Z\"/>"
  },
  {
    "name": "Snowflake",
    "body": "<path d=\"M32 4V60M8 18L56 46M8 46L56 18M23 9L32 18L41 9M23 55L32 46L41 55M8 27L20 25L18 13M46 51L44 39L56 37M18 51L20 39L8 37M56 27L44 25L46 13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
  },
  {
    "name": "Clover",
    "body": "<path d=\"M32 13C44-3 63 8 51 28C69 37 57 62 37 47L32 43L27 47C7 62-5 37 13 28C1 8 20-3 32 13ZM31 38H36L43 61H36Z\"/>"
  },
  {
    "name": "Gem",
    "body": "<polygon points=\"14,8 50,8 63,26 32,61 1,26\"/><path d=\"M1 26H63M14 8L23 26L32 61L41 26L50 8\" stroke=\"var(--tile)\" stroke-width=\"2.5\" fill=\"none\" opacity=\".7\"/>"
  },
  {
    "name": "House",
    "body": "<path d=\"M2 28L32 3L62 28L57 34L53 30V60H37V41H27V60H11V30L7 34Z\"/>"
  },
  {
    "name": "Bell",
    "body": "<path d=\"M28 6C28-1 36-1 36 6V9C51 12 49 31 52 43L59 51V55H5V51L12 43C15 31 13 12 28 9ZM23 58H41C40 66 24 66 23 58Z\"/>"
  },
  {
    "name": "Blossom",
    "body": "<path d=\"M32 25C12-5 2 20 22 30C-9 29 1 56 26 40C13 69 44 73 38 43C60 67 77 39 45 34C75 17 54-1 36 25Z\"/><circle cx=\"32\" cy=\"34\" r=\"5\" fill=\"var(--tile)\"/>"
  },
  {
    "name": "Anchor",
    "body": "<path d=\"M32 20V57M19 29H45M7 39C8 53 18 59 32 59C46 59 56 53 57 39M3 45L7 37L15 42M49 42L57 37L61 45\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"32\" cy=\"12\" r=\"8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\"/>"
  },
  {
    "name": "Moon",
    "body": "<path d=\"M48 5C21 7 18 38 41 49C48 53 54 51 60 47C53 64 27 68 12 50C-7 25 17-1 40 4C43 4 45 4 48 5Z\"/>"
  }
];
export function shapeMarkup(type){const shape=SHAPES[(type-1+SHAPES.length)%SHAPES.length];return `<svg class="shape" viewBox="0 0 64 64" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${shape.body}</svg>`;}

export const TYPE_COLORS=['#e88c9c','#8e80cd','#66b6ab','#e9bc62','#7baed9','#d78bb7','#a8bd75','#d99b70','#7fbec4','#b09aca','#ca8796','#91a5c5','#c4ac6b','#83ad95','#d49fc9','#bc9080'];
export const MAX_TILE_TYPES=SHAPES.length*TYPE_COLORS.length;
// Each block of forty reuses the silhouettes with a different palette offset.
// Unlike two independent modulo cycles, all 640 identities remain distinct.
export function typeVisual(type){
 if(!Number.isInteger(type)||type<1||type>MAX_TILE_TYPES)throw Error('Invalid tile type.');
 const shapeIndex=(type-1)%SHAPES.length,variant=Math.floor((type-1)/SHAPES.length);
 const colorIndex=(shapeIndex+variant)%TYPE_COLORS.length;
 return {shapeIndex,colorIndex,color:TYPE_COLORS[colorIndex],name:SHAPES[shapeIndex].name};
}

// Mo'jiza Daftar — barcha rasmlar ro'yxati va yagona uslub.
// QOIDALAR: docs/GENERATSIYA_QOIDALARI.md (uslub, taqiqlar, kompozitsiya, namuna rasmlar) — o'zgartirishdan oldin o'qing.
// `npm run gen:art` shu ro'yxat bo'yicha Gemini (Nano Banana) orqali rasm yaratadi.
// Yo'l (path) = ilova qidiradigan fayl: public/assets/art/<path>.(png|jpg)

export const STYLE = [
  "Soft 3D children's cartoon illustration in the style of a premium mobile kids game",
  'rounded chunky friendly shapes, warm saturated but gentle colors, soft global illumination, subtle ambient occlusion',
  'clean readable silhouette, smooth matte clay-like materials, big expressive eyes where there is a face',
  'subtle Uzbek flavor only as small decorative patterns (atlas ikat, suzani, cotton-boll motifs) on clothing, collars or dishes',
  'absolutely NO doors, windows, domes, towers or building parts on any character, animal or object',
  'no text, no letters, no logos, no watermark, no border, no frame',
].join(', ')

/**
 * Fonsiz obyekt: bir xil rangli "xroma" fonda so'raladi, keyin fon kesib olinadi.
 * Fon rangi obyektda YO'Q rang bo'lishi kerak: yashil narsalar (barg, tarvuz, daraxt) uchun
 * magenta, yashil va pushti ikkalasi bor narsalar (uzum, gul) uchun ko'k.
 */
export const KEYS = {
  green: { name: 'pure chroma-key green', hex: '#00FF00', avoid: 'green' },
  magenta: { name: 'pure chroma-key magenta', hex: '#FF00FF', avoid: 'magenta or hot pink' },
  blue: { name: 'pure chroma-key blue', hex: '#0000FF', avoid: 'pure saturated blue' },
}

export function keyOf(a) {
  const t = a.prompt.toLowerCase()
  const green = /green|leaf|leaves|tree|grass|watermelon|pear|poplar|teal|mint|vine|stem|sunflower|clump/.test(t)
  const pink = /pink|purple|magenta|violet|fig|grape/.test(t)
  return !green ? 'green' : !pink ? 'magenta' : 'blue'
}

export function objectText(key) {
  const k = KEYS[key]
  return [
    'a single object, centered, fully visible with generous empty margin around it',
    `isolated on a perfectly flat solid ${k.name} background (${k.hex})`,
    `no shadow on the background, no ground, no other objects, no ${k.avoid} color on the object itself`,
  ].join(', ')
}

/** Eski mevalar uslubi (olma, anor): yuzli — ikki katta yaltiroq ko'z, kichik tabassum, yengil qizil yanoq */
const FACE = 'with a cute friendly face: two big glossy eyes, a small smile and soft pink cheeks'
const fruit = (id, what) => ({ path: `fruit/${id}`, kind: 'object', size: 512, prompt: `${what}, one single fruit, ${FACE}, cute glossy toy-like look` })
const animal = (id, what, motion) => ({
  path: `animal/${id}`,
  kind: 'object',
  size: 640,
  prompt: `${what}, full body, side view facing RIGHT, cute baby proportions, big expressive eyes, friendly smile, a colorful atlas-ikat patterned collar`,
  motion,
})
const person = (id, what) => [
  {
    path: `person/${id}`,
    kind: 'object',
    size: 640,
    prompt: `${what}, full body, front view, standing on a small round grass base, friendly calm smile, arms relaxed`,
    motion: 'gentle idle: breathing, blinks, a small friendly sway and a slight nod',
  },
  {
    path: `person/${id}-happy`,
    kind: 'object',
    size: 640,
    prompt: `${what}, full body, front view, standing on a small round grass base, very happy laughing with eyes closed, arms slightly raised`,
    motion: 'laughs happily and claps hands twice, a small joyful bounce',
  },
]
const bg = (id, what) => ({ path: `bg/${id}`, kind: 'background', aspect: '16:9', width: 1600, prompt: `${what}, wide landscape game background, horizon in the upper third, empty uncluttered lower half where game objects will be placed` })

export const ASSETS = [
  // ---------- Maskot: Popishak (hudhud qushi) ----------
  { path: 'mascot/idle', kind: 'object', size: 512, prompt: 'Popishak, an adorable cartoon hoopoe bird mascot: orange-peach body, fan-shaped orange crest with black tips, black-and-white striped wings, long thin curved dark beak, big shiny eyes, standing, side view facing right, friendly', motion: 'gentle idle: slow breathing, the crest feathers softly sway, blinks once, a small curious head tilt' },
  { path: 'mascot/happy', kind: 'object', size: 512, prompt: 'Popishak the cartoon hoopoe bird mascot, jumping with joy, crest fully raised like a fan, wings open, eyes happily closed, beak open smiling, facing right', motion: 'jumps up joyfully twice, the crest fans fully open, wings flap happily' },
  { path: 'mascot/oops', kind: 'object', size: 512, prompt: 'Popishak the cartoon hoopoe bird mascot, puzzled and confused, head tilted, crest lowered, one wing scratching head, facing right', motion: 'tilts head from side to side confused, the crest droops, scratches head with a wing' },
  { path: 'mascot/sleep', kind: 'object', size: 512, prompt: 'Popishak the cartoon hoopoe bird mascot, sleeping peacefully while standing, eyes closed, crest lowered, cozy, facing right', motion: 'sleeping: slow deep breathing, the crest gently bobs, a tiny sleepy head nod' },

  // ---------- Fonlar ----------
  bg('map', 'bird-eye cheerful Uzbek village valley: rolling green hills, snowy Chimgan mountains far away, blue-domed madrasa on the horizon, rows of tall poplar trees, a small winding irrigation canal (ariq), sunny morning sky with soft clouds'),
  bg('garden', 'sunny Uzbek fruit orchard: one big lush fruit tree on the left half, green grass, wooden fence, soft blue sky, peaceful'),
  bg('market', 'cozy Uzbek bazaar stall seen from the front: red-and-white striped awning on top, wooden counter at the bottom, warm sunlight, blurred colorful market behind'),
  bg('farm', 'Uzbek village farm yard: mud-brick barn with wooden door on the left, wooden fence across the middle, haystacks, green grass, sunny sky'),
  bg('workshop', 'traditional Uzbek pottery workshop interior: warm terracotta walls, wooden shelf with clay pots (ko\'za), patterned tiles, soft window light, wooden floor'),
  bg('night', 'Uzbek village animal pen at night: wooden fence enclosure with straw floor, crescent moon and stars, deep blue sky, cozy warm lantern glow'),
  bg('letters', 'cozy children classroom in an Uzbek school: green chalkboard on the wall, carved wooden window, sunlight, wooden floor'),
  bg('studio', 'bright children art studio: easel, crayons and paint pots on shelves, colorful drawings pinned on the warm cream wall, wooden floor'),
  bg('stage', 'children puppet theater stage: red velvet curtains on both sides, golden valance on top, warm spotlight in the center, wooden stage floor, dark purple backdrop'),
  bg('profiles', 'welcoming Uzbek village at golden morning: blue dome and minaret far away, poplar trees, green meadow, soft sunrise sky'),
  bg('sleep', 'peaceful Uzbek village at night: starry deep blue sky, big crescent moon, dark hills, tiny warm window lights'),

  // ---------- Mevalar ----------
  fruit('olma', 'a shiny red apple with a green leaf'),
  fruit('anor', 'a ripe red pomegranate with its little crown'),
  fruit('gilos', 'a pair of bright red cherries joined by stems with a leaf'),
  fruit('qovun', 'a golden Uzbek melon (qovun) with a netted skin, oval shape'),
  fruit('behi', 'a yellow fuzzy quince fruit with a leaf'),
  fruit('tarvuz', 'a round dark green striped watermelon'),
  fruit('nok', 'a light green pear with a leaf'),
  fruit('uzum', 'a bunch of purple grapes with a vine leaf'),
  fruit('anjir', 'a purple fig'),
  fruit('orik', 'an orange apricot with a leaf'),

  // ---------- Hayvonlar ----------
  animal('sigir', 'a white cow with black spots, pink nose, small horns', 'chews slowly, swishes its tail, blinks and flicks an ear'),
  animal('qoy', 'a fluffy white sheep with a dark face', 'bobs its fluffy head, wiggles its ears, blinks'),
  animal('echki', 'a light brown goat with small curved horns and a little beard', 'nods its head, the little beard sways, swishes its short tail'),
  animal('xoroz', 'a colorful rooster with red comb and a big teal-green tail', 'flaps its wings and crows proudly with the beak open, tail feathers bounce'),
  animal('it', 'a brown puppy with floppy ears', 'wags its tail fast, pants happily with tongue out, ears bounce'),
  animal('mushuk', 'an orange tabby kitten', 'slowly swishes its tail, blinks slowly, ears twitch'),
  animal('ordak', 'a yellow duck', 'waddles in place, flaps its small wings, bobs its head'),
  animal('eshak', 'a grey donkey with long ears', 'wiggles its long ears, swishes its tail, nods'),

  // ---------- Bozor mijozlari ----------
  ...person('bobo', 'a kind Uzbek grandfather with white beard, black-and-white doppi skullcap, striped blue chapan robe'),
  ...person('buvi', 'a sweet Uzbek grandmother with a white headscarf and purple dress'),
  ...person('aka', 'a young Uzbek man with a doppi skullcap and white shirt with dark vest'),
  ...person('opa', 'a young Uzbek woman with long braids in a colorful atlas ikat dress'),
  ...person('bola', 'a cheerful little Uzbek boy with a blue cap and green t-shirt'),

  // ---------- YANGI (2026-11): topishmoqlar, albom, xotira o'yini uchun ----------
  // Hayvonlar (+12)
  animal('ot', 'a brown horse with a dark mane and tail', 'shakes its mane, swishes its tail, lifts one front hoof'),
  animal('tuya', 'a light brown two-humped Bactrian camel', 'chews slowly, blinks with long lashes, sways its neck'),
  animal('quyon', 'a fluffy grey-white bunny rabbit with long ears, sitting', 'twitches its nose, ears flop, small hop in place'),
  animal('tovuq', 'a plump brown hen with a small red comb', 'pecks the ground, bobs its head, fluffs its feathers'),
  animal('joja', 'a tiny fluffy yellow baby chick', 'hops in place, flaps tiny wings, opens its little beak'),
  animal('goz', 'a white goose with an orange beak and orange feet', 'stretches its neck, flaps its wings, waddles'),
  animal('baliq', 'a bright orange fish with big fins, side view (not standing)', 'swims in place: tail and fins wave, bubbles rise'),
  animal('kapalak', 'a colorful butterfly with big orange-blue wings, top view (not standing)', 'flaps its wings slowly, antennae wiggle'),
  animal('ari', 'a cute round honeybee with yellow-black stripes and small wings (not standing)', 'buzzes in place, wings blur, bobs up and down'),
  animal('toshbaqa', 'a small turtle with a brown patterned shell', 'pokes its head out, blinks, slow step in place'),
  animal('ayiq', 'a brown bear cub', 'waves a paw, rocks side to side, blinks'),
  animal('fil', 'a small grey elephant calf with big ears', 'raises its trunk, flaps its big ears, sways'),

  // Sabzavotlar (yangi turkum, 8)
  ...[
    ['sabzi', 'an orange carrot with green leafy top'],
    ['piyoz', 'a golden-brown onion with a little sprout'],
    ['kartoshka', 'a light brown potato'],
    ['pomidor', 'a shiny round red tomato with a small green stem'],
    ['bodring', 'a fresh green cucumber with small bumps'],
    ['karam', 'a round light green cabbage head'],
    ['qalampir', 'a bright red bell pepper with a green stem'],
    ['oshqovoq', 'a round orange pumpkin with a curly stem'],
  ].map(([id, what]) => ({ path: `veg/${id}`, kind: 'object', size: 512, prompt: `${what}, one single vegetable, ${FACE}, cute glossy toy-like look` })),

  // Buyumlar (12) — o'zbek uyi va bolalar dunyosi
  ...[
    ['choynak', 'a traditional Uzbek white porcelain teapot with blue cotton-boll (paxta) pattern'],
    ['piyola', 'a traditional Uzbek tea bowl (piyola) with blue cotton-boll pattern'],
    ['non', 'a round Uzbek flatbread (non) with a stamped pattern in the middle, golden crust'],
    ['doppi', 'a black-and-white Uzbek doppi skullcap with pepper-pod embroidery'],
    ['qoshiq', 'a wooden spoon'],
    ['soat', 'a red round alarm clock with two bells on top'],
    ['kitob', 'an open colorful children picture book'],
    ['qalam', 'a yellow pencil with a pink eraser'],
    ['koptok', 'a colorful striped rubber ball'],
    ['mashina', 'a small red toy car'],
    ['velosiped', 'a small blue children bicycle, side view'],
    ['soyabon', 'an open colorful umbrella'],
  ].map(([id, what]) => ({ path: `obj/${id}`, kind: 'object', size: 512, prompt: `${what}, one single object, ${FACE}, cute toy-like look` })),

  // Tabiat (6)
  ...[
    ['quyosh', 'a smiling bright yellow sun with soft rays'],
    ['oy', 'a smiling pale yellow crescent moon'],
    ['yulduz', 'a smiling golden five-pointed star'],
    ['bulut', 'a fluffy white cloud with a gentle smile'],
    ['yomgir', 'a small grey rain cloud with falling blue raindrops'],
    ['gul', 'a red tulip flower with two leaves'],
  ].map(([id, what]) => ({ path: `nature/${id}`, kind: 'object', size: 512, prompt: `${what}, one single object, ${FACE}, cute toy-like look` })),

  // Alifbo uchun qo'shimcha (har harfga kamida 2 ta narsa) — qoidalar: docs/GENERATSIYA_QOIDALARI.md
  animal('hakka', 'a black-and-white magpie bird with a long tail', 'hops, tilts its head, flicks its long tail'),
  animal('ilon', 'a friendly green-and-yellow cartoon snake coiled with its head raised (no legs)', 'sways its head side to side, flicks its tongue, blinks'),
  animal('jirafa', 'a baby giraffe with a long neck and brown spots', 'bends its long neck, blinks, twitches its ears'),
  animal('laylak', 'a white stork with black wing tips, long red beak and long red legs', 'stands on one leg, flaps its wings, nods'),
  animal('zebra', 'a baby zebra with black and white stripes', 'swishes its tail, nods, flicks its ears'),
  animal('chumoli', 'a cute red-brown ant with six small legs and antennae', 'wiggles its antennae, taps its legs, bobs'),
  animal('sher', 'a friendly lion cub with a small fluffy golden mane', 'shakes its little mane, yawns, swishes its tail'),
  ...[
    ['joxori', 'a yellow corn cob with green husk leaves'],
    ['limon', 'a bright yellow lemon with a small green leaf'],
    ['xurmo', 'a ripe orange persimmon with a green four-leaf cap'],
  ].map(([id, what]) => ({ path: `veg/${id}`, kind: 'object', size: 512, prompt: `${what}, one single fruit or vegetable, ${FACE}, cute glossy toy-like look` })),
  ...[
    ['fonar', 'a small old-fashioned lantern with a warm glowing light'],
    ['gilam', 'a small rolled-out Uzbek carpet with red geometric pattern, seen from above at an angle'],
    ['ip', 'a round ball of red knitting yarn with a loose thread end'],
    ['raketa', 'a small red-and-white toy rocket'],
    ['ruchka', 'a blue ballpoint pen'],
    ['uy', 'a small cozy cartoon house with a red roof and a little chimney'],
    ['uzuk', 'a golden ring with a small red gem'],
    ['vertolyot', 'a small yellow toy helicopter'],
    ['xalta', 'a small embroidered cloth bag with a drawstring and suzani pattern'],
    ['zina', 'a small wooden ladder'],
    ['gildirak', 'a single black rubber wheel with a red hub'],
    ['shar', 'a shiny red balloon on a string'],
  ].map(([id, what]) => ({ path: `obj/${id}`, kind: 'object', size: 512, prompt: `${what}, one single object, ${FACE}, cute toy-like look` })),

  // Kasblar (+4, odamlar kabi: oddiy va xursand holat)
  ...person('shifokor', 'a kind Uzbek woman doctor in a white coat with a stethoscope'),
  ...person('oshpaz', 'a cheerful Uzbek cook with a white chef hat and apron, holding a ladle'),
  ...person('haydovchi', 'a friendly Uzbek driver with a cap and blue uniform'),
  ...person('dehqon', 'a smiling Uzbek farmer with a doppi skullcap and a small hoe'),

  // ---------- Xarita bekatlari (dumaloq ikonka sifatida ishlatiladi) ----------
  { path: 'station/rasm', kind: 'object', size: 384, prompt: 'a small wooden easel with a colorful child drawing and crayons, game map icon' },
  { path: 'station/bog', kind: 'object', size: 384, prompt: 'a small fruit tree full of red apples, game map icon' },
  { path: 'station/bozor', kind: 'object', size: 384, prompt: 'a tiny Uzbek market stall with striped red awning and fruit crates, game map icon' },
  { path: 'station/ferma', kind: 'object', size: 384, prompt: 'a tiny mud-brick barn with a wooden door and a haystack, game map icon' },
  { path: 'station/ustaxona', kind: 'object', size: 384, prompt: 'a decorated Uzbek clay pot (ko\'za) with blue patterns, game map icon' },
  { path: 'station/qora', kind: 'object', size: 384, prompt: 'a small wooden animal pen with a crescent moon above it, game map icon' },
  { path: 'station/harflar', kind: 'object', size: 384, prompt: 'a tiny school house with a blue roof and a green chalkboard, game map icon' },

  // ---------- Qishloq bezaklari (sovg'alar) ----------
  { path: 'decor/terak', kind: 'object', size: 384, prompt: 'a tall slim Uzbek poplar tree' },
  { path: 'decor/olma_daraxt', kind: 'object', size: 384, prompt: 'a round apple tree with red apples' },
  { path: 'decor/anor_daraxt', kind: 'object', size: 384, prompt: 'a pomegranate tree with red pomegranates' },
  { path: 'decor/gul', kind: 'object', size: 384, prompt: 'a cheerful pink flower in a small clump of grass' },
  { path: 'decor/kungaboqar', kind: 'object', size: 384, prompt: 'a tall sunflower' },
  { path: 'decor/uy', kind: 'object', size: 384, prompt: 'a small white Uzbek village house with flat roof and carved wooden door' },
  { path: 'decor/sori', kind: 'object', size: 384, prompt: 'an Uzbek so\'ri (raised wooden platform for sitting) with a red carpet and pillows' },
  { path: 'decor/tandir', kind: 'object', size: 384, prompt: 'an Uzbek clay tandir oven with a round bread next to it' },
  { path: 'decor/quduq', kind: 'object', size: 384, prompt: 'a small stone water well with a wooden roof and bucket' },
  { path: 'decor/koza', kind: 'object', size: 384, prompt: 'a terracotta Uzbek water jug (ko\'za) with blue pattern band' },

  // ---------- Ustaxona naqshlari (kvadrat plitka, fonli) ----------
  ...[
    ['yulduz', 'a square ceramic tile with a golden eight-pointed Samarkand star on deep lapis blue'],
    ['bodom', 'a square ceramic tile with a red paisley (bodom) motif on cream'],
    ['gul', 'a square ceramic tile with a white six-petal flower on turquoise'],
    ['olmos', 'a square ceramic tile with a dark teal diamond (rhombus) on warm orange'],
    ['doira', 'a square ceramic tile with purple concentric circles on light peach'],
    ['barg', 'a square ceramic tile with a green leaf on pale mint'],
  ].map(([id, what]) => ({ path: `tile/${id}`, kind: 'tile', size: 256, prompt: `${what}, flat front view, the tile fills the whole image edge to edge, glossy glaze` })),

  // ---------- Tugma ikonkalari (3D o'yin UI) ----------
  ...[
    ['back', 'a chunky left-pointing arrow'],
    ['home', 'a small cute house'],
    ['eraser', 'a pink rubber eraser'],
    ['undo', 'a curved arrow turning back to the left'],
    ['camera', 'a cute blue photo camera'],
    ['gallery', 'a framed picture with a green hill and a yellow sun'],
    ['album', 'a red photo album book'],
    ['stage', 'a little theater stage with red curtains'],
    ['magic', 'a sparkling golden star'],
    ['done', 'a bold green check mark'],
    ['music', 'a purple music note'],
    ['bones', 'a friendly white cartoon bone'],
    ['bucket', 'a paint bucket pouring colorful paint'],
    ['brush', 'a paint brush with a colorful tip'],
    ['skip', 'a double forward arrow (fast forward)'],
    ['reset', 'a circular refresh arrow'],
    ['hero', 'a small happy child figure silhouette in blue and yellow'],
    ['sponge', 'a yellow kitchen sponge'],
    ['robot', 'a cute friendly little blue robot head with antenna'],
  ].map(([id, what]) => ({
    path: `icon/${id}`,
    kind: 'object',
    size: 192,
    prompt: `${what}, glossy 3D mobile game UI icon, chunky rounded shape, bright saturated colors, soft highlight on top, no background element, no circle behind it`,
  })),

  // ---------- Bog' daraxti (hovli fonidagi daraxt kabi; mevalar alohida, shoxga qo'yiladi va uziladi) ----------
  // Daraxtdagi mayda mevalar — yuzsiz (fondagi daraxt kabi); daraxtning o'zida yuz bor.
  {
    path: 'bog/daraxt',
    kind: 'object',
    size: 768,
    prompt:
      'a big friendly fruit tree WITHOUT any fruit: a thick warm terracotta-clay trunk with a gentle smiling face in the middle of the trunk (two big glossy brown eyes, soft brows, a small smile), short roots spreading at the base, a wide round crown made of many plump rounded matte green clay leaves in several shades of green, no fruit, no flowers, no birds',
    motion: 'the crown of leaves sways very gently in a soft breeze, the face blinks slowly and smiles, the trunk stays still',
  },
  { path: 'bog/shaftoli', kind: 'object', size: 256, prompt: 'one single small ripe round peach with a soft orange and pink blush, a tiny brown stem and one small green leaf, matte clay, no face' },
  { path: 'bog/olxori', kind: 'object', size: 256, prompt: 'one single small ripe oval plum, deep purple with a soft bloom, a tiny brown twig on top, matte clay, no face' },

  // ---------- Boshqa ----------
  { path: 'ui/basket', kind: 'object', size: 384, prompt: 'an empty woven wicker basket with a handle, front view' },
  { path: 'ui/coin', kind: 'object', size: 256, prompt: 'a shiny golden coin, front view' },
  { path: 'ui/haystack', kind: 'object', size: 384, prompt: 'a round golden haystack' },
]

/** Yakuniy prompt: tavsif + yagona uslub (+ obyekt bo'lsa: yashil fon talabi) */
export function fullPrompt(a) {
  if (a.kind === 'object') return `${a.prompt}. ${STYLE}. ${objectText(keyOf(a))}.`
  return `${a.prompt}. ${STYLE}.`
}

/** Qo'lda yaratilgan rasm uchun fayl nomi: "fruit/olma" → "fruit__olma.png" */
export const inboxName = (a) => a.path.replace(/\//g, '__')

/** Animatsiya prompti: tayyor rasmni biriktirib, GIF qilish uchun (Gemini / boshqa video AI) */
export function motionPrompt(a) {
  const k = KEYS[keyOf(a)]
  return [
    // Manba rasm 16:9 (1280x720) fonga, personaj ~70% balandlikda joylanadi — Gemini GIF'i 16:9, kvadrat kesiladi
    `Animate the attached image as a short seamless looping GIF (2-3 seconds), wide 16:9 frame exactly like the attached image: ${a.motion}.`,
    'Keep exactly the same character, design, colors, size and position.',
    'Do NOT zoom in or crop: the whole character including head, ears, tail and feet must stay fully visible with the same empty margin around it in every frame.',
    'The camera does not move, no zoom, no cuts.',
    `Keep the solid flat ${k.name} background (${k.hex}) completely unchanged in every frame.`,
    'The character always stays fully inside the frame.',
    'The last frame must match the first frame for a perfect loop.',
  ].join(' ')
}

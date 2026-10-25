// Simplified seasonal ranges for common US birds, by broad region.
// Status codes: Y = year-round, S = breeding (summer), W = winter, M = migration only.

export const REGIONS = {
  NE: { name: 'New England', states: ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut'] },
  MA: { name: 'Mid-Atlantic', states: ['New York', 'New Jersey', 'Pennsylvania', 'Delaware', 'Maryland', 'District of Columbia', 'Virginia', 'West Virginia'] },
  SE: { name: 'Southeast', states: ['North Carolina', 'South Carolina', 'Georgia', 'Alabama', 'Mississippi', 'Tennessee', 'Kentucky', 'Arkansas', 'Louisiana'] },
  FL: { name: 'Florida', states: ['Florida'] },
  MW: { name: 'Midwest & Great Lakes', states: ['Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa', 'Missouri'] },
  GP: { name: 'Great Plains', states: ['North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma'] },
  TX: { name: 'Texas', states: ['Texas'] },
  RM: { name: 'Rockies & Great Basin', states: ['Montana', 'Wyoming', 'Colorado', 'Idaho', 'Utah', 'Nevada'] },
  SW: { name: 'Southwest', states: ['Arizona', 'New Mexico'] },
  CA: { name: 'California', states: ['California'] },
  PNW: { name: 'Pacific Northwest', states: ['Washington', 'Oregon'] },
  AK: { name: 'Alaska', states: ['Alaska'] },
  HI: { name: 'Hawaii', states: ['Hawaii'] },
}
export const REGION_IDS = Object.keys(REGIONS)
export const L48 = REGION_IDS.filter((r) => r !== 'AK' && r !== 'HI').join(',')

export const STATE_REGION = Object.fromEntries(
  Object.entries(REGIONS).flatMap(([id, r]) => r.states.map((s) => [s, id]))
)

export const STATUS = {
  Y: { label: 'Year-round', cls: 'st-y' },
  S: { label: 'Breeding (summer)', cls: 'st-s' },
  W: { label: 'Winter', cls: 'st-w' },
  M: { label: 'Migration', cls: 'st-m' },
}

export const SEASONS = [
  { id: 'all', label: 'All year', shows: ['Y', 'S', 'W', 'M'] },
  { id: 'spring', label: 'Spring', shows: ['Y', 'S', 'W', 'M'], note: 'Mar–May: winter visitors leave, summer birds arrive, migrants pass through.' },
  { id: 'summer', label: 'Summer', shows: ['Y', 'S'], note: 'Jun–Aug: breeding season.' },
  { id: 'fall', label: 'Fall', shows: ['Y', 'S', 'W', 'M'], note: 'Sep–Nov: summer birds leave, winter visitors arrive, migrants pass through.' },
  { id: 'winter', label: 'Winter', shows: ['Y', 'W'], note: 'Dec–Feb.' },
]

export function currentSeason(d = new Date()) {
  const m = d.getMonth()
  return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'fall' : 'winter'
}

export const GROUPS = {
  songbird: { label: 'Songbirds', emoji: '🐦' },
  woodpecker: { label: 'Woodpeckers', emoji: '🪵' },
  hummer: { label: 'Hummingbirds & swifts', emoji: '🌺' },
  ground: { label: 'Doves, quail & turkeys', emoji: '🕊️' },
  waterfowl: { label: 'Ducks, geese & loons', emoji: '🦆' },
  wader: { label: 'Herons & cranes', emoji: '🦩' },
  shore: { label: 'Gulls, pelicans & shorebirds', emoji: '🌊' },
  raptor: { label: 'Hawks, eagles & owls', emoji: '🦅' },
  other: { label: 'Other', emoji: '🪶' },
}

// [common name, scientific name, group, range]
const DATA = [
  // Songbirds
  ['American Robin', 'Turdus migratorius', 'songbird', 'Y:NE,MA,SE,MW,GP,TX,RM,SW,CA,PNW S:AK W:FL'],
  ['Northern Cardinal', 'Cardinalis cardinalis', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX,SW,HI'],
  ['Blue Jay', 'Cyanocitta cristata', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX'],
  ["Steller's Jay", 'Cyanocitta stelleri', 'songbird', 'Y:RM,SW,CA,PNW,AK'],
  ['California Scrub-Jay', 'Aphelocoma californica', 'songbird', 'Y:CA,PNW'],
  ["Woodhouse's Scrub-Jay", 'Aphelocoma woodhouseii', 'songbird', 'Y:RM,SW,TX'],
  ['Florida Scrub-Jay', 'Aphelocoma coerulescens', 'songbird', 'Y:FL'],
  ['Black-billed Magpie', 'Pica hudsonia', 'songbird', 'Y:RM,PNW,GP,AK'],
  ['American Crow', 'Corvus brachyrhynchos', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX,RM,CA,PNW,AK W:SW'],
  ['Common Raven', 'Corvus corax', 'songbird', 'Y:NE,MA,MW,GP,TX,RM,SW,CA,PNW,AK'],
  ['Black-capped Chickadee', 'Poecile atricapillus', 'songbird', 'Y:NE,MA,MW,GP,RM,PNW,AK'],
  ['Carolina Chickadee', 'Poecile carolinensis', 'songbird', 'Y:MA,SE,FL,MW,GP,TX'],
  ['Tufted Titmouse', 'Baeolophus bicolor', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX'],
  ['Bushtit', 'Psaltriparus minimus', 'songbird', 'Y:CA,PNW,SW,RM,TX'],
  ['White-breasted Nuthatch', 'Sitta carolinensis', 'songbird', 'Y:NE,MA,SE,MW,GP,TX,RM,SW,CA,PNW'],
  ['Red-breasted Nuthatch', 'Sitta canadensis', 'songbird', 'Y:NE,RM,CA,PNW,AK W:MA,SE,MW,GP,TX,SW'],
  ['Carolina Wren', 'Thryothorus ludovicianus', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX'],
  ['House Wren', 'Troglodytes aedon', 'songbird', 'Y:CA,SW S:NE,MA,MW,GP,RM,PNW W:SE,FL,TX'],
  ["Bewick's Wren", 'Thryomanes bewickii', 'songbird', 'Y:CA,SW,PNW,TX,RM,GP'],
  ['Cactus Wren', 'Campylorhynchus brunneicapillus', 'songbird', 'Y:SW,CA,TX'],
  ['Ruby-crowned Kinglet', 'Corthylio calendula', 'songbird', 'Y:PNW S:NE,RM,AK W:MA,SE,FL,TX,SW,CA M:MW,GP'],
  ['Golden-crowned Kinglet', 'Regulus satrapa', 'songbird', 'Y:NE,RM,CA,PNW,AK W:MA,SE,MW,GP,TX'],
  ['Eastern Bluebird', 'Sialia sialis', 'songbird', 'Y:MA,SE,FL,TX S:NE,MW,GP'],
  ['Western Bluebird', 'Sialia mexicana', 'songbird', 'Y:CA,SW,PNW S:RM'],
  ['Mountain Bluebird', 'Sialia currucoides', 'songbird', 'S:RM,PNW W:SW,CA,TX M:GP'],
  ['Wood Thrush', 'Hylocichla mustelina', 'songbird', 'S:NE,MA,SE,MW M:FL,TX'],
  ['Hermit Thrush', 'Catharus guttatus', 'songbird', 'S:NE,MW,RM,PNW,AK W:MA,SE,FL,TX,SW,CA'],
  ['Gray Catbird', 'Dumetella carolinensis', 'songbird', 'S:NE,MA,SE,MW,GP,RM W:FL,TX'],
  ['Northern Mockingbird', 'Mimus polyglottos', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX,SW,CA,HI S:RM'],
  ['Brown Thrasher', 'Toxostoma rufum', 'songbird', 'Y:MA,SE,FL S:NE,MW,GP W:TX'],
  ['European Starling', 'Sturnus vulgaris', 'songbird', `Y:${L48},AK`],
  ['Cedar Waxwing', 'Bombycilla cedrorum', 'songbird', 'Y:NE,MA,MW,RM,PNW W:SE,FL,TX,SW,CA,GP'],
  ['House Sparrow', 'Passer domesticus', 'songbird', `Y:${L48},HI`],
  ['Song Sparrow', 'Melospiza melodia', 'songbird', 'Y:NE,MA,MW,RM,CA,PNW,AK W:SE,FL,TX,SW,GP'],
  ['White-throated Sparrow', 'Zonotrichia albicollis', 'songbird', 'Y:NE S:MW W:MA,SE,FL,TX M:GP'],
  ['White-crowned Sparrow', 'Zonotrichia leucophrys', 'songbird', 'Y:CA,PNW S:RM,AK W:SE,TX,SW,GP M:NE,MA,MW'],
  ['Chipping Sparrow', 'Spizella passerina', 'songbird', 'Y:MA,SE S:NE,MW,GP,RM,CA,PNW,AK W:FL,TX,SW'],
  ['Dark-eyed Junco', 'Junco hyemalis', 'songbird', 'Y:NE,RM,CA,PNW,AK W:MA,SE,MW,GP,TX,SW'],
  ['Eastern Towhee', 'Pipilo erythrophthalmus', 'songbird', 'Y:MA,SE,FL S:NE,MW W:TX'],
  ['Spotted Towhee', 'Pipilo maculatus', 'songbird', 'Y:CA,PNW,RM,SW W:GP,TX'],
  ['House Finch', 'Haemorhous mexicanus', 'songbird', 'Y:NE,MA,SE,FL,MW,GP,TX,RM,SW,CA,PNW,HI'],
  ['Purple Finch', 'Haemorhous purpureus', 'songbird', 'Y:NE,CA,PNW S:MW W:MA,SE,TX'],
  ['American Goldfinch', 'Spinus tristis', 'songbird', 'Y:NE,MA,SE,MW,GP,RM,CA,PNW W:FL,TX,SW'],
  ['Lesser Goldfinch', 'Spinus psaltria', 'songbird', 'Y:CA,SW,TX S:RM'],
  ['Pine Siskin', 'Spinus pinus', 'songbird', 'Y:NE,RM,CA,PNW,AK W:MA,SE,MW,GP,TX,SW'],
  ['Red-winged Blackbird', 'Agelaius phoeniceus', 'songbird', 'Y:MA,SE,FL,GP,TX,RM,SW,CA,PNW S:NE,MW'],
  ['Common Grackle', 'Quiscalus quiscula', 'songbird', 'Y:MA,SE,FL,TX S:NE,MW,GP,RM'],
  ['Great-tailed Grackle', 'Quiscalus mexicanus', 'songbird', 'Y:TX,SW,CA,GP'],
  ['Brown-headed Cowbird', 'Molothrus ater', 'songbird', 'Y:MA,SE,FL,TX,SW,CA S:NE,MW,GP,RM,PNW'],
  ['Eastern Meadowlark', 'Sturnella magna', 'songbird', 'Y:MA,SE,FL,TX,SW S:NE,MW,GP'],
  ['Western Meadowlark', 'Sturnella neglecta', 'songbird', 'Y:CA,SW,RM,PNW,GP,TX S:MW'],
  ['Baltimore Oriole', 'Icterus galbula', 'songbird', 'S:NE,MA,MW,GP M:SE,TX W:FL'],
  ["Bullock's Oriole", 'Icterus bullockii', 'songbird', 'S:CA,PNW,RM,SW,GP,TX'],
  ['Barn Swallow', 'Hirundo rustica', 'songbird', `S:${L48},AK`],
  ['Tree Swallow', 'Tachycineta bicolor', 'songbird', 'S:NE,MA,MW,GP,RM,CA,PNW,AK W:SE,FL,TX'],
  ['Purple Martin', 'Progne subis', 'songbird', 'S:NE,MA,SE,FL,MW,GP,TX,SW'],
  ['Horned Lark', 'Eremophila alpestris', 'songbird', 'Y:MA,MW,GP,TX,RM,SW,CA,PNW S:AK W:NE,SE'],
  ['Eastern Phoebe', 'Sayornis phoebe', 'songbird', 'Y:SE S:NE,MA,MW,GP W:FL,TX'],
  ['Black Phoebe', 'Sayornis nigricans', 'songbird', 'Y:CA,SW,TX'],
  ['Eastern Kingbird', 'Tyrannus tyrannus', 'songbird', 'S:NE,MA,SE,FL,MW,GP,TX,RM,PNW'],
  ['Western Kingbird', 'Tyrannus verticalis', 'songbird', 'S:GP,TX,RM,SW,CA,PNW'],
  ['Scissor-tailed Flycatcher', 'Tyrannus forficatus', 'songbird', 'S:TX,GP'],
  ['Red-eyed Vireo', 'Vireo olivaceus', 'songbird', 'S:NE,MA,SE,FL,MW,GP,TX,RM,PNW'],
  ['Yellow Warbler', 'Setophaga petechia', 'songbird', 'S:NE,MA,MW,GP,RM,SW,CA,PNW,AK M:SE,FL,TX'],
  ['Yellow-rumped Warbler', 'Setophaga coronata', 'songbird', 'S:NE,MW,RM,PNW,AK W:MA,SE,FL,TX,SW,CA,GP'],
  ['Common Yellowthroat', 'Geothlypis trichas', 'songbird', 'Y:SE,FL,TX,CA,SW S:NE,MA,MW,GP,RM,PNW,AK'],
  ['American Redstart', 'Setophaga ruticilla', 'songbird', 'S:NE,MA,SE,MW,GP,RM,PNW M:FL,TX'],
  ['Black-and-white Warbler', 'Mniotilta varia', 'songbird', 'S:NE,MA,SE,MW W:FL M:TX'],
  ['Ovenbird', 'Seiurus aurocapilla', 'songbird', 'S:NE,MA,SE,MW W:FL M:TX'],
  ['Scarlet Tanager', 'Piranga olivacea', 'songbird', 'S:NE,MA,SE,MW M:FL,TX'],
  ['Summer Tanager', 'Piranga rubra', 'songbird', 'S:MA,SE,FL,MW,TX,SW'],
  ['Western Tanager', 'Piranga ludoviciana', 'songbird', 'S:RM,PNW,CA,SW M:TX,GP'],
  ['Rose-breasted Grosbeak', 'Pheucticus ludovicianus', 'songbird', 'S:NE,MA,MW,GP M:SE,FL,TX'],
  ['Black-headed Grosbeak', 'Pheucticus melanocephalus', 'songbird', 'S:CA,PNW,RM,SW'],
  ['Indigo Bunting', 'Passerina cyanea', 'songbird', 'S:NE,MA,SE,MW,GP,TX M:FL'],
  ['Painted Bunting', 'Passerina ciris', 'songbird', 'S:SE,TX,GP W:FL'],

  // Woodpeckers & kingfishers
  ['Downy Woodpecker', 'Dryobates pubescens', 'woodpecker', 'Y:NE,MA,SE,FL,MW,GP,TX,RM,SW,CA,PNW,AK'],
  ['Hairy Woodpecker', 'Dryobates villosus', 'woodpecker', 'Y:NE,MA,SE,FL,MW,GP,TX,RM,SW,CA,PNW,AK'],
  ['Red-bellied Woodpecker', 'Melanerpes carolinus', 'woodpecker', 'Y:NE,MA,SE,FL,MW,GP,TX'],
  ['Red-headed Woodpecker', 'Melanerpes erythrocephalus', 'woodpecker', 'Y:MA,SE,FL,MW,TX S:GP'],
  ['Acorn Woodpecker', 'Melanerpes formicivorus', 'woodpecker', 'Y:CA,SW,PNW,TX'],
  ['Northern Flicker', 'Colaptes auratus', 'woodpecker', 'Y:NE,MA,SE,FL,MW,GP,TX,RM,SW,CA,PNW S:AK'],
  ['Pileated Woodpecker', 'Dryocopus pileatus', 'woodpecker', 'Y:NE,MA,SE,FL,MW,TX,RM,CA,PNW'],
  ['Yellow-bellied Sapsucker', 'Sphyrapicus varius', 'woodpecker', 'S:NE,MW W:MA,SE,FL,TX'],
  ['Belted Kingfisher', 'Megaceryle alcyon', 'other', 'Y:NE,MA,SE,MW,GP,RM,CA,PNW S:AK W:TX,FL,SW'],

  // Hummingbirds & swifts
  ['Ruby-throated Hummingbird', 'Archilochus colubris', 'hummer', 'S:NE,MA,SE,FL,MW,GP,TX'],
  ["Anna's Hummingbird", 'Calypte anna', 'hummer', 'Y:CA,PNW,SW'],
  ['Black-chinned Hummingbird', 'Archilochus alexandri', 'hummer', 'S:SW,TX,RM,CA'],
  ['Rufous Hummingbird', 'Selasphorus rufus', 'hummer', 'S:PNW,AK M:CA,RM,SW'],
  ['Chimney Swift', 'Chaetura pelagica', 'hummer', 'S:NE,MA,SE,FL,MW,GP,TX'],
  ['Common Nighthawk', 'Chordeiles minor', 'other', `S:${L48}`],

  // Doves, quail & turkeys
  ['Mourning Dove', 'Zenaida macroura', 'ground', `Y:${L48}`],
  ['Rock Pigeon', 'Columba livia', 'ground', `Y:${L48},AK,HI`],
  ['Eurasian Collared-Dove', 'Streptopelia decaocto', 'ground', 'Y:SE,FL,MW,GP,TX,RM,SW,CA,PNW'],
  ['Wild Turkey', 'Meleagris gallopavo', 'ground', `Y:${L48},HI`],
  ['Northern Bobwhite', 'Colinus virginianus', 'ground', 'Y:MA,SE,FL,MW,GP,TX'],
  ['California Quail', 'Callipepla californica', 'ground', 'Y:CA,PNW,RM'],
  ["Gambel's Quail", 'Callipepla gambelii', 'ground', 'Y:SW,CA,RM'],
  ['Ring-necked Pheasant', 'Phasianus colchicus', 'ground', 'Y:MW,GP,RM,PNW,CA,HI'],
  ['Greater Roadrunner', 'Geococcyx californianus', 'ground', 'Y:SW,TX,CA,GP'],

  // Ducks, geese & loons
  ['Mallard', 'Anas platyrhynchos', 'waterfowl', 'Y:NE,MA,MW,GP,RM,SW,CA,PNW,AK W:SE,FL,TX'],
  ['Canada Goose', 'Branta canadensis', 'waterfowl', 'Y:NE,MA,SE,MW,GP,RM,CA,PNW S:AK W:TX,SW,FL'],
  ['Snow Goose', 'Anser caerulescens', 'waterfowl', 'S:AK W:TX,CA,SE,MA,SW M:GP,MW'],
  ['Wood Duck', 'Aix sponsa', 'waterfowl', 'Y:MA,SE,FL,TX,CA,PNW S:NE,MW,GP'],
  ['Northern Pintail', 'Anas acuta', 'waterfowl', 'S:AK,GP,RM W:CA,TX,SE,FL,SW,MA,HI'],
  ['Bufflehead', 'Bucephala albeola', 'waterfowl', `S:AK W:${L48}`],
  ['Hooded Merganser', 'Lophodytes cucullatus', 'waterfowl', 'Y:MA,PNW S:NE,MW W:SE,FL,TX,CA,SW,GP'],
  ['Common Loon', 'Gavia immer', 'waterfowl', 'S:NE,MW,RM,AK W:MA,SE,FL,TX,CA,PNW'],
  ['Pied-billed Grebe', 'Podilymbus podiceps', 'waterfowl', 'Y:MA,SE,FL,TX,SW,CA,PNW S:NE,MW,GP,RM'],
  ['American Coot', 'Fulica americana', 'waterfowl', 'Y:CA,SW,PNW S:MW,GP,RM W:MA,SE,FL,TX'],
  ['Nene (Hawaiian Goose)', 'Branta sandvicensis', 'waterfowl', 'Y:HI'],

  // Herons & cranes
  ['Great Blue Heron', 'Ardea herodias', 'wader', `Y:${L48},AK`],
  ['Great Egret', 'Ardea alba', 'wader', 'Y:SE,FL,TX,CA,SW S:NE,MA,MW,GP,PNW'],
  ['Snowy Egret', 'Egretta thula', 'wader', 'Y:SE,FL,TX,CA S:NE,MA,RM,SW'],
  ['Green Heron', 'Butorides virescens', 'wader', 'Y:SE,FL,TX,CA,SW S:NE,MA,MW,GP'],
  ['Roseate Spoonbill', 'Platalea ajaja', 'wader', 'Y:FL,TX,SE'],
  ['Sandhill Crane', 'Antigone canadensis', 'wader', 'Y:FL S:MW,RM,PNW,AK W:TX,SW,CA M:GP'],

  // Gulls, pelicans & shorebirds
  ['Killdeer', 'Charadrius vociferus', 'shore', 'Y:MA,SE,FL,TX,SW,CA,PNW S:NE,MW,GP,RM,AK'],
  ['Ring-billed Gull', 'Larus delawarensis', 'shore', 'Y:NE,MW S:GP,RM W:MA,SE,FL,TX,SW,CA,PNW'],
  ['Herring Gull', 'Larus argentatus', 'shore', 'Y:NE,MA,MW S:AK W:SE,FL,TX,CA,PNW'],
  ['Laughing Gull', 'Leucophaeus atricilla', 'shore', 'Y:SE,FL,TX S:NE,MA'],
  ['Brown Pelican', 'Pelecanus occidentalis', 'shore', 'Y:FL,SE,TX,CA S:MA,PNW'],
  ['American White Pelican', 'Pelecanus erythrorhynchos', 'shore', 'S:GP,RM,MW W:FL,TX,CA,SE,SW'],
  ['Double-crested Cormorant', 'Nannopterum auritum', 'shore', 'Y:SE,FL,CA,PNW S:NE,MA,MW,GP,RM,AK W:TX'],

  // Hawks, eagles & owls
  ['Bald Eagle', 'Haliaeetus leucocephalus', 'raptor', 'Y:NE,MA,SE,FL,MW,RM,CA,PNW,AK W:GP,TX,SW'],
  ['Osprey', 'Pandion haliaetus', 'raptor', 'Y:FL,CA,TX S:NE,MA,SE,MW,GP,RM,PNW,AK'],
  ['Red-tailed Hawk', 'Buteo jamaicensis', 'raptor', `Y:${L48} S:AK`],
  ['Red-shouldered Hawk', 'Buteo lineatus', 'raptor', 'Y:MA,SE,FL,TX,CA S:NE,MW'],
  ["Cooper's Hawk", 'Astur cooperii', 'raptor', `Y:${L48}`],
  ['American Kestrel', 'Falco sparverius', 'raptor', `Y:${L48} S:AK`],
  ['Peregrine Falcon', 'Falco peregrinus', 'raptor', 'Y:NE,MA,MW,RM,SW,CA,PNW S:AK W:SE,FL,TX,GP'],
  ['Turkey Vulture', 'Cathartes aura', 'raptor', 'Y:MA,SE,FL,TX,SW,CA S:NE,MW,GP,RM,PNW'],
  ['Black Vulture', 'Coragyps atratus', 'raptor', 'Y:MA,SE,FL,TX,MW'],
  ['Great Horned Owl', 'Bubo virginianus', 'raptor', `Y:${L48},AK`],
  ['Barred Owl', 'Strix varia', 'raptor', 'Y:NE,MA,SE,FL,MW,TX,RM,PNW'],
  ['Eastern Screech-Owl', 'Megascops asio', 'raptor', 'Y:NE,MA,SE,FL,MW,GP,TX'],
  ['Snowy Owl', 'Bubo scandiacus', 'raptor', 'Y:AK W:NE,MW,GP'],
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function parseRange(str) {
  const range = {}
  for (const part of (str || '').split(/\s+/).filter(Boolean)) {
    const [code, list] = part.split(':')
    for (const r of list.split(',')) range[r] = code
  }
  return range
}

export const SPECIES = DATA.map(([name, sci, group, range]) => ({
  id: slug(name),
  name,
  sci,
  group,
  range: parseRange(range),
}))

export const presentIn = (bird, region, season) => {
  const st = bird.range?.[region]
  if (!st) return false
  return SEASONS.find((s) => s.id === season).shows.includes(st)
}

export const allAboutBirdsUrl = (bird) =>
  `https://www.allaboutbirds.org/guide/${bird.name.replace(/\s*\(.*\)/, '').replace(/'/g, '').replace(/[\s-]+/g, '_')}/maps-range`

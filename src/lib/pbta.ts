/**
 * PBtA character system (B2.1) — the homebrew Durmstrang ruleset.
 *
 * This is a CUSTOM Powered-by-the-Apocalypse derivative, extracted from the
 * group's public Notion (see docs/pbta-schema.md). It is NOT standard Apocalypse
 * World — the six stats, the five rune-Houses, the conditions-as-harm track, the
 * Hope/XP/galleon economy and the non-standard dice ladder are all bespoke.
 *
 * A character is built from three layers: the *mechanical* sheet, the *Day*
 * narrative (magical realism), and the *Night* narrative (epic fairy-tale).
 *
 * Per-field editability is declared here once (FIELD_META + EDIT_RULES) and the
 * card UI reads it for both the player view (B2.2) and the GM editor (B2.4); the
 * advancement gate (B2.3) unlocks `advancementLocked` fields for the player.
 */

// ---- Stats (Параметры) -----------------------------------------------------

export const STAT_KEYS = ['dex', 'end', 'will', 'mag', 'per', 'wit'] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export interface StatDef {
  key: StatKey;
  en: string;
  ru: string;
  blurb: string;
}

export const STATS: Record<StatKey, StatDef> = {
  dex: { key: 'dex', en: 'Dexterity', ru: 'Ловкость', blurb: 'Acting quickly, nimbly, precisely.' },
  end: { key: 'end', en: 'Endurance', ru: 'Выносливость', blurb: 'Carrying weight, sustaining strain, resisting.' },
  will: { key: 'will', en: 'Willpower', ru: 'Сила Воли', blurb: 'Moral stability, resisting mind-magic, focus.' },
  mag: { key: 'mag', en: 'Magic', ru: 'Магия', blurb: 'The raw strength of magical effects.' },
  per: { key: 'per', en: 'Perception', ru: 'Восприятие', blurb: 'Attention, vigilance, reading a situation.' },
  wit: { key: 'wit', en: 'Wits', ru: 'Сообразительность', blurb: 'Memory, study, logical connections.' },
};

/** The fixed array a new character distributes across the six stats. */
export const STARTING_STAT_ARRAY = [-2, -1, 0, 0, 0, 1] as const;

// ---- Houses (Дома) — the rune-archetypes ----------------------------------

export type HouseId = 'teiwaz' | 'ansuz' | 'raido' | 'algiz' | 'uruz';

export interface HouseDef {
  id: HouseId;
  en: string;
  ru: string;
  rune: string;
  /** The house's primary stat — set to +1 from the starting array. */
  primary: StatKey;
  spec: string;
  head: string;
  element: string;
  symbol: string;
  /** Starting kit beyond the common student supplies. */
  kit: string;
}

export const HOUSES: HouseDef[] = [
  { id: 'teiwaz', en: 'Teiwaz', ru: 'Тейваз', rune: 'ᛏ', primary: 'end', spec: 'Attack & shield magic, combat', head: 'Илиана Матей', element: 'Metal', symbol: 'Warrior', kit: 'A knife' },
  { id: 'ansuz', en: 'Ansuz', ru: 'Ансуз', rune: 'ᚨ', primary: 'will', spec: 'Mental magic & divination', head: 'Кольбьёрн Бьёрднссон', element: 'Air', symbol: 'Spirit', kit: 'A set of divination tools' },
  { id: 'raido', en: 'Raido', ru: 'Райдо', rune: 'ᚱ', primary: 'per', spec: 'Transfiguration & potions', head: 'Эрик Ландау', element: 'Water', symbol: 'Wheel', kit: 'Two Simpla-level potions' },
  { id: 'algiz', en: 'Algiz', ru: 'Альгиз', rune: 'ᛉ', primary: 'wit', spec: 'Care of creatures, herbology, artefactology', head: 'Валерио Горини', element: 'Fire', symbol: 'Elk', kit: 'Potion ingredients + animal feed for one turn' },
  { id: 'uruz', en: 'Uruz', ru: 'Уруз', rune: 'ᚢ', primary: 'dex', spec: 'Healing magic & necromancy', head: 'Фердинанд Ангальт-Дессауская', element: 'Earth', symbol: 'Bull', kit: "A healer's kit (bandages, scalpel, needle & thread)" },
];

export const HOUSE_BY_ID: Record<HouseId, HouseDef> = HOUSES.reduce(
  (acc, h) => {
    acc[h.id] = h;
    return acc;
  },
  {} as Record<HouseId, HouseDef>,
);

// ---- Conditions (Состояния) — the harm track ------------------------------

export type ConditionLevel = 'none' | 'normal' | 'serious';

export interface ConditionDef {
  stat: StatKey;
  en: string;
  ru: string;
}

/** One condition per stat. Normal = −1 to that stat; Serious = −6. */
export const CONDITIONS: Record<StatKey, ConditionDef> = {
  dex: { stat: 'dex', en: 'Concussed', ru: 'Контужен' },
  end: { stat: 'end', en: 'Weakened', ru: 'Ослаблен' },
  will: { stat: 'will', en: 'Suppressed', ru: 'Подавлен' },
  mag: { stat: 'mag', en: 'Exhausted', ru: 'Истощён' },
  per: { stat: 'per', en: 'Distracted', ru: 'Рассеян' },
  wit: { stat: 'wit', en: 'Slowed', ru: 'Заторможен' },
};

export const CONDITION_PENALTY: Record<ConditionLevel, number> = { none: 0, normal: -1, serious: -6 };

/**
 * Critical state (Критическое состояние): any of — 4+ conditions across stats,
 * OR 2+ serious, OR 1 serious + 2 normal.
 */
export function isCritical(conditions: Record<StatKey, ConditionLevel>): boolean {
  const levels = STAT_KEYS.map((k) => conditions[k] ?? 'none');
  const normal = levels.filter((l) => l === 'normal').length;
  const serious = levels.filter((l) => l === 'serious').length;
  const total = normal + serious;
  return total >= 4 || serious >= 2 || (serious >= 1 && normal >= 2);
}

// ---- Blood status & tiers --------------------------------------------------

export const BLOOD_STATUS: { value: string; label: string }[] = [
  { value: 'pureblood', label: 'Pure-blood (Чистокровный)' },
  { value: 'halfblood', label: 'Half-blood (Полукровка)' },
  { value: 'muggleborn', label: 'Muggle-born (Магглорожденный)' },
  { value: 'being', label: 'Being / Creature (Существо)' },
  { value: 'other', label: 'Other / Unknown (Другое)' },
];

export type Tier = 'simpla' | 'maxima' | 'ultima';
export const TIERS: { value: Tier; label: string }[] = [
  { value: 'simpla', label: 'Simpla (Симпла)' },
  { value: 'maxima', label: 'Maxima (Максима)' },
  { value: 'ultima', label: 'Ultima (Ультима)' },
];

export type CharStatus = 'alive' | 'wounded' | 'dead' | 'unknown';

// ---- Moves (Ходы) ----------------------------------------------------------

export type MoveKind = 'basic' | 'general' | 'house' | 'personal';

export interface MoveDef {
  id: string;
  en: string;
  ru: string;
  kind: MoveKind;
  /** Stat usually rolled, when fixed. */
  stat?: StatKey;
  /** XP cost to learn after creation (general/house/personal). */
  xp?: number;
  trigger: string;
}

/** Basic moves — every character has these by default. */
export const BASIC_MOVES: MoveDef[] = [
  { id: 'study', en: 'Study', ru: 'Изучаю', kind: 'basic', stat: 'per', trigger: 'Learn more about an unclear place, person or circumstance.' },
  { id: 'recall', en: 'Recall', ru: 'Вспоминаю', kind: 'basic', stat: 'wit', trigger: 'You suspect you once heard or read of this.' },
  { id: 'help', en: 'Help / Hinder', ru: 'Помогаю\\Мешаю', kind: 'basic', trigger: "Affect another character's result — roll the stat they roll." },
  { id: 'cast', en: 'Cast magic', ru: 'Применяю магию', kind: 'basic', stat: 'mag', trigger: 'Use magic you know and know how to use.' },
  { id: 'cover', en: 'Take cover', ru: 'Укрываюсь', kind: 'basic', stat: 'dex', trigger: 'Shield yourself behind someone or something.' },
  { id: 'getup', en: 'Get up', ru: 'Встаю', kind: 'basic', stat: 'end', trigger: 'You have been knocked off your feet.' },
  { id: 'strip', en: 'Strip an advantage', ru: 'Лишаю преимущества', kind: 'basic', trigger: "Your action aims to remove an opponent's edge." },
  { id: 'create', en: 'Create an advantage', ru: 'Создаю Преимущество', kind: 'basic', trigger: 'Arrange the situation to make the fight easier.' },
  { id: 'intimate', en: 'Share something intimate', ru: 'Делюсь сокровенным', kind: 'basic', trigger: 'Share something truly important with another character.' },
  { id: 'memory', en: 'Share a memory', ru: 'Делюсь воспоминанием', kind: 'basic', trigger: 'In peace, share a memory of an event that changed you.' },
  { id: 'imthere', en: "I'm There", ru: 'Оказываюсь рядом', kind: 'basic', stat: 'will', trigger: 'Someone is crossing the line toward being Neutralized.' },
  { id: 'endfight', en: 'End the fight', ru: 'Заканчиваю бой', kind: 'basic', trigger: 'The conflict is against a mook — not a plot character or boss.' },
  { id: 'oath', en: 'Give an Oath', ru: 'Даю Обет', kind: 'basic', trigger: 'You swear an oath, taking on an obligation.' },
  { id: 'sacrifice', en: 'Sacrifice yourself', ru: 'Жертвую собой', kind: 'basic', trigger: 'Someone truly important is dying and you are aware.' },
  { id: 'drama', en: 'Drama', ru: 'Драма', kind: 'basic', trigger: "You can't resolve a morally critical situation now." },
  { id: 'artifact', en: 'Use an artifact', ru: 'Использую артефакт', kind: 'basic', trigger: 'Use an artifact or enchanted item.' },
  { id: 'charm', en: 'Use a charm', ru: 'Использую чару', kind: 'basic', stat: 'end', trigger: 'Cast a charm and no other move fits.' },
  { id: 'fairytale', en: 'Tell a fairy tale', ru: 'Рассказываю сказку', kind: 'basic', stat: 'mag', trigger: 'Publicly tell a tale alluding to your life.' },
];

/** General moves — anyone may take them; pick 2 at creation. `xp` = cost to learn later. */
export const GENERAL_MOVES: MoveDef[] = [
  { id: 'composure', en: 'Pull yourself together', ru: 'Беру себя в руки', kind: 'general', stat: 'will', xp: 10, trigger: 'Faced with something psyche-shaking or paralyzing.' },
  { id: 'persuade', en: 'Negotiate / Persuade', ru: 'Договариваюсь', kind: 'general', stat: 'will', xp: 10, trigger: 'You have leverage on another character.' },
  { id: 'hide', en: 'Hide', ru: 'Прячусь', kind: 'general', stat: 'dex', xp: 10, trigger: 'You want to stay unseen in a space.' },
  { id: 'search', en: 'Search', ru: 'Ищу', kind: 'general', stat: 'per', xp: 5, trigger: 'You want to find something hidden.' },
  { id: 'breakfree', en: 'Break free', ru: 'Вырываюсь', kind: 'general', stat: 'end', xp: 5, trigger: 'You are held or bound.' },
  { id: 'shieldbody', en: 'Shield with your body', ru: 'Закрываю собой', kind: 'general', xp: 10, trigger: 'Take everything aimed at another character onto yourself.' },
  { id: 'pushaway', en: 'Push away', ru: 'Отталкиваю', kind: 'general', stat: 'end', xp: 5, trigger: 'Push an adjacent character aside.' },
  { id: 'savefall', en: 'Save yourself from a fall', ru: 'Спасаюсь, когда падаю', kind: 'general', xp: 15, trigger: 'You fall from a great height.' },
  { id: 'broom', en: 'Fly a broom', ru: 'Летаю на метле', kind: 'general', stat: 'dex', xp: 15, trigger: 'You get a chance to fly.' },
  { id: 'ultima', en: 'Use Ultima', ru: 'Использую Ультиму', kind: 'general', stat: 'mag', xp: 40, trigger: 'Use Ultima-level magic and its moves.' },
  { id: 'ritual', en: 'Perform a Ritual', ru: 'Совершаю Ритуал', kind: 'general', xp: 30, trigger: 'You perform a ritual (a long action).' },
];

export const MOVE_BY_ID: Record<string, MoveDef> = [...BASIC_MOVES, ...GENERAL_MOVES].reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, MoveDef>,
);

// ---- Advancement (Развитие персонажа) -------------------------------------

/** XP to raise a stat from `from` to `from + 1`. */
export function statRaiseCost(from: number): number {
  if (from < -2) return 10;
  switch (from) {
    case -2: return 15;
    case -1: return 25;
    case 0: return 35;
    case 1: return 45;
    default: return 45 + (from - 1) * 10;
  }
}

export const MOVE_COST = { basic: 10, houseOwn: 15, houseOther: 25, personal: 40 } as const;

// ---- The character itself --------------------------------------------------

export interface Bond {
  id: string;
  who: string;
  hashtags: string[];
  note?: string;
}

export interface KnownMove {
  /** Catalog id when from BASIC/GENERAL_MOVES; absent for free-form house/personal moves. */
  id?: string;
  name: string;
  kind: MoveKind;
  note?: string;
}

export interface Character {
  // identity
  cardName: string;
  fullName: string;
  status: CharStatus;
  portrait: string;
  // mechanical
  house: HouseId | '';
  age: number | null;
  tier: Tier;
  stats: Record<StatKey, number>;
  conditions: Record<StatKey, ConditionLevel>;
  neutralized: boolean;
  moves: KnownMove[];
  innateTalents: string[];
  charms: string[];
  inventory: string[];
  // resources
  xp: number;
  level: number;
  hope: number;
  galleons: number;
  studentRating: number | null;
  advancementOpen: boolean;
  // day narrative
  clubs: string[];
  bloodStatus: string;
  bonds: Bond[];
  nationality: string;
  occupation: string;
  religion: string;
  socialClass: string;
  background: string;
  politics: string;
  oaths: string[];
  curses: string[];
  prophecies: string[];
  fearsDreamsGoals: string;
  // night narrative
  nightImage: string;
  // gm-only
  notesGm: string;
}

/** A fresh character draft — stats default with the House primary set to +1. */
export function newCharacter(house: HouseId | '' = ''): Character {
  const stats: Record<StatKey, number> = { dex: 0, end: 0, will: 0, mag: 0, per: 0, wit: 0 };
  if (house) {
    // Lay the array onto the non-primary stats, the +1 onto the house primary.
    const primary = HOUSE_BY_ID[house].primary;
    const rest = STAT_KEYS.filter((k) => k !== primary);
    const pool = [-2, -1, 0, 0, 0];
    rest.forEach((k, i) => { stats[k] = pool[i]; });
    stats[primary] = 1;
  }
  const conditions: Record<StatKey, ConditionLevel> = { dex: 'none', end: 'none', will: 'none', mag: 'none', per: 'none', wit: 'none' };
  return {
    cardName: '', fullName: '', status: 'alive', portrait: '',
    house, age: null, tier: 'maxima', stats, conditions, neutralized: false,
    moves: [], innateTalents: [], charms: [], inventory: [],
    xp: 0, level: 1, hope: 1, galleons: 0, studentRating: null, advancementOpen: false,
    clubs: [], bloodStatus: '', bonds: [], nationality: '', occupation: '', religion: '',
    socialClass: '', background: '', politics: '', oaths: [], curses: [], prophecies: [],
    fearsDreamsGoals: '', nightImage: '', notesGm: '',
  };
}

// ---- Per-field editability -------------------------------------------------

export type EditableBy = 'player' | 'gm' | 'derived';
export type FieldGroup = 'identity' | 'mechanical' | 'day' | 'night' | 'resource' | 'gm';
export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'tags' | 'list';

export interface FieldMeta {
  key: keyof Character;
  label: string;
  ru?: string;
  group: FieldGroup;
  type: FieldType;
  options?: { value: string; label: string }[];
  editableBy: EditableBy;
  /** Locked for the player except at creation or while advancement is open. */
  advancementLocked?: boolean;
  /** Visible only to the GM (and the card's bearer never sees it). */
  gmOnly?: boolean;
  hint?: string;
}

/**
 * Scalar / list fields rendered by the descriptor-driven form. Stats, conditions,
 * moves and bonds are bespoke sections but obey the same EDIT_RULES via their keys.
 */
export const FIELD_META: FieldMeta[] = [
  { key: 'cardName', label: 'Card name', ru: 'Имя на карте', group: 'identity', type: 'text', editableBy: 'player', hint: 'The name others know — not your true full name.' },
  { key: 'fullName', label: 'True full name', ru: 'Имя персонажа', group: 'identity', type: 'text', editableBy: 'player', hint: 'Used in rituals; sharing it is intimate.' },
  { key: 'status', label: 'Standing', group: 'identity', type: 'select', editableBy: 'gm', options: [
    { value: 'alive', label: 'Alive' }, { value: 'wounded', label: 'Wounded' }, { value: 'dead', label: 'Fallen' }, { value: 'unknown', label: 'Unknown' },
  ] },

  { key: 'house', label: 'House', ru: 'Дом', group: 'mechanical', type: 'select', editableBy: 'player', advancementLocked: true, options: HOUSES.map((h) => ({ value: h.id, label: `${h.rune}  ${h.en} (${h.ru})` })) },
  { key: 'age', label: 'Age', ru: 'Возраст', group: 'mechanical', type: 'number', editableBy: 'player', hint: 'All player characters are senior students.' },
  { key: 'tier', label: 'Tier reached', ru: 'Симпла/Максима/Ультима', group: 'mechanical', type: 'select', editableBy: 'gm', options: TIERS },
  { key: 'charms', label: 'Charms known', ru: 'Чары', group: 'mechanical', type: 'list', editableBy: 'player' },
  { key: 'innateTalents', label: 'Innate talents', ru: 'Врожденные таланты', group: 'mechanical', type: 'list', editableBy: 'player', advancementLocked: true, hint: 'Personal moves that can only be taken at creation.' },
  { key: 'inventory', label: 'Inventory', ru: 'Инвентарь', group: 'mechanical', type: 'list', editableBy: 'player' },

  { key: 'xp', label: 'Experience', ru: 'Очки опыта', group: 'resource', type: 'number', editableBy: 'gm', hint: 'Granted by the master; spent at level-up.' },
  { key: 'level', label: 'Level', ru: 'Уровень', group: 'resource', type: 'number', editableBy: 'gm' },
  { key: 'hope', label: 'Hope', ru: 'Очки Надежды', group: 'resource', type: 'number', editableBy: 'player' },
  { key: 'galleons', label: 'Galleons', ru: 'Галлеоны', group: 'resource', type: 'number', editableBy: 'gm' },
  { key: 'studentRating', label: 'Student rating', ru: 'Студенческий рейтинг', group: 'resource', type: 'number', editableBy: 'gm', gmOnly: false, hint: 'Set by the masters of the school.' },

  { key: 'clubs', label: 'Clubs', ru: 'Клубы', group: 'day', type: 'list', editableBy: 'player' },
  { key: 'bloodStatus', label: 'Blood status', ru: 'Статус крови', group: 'day', type: 'select', editableBy: 'player', options: BLOOD_STATUS },
  { key: 'nationality', label: 'Nationality', ru: 'Национальность', group: 'day', type: 'text', editableBy: 'player' },
  { key: 'occupation', label: 'Occupation', ru: 'Род занятий', group: 'day', type: 'text', editableBy: 'player' },
  { key: 'religion', label: 'Religion', ru: 'Религия', group: 'day', type: 'text', editableBy: 'player' },
  { key: 'socialClass', label: 'Social class', ru: 'Социальный слой', group: 'day', type: 'text', editableBy: 'player' },
  { key: 'background', label: 'History', ru: 'История персонажа', group: 'day', type: 'textarea', editableBy: 'player' },
  { key: 'politics', label: 'Political views', ru: 'Политические взгляды', group: 'day', type: 'text', editableBy: 'player' },
  { key: 'oaths', label: 'Oaths & vows', ru: 'Обеты и клятвы', group: 'day', type: 'list', editableBy: 'player' },

  { key: 'nightImage', label: 'Night image', ru: 'Ночной образ', group: 'night', type: 'textarea', editableBy: 'player', hint: 'If your character were a saga or fairy tale — what would it be? Gates Night sessions.' },

  // GM-facing narrative — the bearer should not author these.
  { key: 'curses', label: 'Curses', ru: 'Проклятия', group: 'gm', type: 'list', editableBy: 'gm', gmOnly: true },
  { key: 'prophecies', label: 'Prophecies', ru: 'Пророчества', group: 'gm', type: 'list', editableBy: 'gm', gmOnly: true },
  { key: 'fearsDreamsGoals', label: 'Fears, dreams, goals', ru: 'Страхи, мечты, цели', group: 'gm', type: 'textarea', editableBy: 'gm', gmOnly: true },
  { key: 'notesGm', label: "Master's notes", group: 'gm', type: 'textarea', editableBy: 'gm', gmOnly: true },
];

export type CardRole = 'player' | 'master' | 'admin';

/**
 * May this role edit this field right now? The single authority both the player
 * card (B2.2) and the GM editor (B2.4) consult.
 *
 * - GM (master/admin) edits anything that is not purely derived.
 * - The player edits their `player` fields; `gm` fields are read-only to them.
 * - `advancementLocked` fields (stats, House, moves, innate talents) open to the
 *   player only on a never-published card (creation) or while the GM has opened
 *   advancement (the assessment gate, B2.3).
 */
export function canEditField(
  meta: Pick<FieldMeta, 'editableBy' | 'advancementLocked'>,
  role: CardRole,
  ctx: { advancementOpen: boolean; isNew: boolean },
): boolean {
  if (meta.editableBy === 'derived') return false;
  if (role === 'master' || role === 'admin') return true;
  if (meta.editableBy === 'gm') return false;
  if (meta.advancementLocked) return ctx.advancementOpen || ctx.isNew;
  return true;
}

export function isGmRole(role: CardRole): boolean {
  return role === 'master' || role === 'admin';
}

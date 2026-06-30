# TriWizard / Durmstrang — PBtA Character System Schema

Extracted from the public Notion site `flicker-zipper-4ae.notion.site` (root page id `2c0fc7e2-4caf-8171-8f0b-eb0490028f9f`). Source is in Russian; below each term the original Russian is given in parentheses.

This is a **custom Powered-by-the-Apocalypse derivative**, NOT standard Apocalypse World / Dungeon World. The dice math, success tiers, and the "house" structure are all non-standard — do not assume generic PBtA values. A character is explicitly built from **three layers (три пласта)**: *mechanical (механический)*, *narrative-Day (нарративный — день)*, and *narrative-Night (нарративный — ночь)*.

Setting time: in-world year **1940**. All player characters are **senior-year students** (courses ~10–14) at Durmstrang.

---

## STATS (Параметры / Атрибуты)

Six core stats. At creation a player has the value array **`-2, -1, 0, 0, 0, +1`** to distribute freely across the six. The stat that is the **primary stat of the character's House gets +1** (this is the +1 from the array, assigned to the house stat). Stats can be raised via XP (see Advancement) and can also be *lowered* by in-game events.

| Stat (EN) | Stat (RU) | What it governs | Default range |
|---|---|---|---|
| Dexterity / Agility | Ловкость | Acting quickly, nimbly, precisely, gracefully | -2 … +2 at start, raisable further |
| Endurance / Stamina | Выносливость | Carry weight, sustaining physical strain, immunity/resistance | same |
| Willpower | Сила Воли | Moral stability, resistance to mental magic, concentration | same |
| Magic | Магия | Direct strength of magical effects; some Night-related susceptibility | same |
| Perception | Восприятие (also called "Внимание" in Conflicts page) | Attention, vigilance, inferring non-obvious things from context | same |
| Wits / Cleverness | Сообразительность | Memory, processing study material, knowledge, building logical connections | same |

Starting array confirmed: "На старте каждый персонаж имеет значения: -2, -1, 0, 0, 0, +1. Как распределять их по параметрам - решение игрока. Параметр являющийся основным для дома получает значение +1."

House → primary stat mapping (the house's primary stat is set to +1):
- Тейваз (Teiwaz) → Endurance (Выносливость)
- Ансуз (Ansuz) → Willpower (Сила Воли)
- Райдо (Raido) → Perception (Восприятие)
- Альгиз (Algiz) → Wits (Сообразительность)
- Уруз (Uruz) → Dexterity (Ловкость)

---

## CORE SHEET FIELDS

### Mechanical layer
| Field (EN / RU) | Type | Edited by | Notes |
|---|---|---|---|
| Six stats (see STATS) | 6 × integer | player at creation; player+GM via XP/events | starts from the fixed array |
| House (Дом) | single-select: Тейваз / Ансуз / Райдо / Альгиз / Уруз | player | "the backbone of your concept"; determines the pool of moves you may take, philosophy, group, team role, and your +1 primary stat |
| Known moves (Ходы) | list | player at creation, both via XP later | All chars get **basic moves (базовые ходы)** automatically; at creation pick **2 general/common moves (общие ходы)** + **4 house moves (ходы дома)** + **1 individual/personal move (индивидуальный ход)** invented/agreed with GM. See age scaling below. |
| Age (Возраст) | number | player | Affects both narrative permissions AND mechanics: the younger the character, the harder some rolls and the fewer things they can do. All PCs are senior students. |
| Skill/discipline tier reached (Симпла / Максима / Ультима) | derived from age + house | player+GM | Average senior level is **Maxima (Максима)** — can take both Simpla and Maxima moves. Courses 13–14 may gain some **Ultima (Ультима)** knowledge by GM agreement. |
| Charms known (Чары) | list with counts | player+GM | Everyone knows household charms (бытовые чары, untracked). "Hooligan" charms (хулиганские) mostly students. Combat/attack charms (боевые/атакующие): a **Teiwaz** student may know **10 + 1 per completed year after the 10th**; students of other houses know **1** combat charm; **Dueling Club (дуэльный клуб)** members get **+1 charm per year in the club**. Shield charms (щитовые чары) **only Teiwaz**. Some specialized charms (healing/mental) restricted to the relevant house. |
| Special skills tier (Специальные навыки) | per-discipline | player+GM | Each house has its own obvious specialization skills (see ARCHETYPES). |
| Innate talents (Врожденные таланты) | list | player at creation ONLY | They are individual moves that **cannot be acquired after character creation**. |

#### Move counts by age
- Under 18: stop after the base set (2 general + 4 house + 1 personal).
- Ages 18–19: may pick **one additional house move**.
- Ages 20–21: may pick **two additional house moves AND one house move and one personal move** (text reads "еще два хода дома и один ход дома и один личный" — see UNCERTAINTIES; likely +2 house, +1 house, +1 personal).

### Narrative layer — Day (Нарративный пласт — День)
Fields marked `*` are not strictly mandatory, especially at game start ("Параметры отмеченные * не являются прям обязательными").

| Field (EN / RU) | Type | Mechanically significant? | Notes |
|---|---|---|---|
| Full Name (Имя персонажа) | text | YES | Full true name; used in rituals and some effects — an unambiguous pointer to a specific person. **Card names are NOT full names** (sharing your true full name is intimate). |
| House (Дом) | single-select (as above) | YES | also a narrative field (philosophy, group belonging) |
| Clubs (Клубы) | multi-select / list | partly | A student may belong to several clubs; "hardly more than three" by workload. Can be **head (глава) of only one** club. Dueling Club gives bonus combat charms. |
| Blood status (Статус крови) | single-select: **Чистокровный (Pure-blood) / Полукровка (Half-blood) / Магглорожденный (Muggle-born) / Существо (Being/Creature) / Другое\Неизвестен (Other/Unknown)** | partly (social + some charm conditions, e.g. Гремио, Ювенис Митерре) | A largely social parameter; affects the society the character grew up in. Options confirmed from the live "Персонажи" character database schema. |
| Bonds / Relationships (Связи) | list of relationships, each with hashtags (хештеги) | YES | Answers "how and whom the character knows" and the **hashtags (хештеги)** of those relationships. Hashtags can change roll modifiers / enable moves in specific situations and can extend a "Critical state" (see OTHER MECHANICS). This is the system's analogue of Hx/bonds. |
| Nationality (Национальность) | text | no (cultural) | defines cultural code (free text, confirmed in character DB) |
| Occupation (Род Занятий) | text | no | present as a field in the live character DB |
| Religion* (Религия) | text | no | worldview |
| Social class* (Социальный слой) | text | no | family background, occupation, wealth |
| Character history / background* (История персонажа) | text | no | backstory |
| Political views* (Политические взгляды) | text | no | |
| Oaths and vows (Обеты и клятвы) | list | YES | What the character has sworn to do. Durmstrang tradition encourages oaths (a "deal with the cosmos"). Tied to the **"Give an Oath" (Даю Обет)** move; breaking an oath (even involuntarily) gives the GM 2 Drama points each and can impose a condition. May be empty at start. |
| Curses* (Проклятия) | list | YES (GM-facing) | curses on the character |
| Prophecies* (Пророчества) | list | YES (GM-facing) | prophecies given |
| Fears, dreams, goals* (Страхи, мечты и цели) | text | YES (GM-facing) | drives the character; also relevant when facing a boggart (боггарт) |

### Narrative layer — Night (Нарративный пласт — Ночь)
| Field (EN / RU) | Type | Notes |
|---|---|---|
| Night image / fairy-tale image (Ночной образ / сказочный образ) | text (a saga/epic/tale/legend the character resembles) | "If your character were a saga, epic, fairy tale or legend — what would it be?" Characters **without** a Night image, or who radically deny Night phenomena (especially mocking them), **cannot participate in pure-Night sessions.** |

### Resource / tracking fields (all become card data)
| Field (EN / RU) | Type | Edited by | Notes |
|---|---|---|---|
| Conditions (Состояния) | multi-select, 6 types, each can be normal or "Serious" | player+GM | See OTHER MECHANICS — the harm/health track. |
| Critical state (Критическое состояние) | boolean/derived | derived | triggered by accumulating conditions |
| Neutralized (Нейтрализован) | boolean | GM | out of the conflict |
| XP / Experience points (Очки опыта) | number | player+GM | see ADVANCEMENT |
| Level (Уровень) | number | auto | increments each "turn of the wheel" |
| Hope points (Очки Надежды) | number, starts at **1** | player spends, GM/level restores | see OTHER MECHANICS |
| Resources / money (Ресурсы, in galleons / галлеоны) | number | player+GM | +15 galleons each turn of the wheel |
| Inventory / items (Инвентарь, предметы, артефакты, зелья, ингредиенты) | list | player+GM | starting kit varies by house (see below) |
| Student rating (Студенческий рейтинг) | number/rank | GM only | independent of level/XP; rises/falls from in-world actions, class performance, diligence, rumors. Recalculated after each turn of the wheel; affects perks (e.g. room assignment). |

#### Starting inventory by house
- All students: wand (волшебная палочка), uniform (мундир), change of clothes, books + bag + study supplies.
- Teiwaz (Тейваз): a knife (нож).
- Ansuz (Ансуз): one set of divination tools (комплект для гадания).
- Raido (Райдо): two Simpla-level potions (два зелья «Симпла»).
- Algiz (Альгиз): several potion ingredients (depends on complexity) + animal feed for one turn of the wheel for a chosen tamed animal.
- Uruz (Уруз): a healer's kit (бинты, скальпель, нитка с иголкой).
- With suitable backstory, may beg the GM for one family artifact (семейный артефакт).

---

## ARCHETYPES / PLAYBOOKS (Дома — Houses)

The system **does use playbook-like archetypes**, called **Houses (Дома)**, named after runes. There are **5**. Each House defines: the move pool you draw from, your +1 primary stat, a specialization (which maps to magic disciplines / special skills), starting kit, and flavor. There is also a per-house "best student" rating list (NPC roster).

| House (EN/RU) | Primary stat | Specialization (Специализация) | Head (Глава) | Color | Symbol | Element |
|---|---|---|---|---|---|---|
| Teiwaz (Тейваз) | Endurance | Attack & Shield magic, combat magic | Илиана Матей | Violet (Фиолетовый) | Warrior (Воин) | Metal |
| Ansuz (Ансуз) | Willpower | Mental magic & Divination | Кольбьёрн Бьёрднссон | Yellow | Spirit (Дух) | Air |
| Raido (Райдо) | Perception | Transfiguration & Potions | Эрик Ландау | Purple (Пурпурный) | Wheel (Колесо) | Water |
| Algiz (Альгиз) | Wits | Care of Magical Creatures, Herbology, Artefactology | Валерио Горини | Brown | Elk/Moose (Лось) | Fire |
| Uruz (Уруз) | Dexterity | Healing magic (Колдомедицина) & Necromancy | Фердинанд Ангальт-Дессауская | Burgundy (Бордовый) | Bull (Бык) | Earth |

**House-specific moves (ходы дома):** the character-creation rules say to pick "4 moves from the list of house moves." The explicit per-house move *list* is NOT a single flat page; house abilities are embedded in the **Magic discipline pages** (under the «Магия» section), keyed to each house's specialization. Those discipline pages (e.g. «Чары и боевая магия» for Teiwaz, «Ментальная магия» / «Прорицания» for Ansuz, «Трансфигурация» / «Зелья» for Raido, etc.) contain named abilities, spell tables, and sub-moves like *Legilimency (Легилименция), Occlumency (Окллюменция), Mental Walls (Ментальные Стены)*. These are gated by house and by Simpla/Maxima/Ultima tier. **See UNCERTAINTIES** — a clean, normalized house move list with triggers/dice tiers does not exist in the source; the disciplines hold spell/ability libraries rather than PBtA-formatted trigger/miss/7–9/10+ moves.

Cross-house learning: a student may take moves of **only one** other house, and never more than **(half the number of your house's moves) − 1**. Visiting other houses' courses grants limited access, only to that house's **Simpla** level.

---

## MOVES (Ходы)

Note on mechanic: **all moves roll 2d6 + the relevant stat** (the "Как играть" page: "если надо совершить бросок, то он всегда 2d6 ... if not stated otherwise"). The success tiers are NON-STANDARD (not the usual 6/7-9/10+). See the global ladder under OTHER MECHANICS. The numbers shown with a ✨ on the General moves below are their **XP cost to learn**, not roll thresholds.

### Basic moves (Базовые ходы — everyone has these by default)

| Move (EN / RU) | Trigger | Mechanic | Outcome notes |
|---|---|---|---|
| Study / Examine (Изучаю) | When a place/person/circumstance isn't fully clear and you have the chance, learn more | Roll **Perception (Восприятие)** | On a partial success you may ask only **one** question about the examined object |
| Recall (Вспоминаю) | When you face something you suspect you once heard/read | Roll **Wits (Сообразительность)** | recall what exactly it is |
| Help / Hinder (Помогаю\Мешаю) | When you want to affect another character's result | Roll the **same stat they roll** | **7–10:** ±1 to their value · **11–14:** ±2 · **15–18:** ±3 · and so on (scales by tier band) |
| Cast magic (Применяю магию) | To use magic you know and know how to use | Roll **Magic (Магия)**, then apply the move of the specific magic used | **Three failures of this roll in a session → "Exhausted" (Истощён)** condition; a further three failures → makes it Serious |
| Learn a new magical unit* (Изучаю новую магическую единицу) | When trying to learn new magic (long action) | Accumulate successes vs a threshold: **Simpla 50, Maxima 80, Ultima 150**; +30 to threshold if outside your house | Interruptible, but on interruption accumulated successes round **down** to nearest 10. **Snake-eyes (глаза змеи) wipes all accumulated points.** A magical unit = a charm, potion, animal, wound/disease, transfiguration property type, artifact property type, herb type, etc. |
| Take cover (Укрываюсь) | When in combat you try to shield yourself behind someone/something | Roll **Dexterity (Ловкость)** | higher success → fewer vulnerable parts left exposed |
| Get up (Встаю) | If knocked off your feet | Roll **Endurance (Выносливость)** | on a failure you must repeat next turn |
| Strip an advantage / Deprive of edge (Лишаю преимущества) | When your action aims to remove an opponent's edge (грань) | Pass the roll of **another move** that fits the removal condition | **11+:** removes the opponent's advantage · **7–11:** you succeed but must take a consequence of your choice (ally endangered / lose a significant item / gain a condition or serious condition / large collateral destruction / you become vulnerable or a new danger appears / something similar) |
| Create an advantage (Создаю Преимущество) | Combat move; arrange the situation to make the fight easier | Requires describing HOW the advantage is created — that determines the needed roll | — |
| Share something intimate (Делюсь сокровенным) | Each time you share something truly important with another character | (no roll) | May (not guaranteed) gain a new hashtag; gives that other character the right to use "I'm There" (Оказываюсь рядом) toward you once this session. Can hold only one such "debt" at a time. **GM loses 1 Drama point this session** (returns next). |
| Share a memory (Делюсь воспоминанием) | In a peaceful situation, share a memory of an event that changed you/your beliefs | (no roll) | May (not guaranteed) grow closer; lets them pick one: remove a (non-serious) condition / +2 on all rolls directly involving you / use "I'm There" toward you once |
| I'm There / Step in (Оказываюсь рядом) | When someone is crossing the line toward becoming Neutralized | Roll **Willpower (Сила Воли)** | extends their Critical state one more cycle; **GM gains 1 Drama point** |
| End the fight (Заканчиваю бой) | If the conflict is vs a mook (статист) — not a plot character, boss, or trial | One roll; state desired outcome up front | resolves the conflict in one roll |
| Give an Oath (Даю Обет) | When you swear an oath | (no roll) | You take on an obligation. **GM gets 2 Drama points per breach** (even accidental/forced) and may impose a condition |
| Sacrifice yourself (Жертвую собой) | When someone truly important to you is dying and you are safe and aware | (no roll, irreversible) | You die in their place; such characters **cannot bargain with death or be resurrected** |
| Drama (Драма) | When your character can't resolve a morally critical situation now (life/death, principles, meaning) | Propose to GM a past-altering (retroactive) claim or a willpower-driven course / lucky coincidence; GM judges severity | If GM agrees, the scene unfolds with you as hero-savior. **GM gains Drama points equal to the severity rating**; the cost/price is unknown in advance |
| Use an artifact / enchanted item (Использую артефакт или зачарованный предмет) | When using an artifact/enchanted item | Usually no roll; if needed, the roll & conditions are described on the item | — |
| Use a charm (Использую чару) | When you cast a charm and no other move fits | Roll **Endurance (Выносливость)** | Out of combat: normal. In combat: **−1 penalty** |
| Tell a fairy tale (Рассказываю сказку) | When you publicly tell a tale/story with allusions to your life | Roll **Magic (Магия)**; GM sets difficulty/type after you briefly describe the impulse | — |

### General / Common moves (Общие Ходы — everyone can take, but must be chosen; pick 2 at start). ✨ = XP cost to learn.

| Move (EN / RU) | XP (✨) | Trigger | Mechanic |
|---|---|---|---|
| Pull yourself together (Беру себя в руки) | 10 | Faced with something psyche-shaking or paralyzing | Roll **Willpower** to avoid consequences |
| Negotiate / Persuade (Договариваюсь) | 10 | When you have leverage on another character | Roll **Willpower**; on success they comply (sincerity scales with degree of success) |
| Hide (Прячусь) | 10 | When you want to stay unseen in a space | Roll **Dexterity** |
| Search (Ищу) | 5 | When you want to find something hidden/concealed | Roll **Perception** |
| Break free (Вырываюсь) | 5 | If held or bound | Roll **Endurance**; vs a living opponent, compare against their hold |
| Shield with your body (Закрываю собой) | 10 | Take everything aimed at another character onto yourself | All effects that were due to them this turn hit you (and what was due to you), they can't attack frontal targets; usable out of your turn. Can be prevented by the protected character pushing the protector away on their turn. |
| Push away (Отталкиваю) | 5 | Push an adjacent character aside | Describe how/which direction; roll **Strength/Endurance (силу)** |
| Save yourself from a great fall (Спасаюсь, когда падаю с большой высоты) | 15 | When falling from a great height | Roll **Dexterity, Wits, or Magic** depending on the method |
| Fly a broom (Летаю на метле) | 15 | When you get a chance to fly | Roll **Dexterity** |
| Use Ultima (Использую Ультиму) | 40 | To use Ultima-level magic and its moves | Roll **Magic twice** AND roll **Willpower**. A partial success (10 or less) on **any** of these → gain/worsen "Exhausted" (Истощён) to Serious. Partial Willpower also → "Suppressed" (Подавлен). If all succeed, perform the Ultima move. |
| Perform a Ritual (Совершаю Ритуал) | 30 | If you perform a ritual | Long action: reach a threshold of **min. 30 successes** (GM sets difficulty/roll); all participants may add their successes. **Snake-eyes zeros everyone's accumulated successes.** Must still be described/performed nicely. |
| Bless (Благословляю) | (cut off in source) | — | **See UNCERTAINTIES** — "Благословляю" header present but its body text was not captured. |

### Individual / Personal moves (Индивидуальный / Личный ход)
Each character creates/agrees one with the GM at start. Innate talents (Врожденные таланты) are a subtype of personal move that can ONLY be taken at creation. Personal moves cost ≥ 40 XP to acquire later, and not all are GM-allowed post-start.

---

## ADVANCEMENT (Развитие персонажа)

### Earning XP (Очки опыта)
- **Per session: +1 XP** automatically.
- Up to **+2 additional XP per session** (only two), awarded for any of: a great roleplay scene (vivid, engaged — a "wow" for the GM); an important plot decision; learning something genuinely important & new about the world for your character; revealing your character from a new side.
- There are also other, **hidden** ways to gain XP.
- XP can only be **spent at level-up**; otherwise it just accumulates as a tally of success.

### Level-up (Повышение уровня) — the threshold
- A level-up happens **every time the plot passes through a "turn of the wheel" (поворот колеса)**. After the turn completes (if it was a play session), **all characters' level rises automatically.**
- Characters who attended **at least one session** since the last turn get **+15 XP**; those who attended **none** get **+10 XP**.
- All spending decisions must be made **before the player's first session of the new period**; once that session starts, level-up is no longer possible for that period.
- Unspent XP carries over; for every **10 unspent XP from the previous period**, the character gains an extra **+5 XP** at the end of the next period. (Hoarding is tempting but challenges scale up each turn, so falling behind is dangerous.)
- Hope points are restored at level-up (each turn of the wheel).

### Available advances
1. **Acquire a new move (Приобретение новых ходов).** At each level-up, take **one extra move free** from the general or your-house list. Beyond that, spend XP. Standard costs: **basic moves 10**, **house moves 15** (your house) / **25** (another house), **personal moves ≥ 40** (GM-gated). Constraint: moves of one other house only, never more than (half your house's move count − 1).
2. **Improve a stat (Улучшение параметров).** XP cost by step:
   - below −2 → up: **≥10 XP**
   - −2 → −1: **15 XP**
   - −1 → 0: **25 XP**
   - 0 → +1: **35 XP**
   - +1 → +2: **45 XP**
   - each further step: **+10 XP per step**
   - Stats can also be *worsened* by events (re-improving costs XP again). An improved stat can only be improved again after **half an in-game year**.

(Student rating, see below, advances separately and is GM-controlled, not bought with XP.)

---

## OTHER MECHANICS (card-relevant)

### The dice ladder (global success tiers — Как играть)
All rolls are **2d6 + stat** unless stated. Result bands:
- **2 (two natural 1s, no modifiers) = "Snake eyes" (глаза змеи):** catastrophic critical failure; modifiers do not save you (see also «Остальные правила»). Ends/zeroes accumulated successes on long actions and learning.
- **< 6:** failure — very unpleasant but not shameful.
- **7–10:** success but with consequences / hard choices (partial info, unwanted attention, new trouble).
- **11–16:** full success, no negative consequences.
- **17+:** brilliant success; each **4** above 16 improves the outcome further.
- **Opposed rolls (состязательные броски):** you must out-roll the opponent; every 3-point difference changes the degree of success.
- **Long actions (длительные действия):** accumulate successes vs a threshold over multiple rolls (once per cycle or when GM allows); number of allowed rolls may be capped.

### Conditions / harm track (Состояния) — Conflicts page
A **Condition (Состояние)** is a debuff. Each of the six stats has **its own condition**:

| Stat | Condition (RU) | Condition (EN) |
|---|---|---|
| Dexterity (Ловкость) | Контужен | Concussed |
| Endurance (Выносливость) | Ослаблен | Weakened |
| Willpower (Сила Воли) | Подавлен | Suppressed |
| Magic (Магия) | Истощён | Exhausted |
| Perception (Внимание) | Рассеян | Distracted/Scattered |
| Wits (Сообразительность) | Заторможен | Slowed/Stupefied |

- A normal condition gives **−1** to rolls of that stat.
- A **Serious condition (Серьёзное состояние)** gives **−6** to that stat (marked e.g. "Серьёзно контужен").
- **Critical state (Критическое состояние)** is reached when a character has **any** of: 4+ conditions across different stats; OR 2+ serious conditions; OR 1 serious + 2 normal conditions. In Critical state: **−6 to ALL rolls**, and **−10** to rolls of stats already hit by conditions. Still able to act, but most actions barely have effect.
- The next negative consequence after Critical (an enemy success, or a roll below 12) makes the character **"Neutralized" (Нейтрализован)** — out of the conflict, usually unconscious or on the brink. Moves/hashtags exist to return a Neutralized character to Critical or to remove conditions.
- Out-of-combat sources of conditions: **Deprivation (Лишения)** — losing a vital resource (sleep, food); GM may demand an Endurance check every 12 in-game hours; not passing perfectly (11+) → a condition, on failure → a serious condition. **Traumatic experience (Травмирующий опыт)** → immediately gain the **"Broken" (Сломлен)** condition; escape it via a Willpower check every 12 in-game hours, repeatable when using "Share a memory."

### Enemy / NPC mechanics (Conflicts page) — relevant if NPC cards exist
- **Edges of Resistance (Грани Сопротивления):** NPC-only properties that let them keep resisting. Players must study the enemy to find them, then "strip" each edge (often taking the linked ability with it).
- **Root of the conflict (Корень конфликта):** the final edge motivating the enemy; strip it and the conflict ends (enemy yields/dies/retreats).
- **Opportunity (Возможность):** a parameter on some edges (e.g. "Immortality / Бессмертие") — the edge can only be stripped once the conditions creating the opportunity are met.

### Conflict turn structure (Ход Конфликта)
1. Initiative = a **bare 2d6** (only moves modify it).
2. Act in descending order.
3. On your turn: declare a move you have, OR do something un-described invented by the player.
4. GM determines consequences, may correct/extend the description.
5. Turn passes to next character.
6. After everyone acts, the cycle restarts from step 2.
- One short reply per character per cycle (two with GM permission). You may delay your action within a cycle, but it burns at cycle's end if unused. All actions of a cycle resolve roughly simultaneously (cycle ≈ under ten seconds).

### Hope points (Очки Надежды) — Остальные правила
- Start with **1** Hope. Type: counter.
- On a failure (or when an effect falls short), spend a Hope to roll an extra **1d6** and add it to the result. **Cannot** be used on snake-eyes.
- Spent Hope does **not** self-restore but can be restored by an unknown-to-PCs means **during the Night**, and is restored at **level-up** (each turn of the wheel).
- Max available Hope can be increased by plot or advancement.

### Critical results (Остальные правила)
- **Snake eyes (две единицы):** critical failure, no new mitigations will ever be added. Magic failures: GM rolls 1d6, lower = more critical consequences.
- **Double sixes (две шестёрки):** roll an extra 1d6 and add it; on another 6, repeat — keep rolling while 6s come up ("exploding").

### Resources / economy (Ресурсы)
- Measured in **galleons (галлеоны)** (not tied to real galleon value). +15 galleons per turn of the wheel ("a student's nominal stipend"). Items bought from other characters/NPCs or by owl-order; prices vary by seller, relationship, and rarity. Reference price table (Остальные правила): Simpla potion 3, Maxima potion 5, animal feed/cycle from 6, knife 6, Tarot deck 6, new outfit from 10 (rest TBD).

### Day / Night (День и Ночь) — a perception-state, card-relevant
- Two "prisms of perception": **Day (День)** = magical realism; **Night (Ночь)** = epic fairy-tale. Facts don't change, only the framing/style. Night is cold; magic may behave differently at Night; some characters gain extra outer/inner features at Night.
- Only the **GM** can declare a switch between Day and Night. Sessions can be all-Day (unmarked), switchable (unmarked), or **pure-Night (marked with a hashtag)**.
- A character without a fairy-tale/Night image, or who radically denies the Night, **cannot take part in pure-Night sessions** → so "Night image" is effectively a gating field for session eligibility.
- "The bridge (мост)" / "beyond the bridge (за мостом)" is in-world terminology for Night, but in 1940 no student knows about it.

### Drama points (Очки Драмы) — GM resource (not on player card, but interacts with player moves)
GM-held pool, persists between sessions. Gained from player moves (Give an Oath breaches +2 each, I'm There +1, Drama move += severity) and lost when players use "Share something intimate" (−1). GM spends them to worsen player rolls, cancel moves, take items, lower a roll's success tier in adverse environments, etc.

### Hashtags (Хештеги) — Как играть
Describe extra properties of objects/relationships (bonds, lingering effects of past actions, fame, special item properties). Acquired and lost. **Never** give an explicit mechanical bonus, but can change a roll modifier or activate a move in specific situations (e.g. a "painful conflict" relationship hashtag). A bond hashtag can also extend time in Critical state.

---

## UNCERTAINTIES / GAPS

1. **No normalized house-move list with PBtA trigger/miss/7–9/10+ formatting exists.** Character creation tells you to pick "4 house moves," but the actual house abilities live scattered across the **Magic discipline pages** (under «Магия»: Чары и боевая магия, Ментальная магия, Прорицания, Трансфигурация, Зелья, Алхимия, Артефактология, Колдомедицина, Некро-дисциплины, Ритуалы, etc.) as named abilities / spell tables, gated by house + Simpla/Maxima/Ultima. They were not all extracted in full (they are very large) and would need per-discipline modeling. If the data model needs the full house-move catalog, the discipline pages are the source — flag for a dedicated extraction pass.
2. **"Bless" (Благословляю)** move: the header was present on the Moves page but its body text was not captured in the chunk (it was the last header; likely truncated). Its mechanic is unknown.
3. **Age 20–21 advance wording is ambiguous:** "еще два хода дома и один ход дома и один личный" literally reads "two more house moves and one house move and one personal" — possibly a typo; interpreted as +2 house, +1 house, +1 personal, but unverified.
4. **Blood status (Статус крови)** — RESOLVED via the live character DB schema: Чистокровный / Полукровка / Магглорожденный / Существо / Другое\Неизвестен.
5. **Perception stat naming inconsistency:** called Восприятие on the creation page but Внимание in the Conditions table on the Conflicts page — treated as the same stat.
6. **Clubs list, religion options, nationality options, social-class options** are free-text/open in the source; no enumerated option sets were provided.
7. **Charms (Чары) are not "moves"** in the PBtA sense; they are a large library (the «Чары и боевая магия» discipline page has ~70+ named spells in a table with columns: Description / Induced condition / Charm name / Class [Сглаз/Заклинание/Проклятие/Особый/...]). A character's *known charms* is a list field whose size is capped by the house/year/club rules above. Full spell catalog not transcribed here.
8. **Magic disciplines beyond Charms** (mental magic, divination, transfiguration, potions, alchemy, artefactology, herbology, zoology, healing, necromancy, theory, rituals, animal transformations, curses/blessings/oaths, Ultima & graduation projects, Unforgivable magic, special cases) each exist as full sub-pages and were not exhaustively extracted; they hold additional house-gated abilities and statuses.
9. **"Special skills" tiers** (Симпла/Максима/Ультима) are described conceptually but there is no per-skill numeric list of what each tier unlocks outside the discipline pages.
10. **Live "Персонажи" (Characters) database schema** was inspected and confirms these card columns: Name (title), Дом (House select), Режим игры (play mode multi-select: Онлайн/Оффлайн), Национальность (text), Род Занятий / occupation (text), Статус Крови (select, options above), Возраст (number), Игрок / player (text), Tags (multi-select: НПС/Игрок/Студенты/Взрослые/Покойники), Status (status: Неизвестен\В разработке / Мертв / Жив), Портрет (file). Note: this DB is a **roster/index** card and does NOT expose the mechanical stats, moves, conditions, XP, or hope — those live in the per-character page bodies (not extracted) and in the rules pages above. The other root DB "Расписание игр" (game schedule, calendar) is not character-relevant.

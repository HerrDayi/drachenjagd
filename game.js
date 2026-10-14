/**
 * ========================================================
 * Mathe-Quest: Die Drachenjagd
 * Interaktives Rollenspiel für iPad & Web (Klasse 5/6)
 * ========================================================
 */

// Sound Synthesizer via Web Audio API (Offline-fähig, keine externen MP3s nötig!)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  click() {
    this.playTone(600, 'triangle', 0.06, 0.08);
  }

  correct() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // Dreiklang Fanfare C-Dur
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.25, 0.12), idx * 75);
    });
  }

  wrong() {
    this.playTone(200, 'sawtooth', 0.25, 0.15);
  }

  magic() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.playTone(400 + i * 150, 'sine', 0.15, 0.1), i * 40);
    }
  }

  victory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [440, 554, 659, 880, 740, 880, 1108];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.35, 0.15), i * 140);
    });
  }
}

const sounds = new SoundEngine();

// ========================================================
// Quest & Story Definitions
// ========================================================
const CHARACTERS = [
  {
    id: 'rechenraeuber',
    name: 'Rechenräuber',
    avatar: '🦹',
    title: 'Rechenräuber',
    powerName: 'Ergebnis klauen',
    powerDesc: 'Darf bei einer Aufgabe ein Ergebnis direkt aufdecken!',
    powerType: 'reveal'
  },
  {
    id: 'mathemagierin',
    name: 'Mathemagierin',
    avatar: '🧙‍♀️',
    title: 'Mathemagierin',
    powerName: 'Wegzaubern',
    powerDesc: 'Zaubert eine knifflige Aufgabe komplett weg (automatisch gelöst)!',
    powerType: 'skip'
  },
  {
    id: 'ergebniserfinderin',
    name: 'Ergebniserfinderin',
    avatar: '💡',
    title: 'Ergebniserfinderin',
    powerName: 'Taschenrechner',
    powerDesc: 'Darf den magischen Taschenrechner für eine Aufgabe nutzen!',
    powerType: 'calc'
  },
  {
    id: 'zaehlzombie',
    name: 'Zählzombie',
    avatar: '🧟',
    title: 'Zählzombie',
    powerName: 'Fingerhilfe',
    powerDesc: 'Zeigt für eine Aufgabe den ausführlichen Rechenweg an!',
    powerType: 'hint'
  }
];

// Die 11 Hauptstationen auf der Karte & in der Story
const STAGES = [
  // 1. Schloss
  {
    id: 'castle',
    mapNode: 0,
    title: '1. Schlosshof von Königin Annalena',
    speaker: '👑 Königin Annalena Al Gebra',
    portrait: 'queen.jpg',
    story: '„Sei gegrüßt, tapfere Abenteurerin / tapferer Abenteurer! Der schreckliche Drache Olaf der Schläfrige dezimiert seit Monaten unsere Tiere. Bevor du aufbrichst, musst du ermitteln, wie viele Tiere uns im Königreich überhaupt noch geblieben sind!“',
    instruction: 'Subtrahiere im Kopf, wie viele Tiere jeweils noch übrig sind:',
    type: 'table_subtraction',
    rows: [
      { name: '🐑 Schafe', start: '1.400', m1: '- 27', m2: '- 35', m3: '- 111', answer: '1227' },
      { name: '🐄 Kühe', start: '988', m1: '- 35', m2: '- 54', m3: '- 10', answer: '889' },
      { name: '🐖 Schweine', start: '520', m1: '- 20', m2: '- 26', m3: '- 56', answer: '418' },
      { name: '🐔 Hühner', start: '732', m1: '- 11', m2: '- 38', m3: '- 127', answer: '556' }
    ],
    hint: 'Tipp: Rechne erst die drei Abzüge zusammen oder ziehe sie Schritt für Schritt ab! Beispiel Schafe: 27 + 35 + 111 = 173. Dann 1.400 - 173 = 1.227.'
  },
  // 2. Waffenladen
  {
    id: 'armory',
    mapNode: 1,
    title: '2. Raubritter Roberts Waffenladen',
    speaker: '🤺 Raubritter Robert',
    portrait: 'knight.jpg',
    story: '„Gegen Olaf brauchst du beste Ausrüstung! Im Regal stehen feuerfeste Fechtermasken, magische Lanzen und Pfeile. Leider hast du kein Gold in den Taschen, aber gleich nebenan steht ein königlicher Bankautomat!🏦“',
    instruction: 'Addiere die Preise im Kopf: Wie viel Gold musst du am Bankomat abheben?',
    items: [
      { name: '🤺 Feuerfeste Fechtermaske', price: '12,50' },
      { name: '🏹 20 Pfeile', price: '2,50' },
      { name: '🔪 Dolch', price: '19,95' },
      { name: '🐲 Magische Drachenlanze', price: '129,90' },
      { name: '🥊 Lederhandschuhe', price: '8,45' }
    ],
    type: 'single_input',
    inputLabel: 'Gesamtbetrag in Gold:',
    answers: ['173,30', '173,3', '173.30', '173.3'],
    hint: 'Addiere schrittweise: 12,50 + 2,50 = 15,00. Dann + 129,90 = 144,90. Dann + 19,95 = 164,85. Zuletzt + 8,45 = 173,30 Gold.'
  },
  // 3. Hexenküche
  {
    id: 'alchemy',
    mapNode: 2,
    title: '3. Die Alchemistenküche',
    speaker: '🧪 Meister Alchemist',
    portrait: 'alchemist.svg',
    story: '„Ausrüstung hast du, aber ohne Heiltrank gehst du gegen Olaf unter! Du hast alle Zutaten gesammelt. Wiege sie ganz genau im Kessel ab, sonst explodiert das Gebräu!“',
    instruction: 'Multipliziere im Kopf und berechne die Gesamtmengen:',
    type: 'table_multiplication',
    rows: [
      { item: '🌿 Königinnenkraut (jeweils 1,5 g)', factor: '20 × 1,5 g', answer: '30' },
      { item: '🌱 Wundwurzeln (jeweils 7,5 g)', factor: '4 × 7,5 g', answer: '30' },
      { item: '🥔 Knochenknollen (jeweils 2,5 g)', factor: '8 × 2,5 g', answer: '20' },
      { item: '🌶 Mini-Chilis (jeweils 0,5 g)', factor: '17 × 0,5 g', answers: ['8,5', '8.5'] },
      { item: '💧 Quellwasser (jeweils 125 ml)', factor: '2 × 125 ml', answer: '250' }
    ],
    hint: 'Tipp: 20 × 1,5 = 2 × 15 = 30. Bei Mini-Chilis: Die Hälfte von 17 ist 8,5!'
  },
  // 4. Weggabelung
  {
    id: 'crossroads',
    mapNode: 3,
    title: '4. Die Weggabelung',
    speaker: '🗺 Wegweiser am Scheideweg',
    portrait: 'world_map.jpg',
    story: '„Zur Drachenhöhle führen vier verschiedene Wege. Welcher Weg bringt dich am schnellsten an dein Ziel?“',
    instruction: 'Berechne die Zeiten in Stunden (Strecke geteilt durch Geschwindigkeit) und wähle den schnellsten Weg:',
    type: 'travel_choice',
    routes: [
      { name: 'Waldweg (6 km zu Fuß bei 4 km/h)', timeAnswer: ['1,5', '1.5'], hours: '1,5' },
      { name: 'Feldweg (15 km zu Pferd bei 20 km/h)', timeAnswer: ['0,75', '0.75'], hours: '0,75', fastest: true },
      { name: 'Skipiste (10 km mit Board bei 8 km/h)', timeAnswer: ['1,25', '1.25'], hours: '1,25' },
      { name: 'Fluss (17,5 km mit Boot bei 7 km/h)', timeAnswer: ['2,5', '2.5'], hours: '2,5' }
    ],
    hint: 'Zeit = Strecke ÷ Geschwindigkeit. 15 km ÷ 20 km/h = 15/20 = 3/4 Stunde = 0,75 Stunden!'
  },
  // 5. Pferd Joe
  {
    id: 'horse_joe',
    mapNode: 4,
    title: '5. Aufbruch mit Pferd Joe',
    speaker: '🐴 Pferd Joe',
    portrait: 'horse_joe.svg',
    story: '„Du nimmst den Feldweg und sattelst dein treues Pferd Joe. Der Gute ist zwar nicht mehr der Jüngste: Du musst 5 km/h von seiner Geschwindigkeit (20 km/h) abziehen! Wie lange brauchst du für die 15 km Feldweg nun?“',
    instruction: 'Neue Geschwindigkeit: 20 km/h - 5 km/h = 15 km/h. Wie viele Stunden dauert der Ritt?',
    type: 'single_choice',
    options: ['0,5 Stunden', '1 Stunde', '1,25 Stunden', '1,5 Stunden'],
    correctIndex: 1,
    hint: '15 km Strecke geteilt durch 15 km/h = genau 1 Stunde!'
  },
  // 6. Gemüsestand
  {
    id: 'vegetable_stand',
    mapNode: 5,
    title: '6. Der Möhren-Karren am Wegesrand',
    speaker: '🥕 Gemüsehändler',
    portrait: 'farmer.svg',
    story: '„Joe macht schlapp und braucht Futter! Ein freundlicher Bauer bietet Möhren an. Du möchtest das beste Schnäppchen für Joe machen!“',
    instruction: 'Rechne die Preise für 1 Möhre aus und klicke auf das GÜNSTIGSTE Angebot:',
    type: 'best_bargain',
    items: [
      { desc: '1 Möhre für 5 Cent', unitAnswer: '5', pricePerUnit: 5 },
      { desc: '3 Möhren für 12 Cent', unitAnswer: '4', pricePerUnit: 4 },
      { desc: '5 Möhren für 15 Cent', unitAnswer: '3', pricePerUnit: 3, isBest: true },
      { desc: '10 Möhren für 40 Cent', unitAnswer: '4', pricePerUnit: 4 },
      { desc: '15 Möhren für 90 Cent', unitAnswer: '6', pricePerUnit: 6 }
    ],
    hint: 'Teile den Gesamtpreis durch die Möhrenanzahl: 15 Cent ÷ 5 Möhren = 3 Cent pro Möhre!'
  },
  // 7. Imbissbude
  {
    id: 'snack_shack',
    mapNode: 6,
    title: '7. Donalds Imbissbude',
    speaker: '🌭 Imbisswirt Donald',
    portrait: 'donald.svg',
    story: '„Joe mampft glücklich, doch jetzt knurrt dein eigener Magen! Donald rechnet in Dollar ab. Kurs: 1 Gold = 1,233 Dollar. Du hast noch genau 3 Gold in der Tasche (3 × 1,233 $ = 3,699 $ ≈ 3,70 $).“',
    instruction: 'Wähle ALLE Gerichte aus, die du dir mit deinen 3 Gold (max. 3,70 $) leisten kannst:',
    type: 'multi_choice',
    budget: 3.70,
    options: [
      { name: '🍔 Rattenburger mit Zwiebeln (4,20 $)', price: 4.20, affordable: false },
      { name: '🍕 Pizza mit Eichhörnchensalami (4,00 $)', price: 4.00, affordable: false },
      { name: '🍣 Goldfisch-Sushi (3,90 $)', price: 3.90, affordable: false },
      { name: '🍟 Pommes mit Schneckenmayo (3,80 $)', price: 3.80, affordable: false },
      { name: '🌭 Hot Dackel (3,70 $)', price: 3.70, affordable: true },
      { name: '🌯 Wellensittich-Wrap (3,50 $)', price: 3.50, affordable: true },
      { name: '🍞 Grüne-Popel-Sandwich (2,00 $)', price: 2.00, affordable: true },
      { name: '🍫 Schokoriegel (1,00 $)', price: 1.00, affordable: true }
    ],
    hint: 'Alle Speisen mit einem Preis von 3,70 $ oder weniger kannst du bezahlen!'
  },
  // 8. Vor der Höhle & Nickerchen
  {
    id: 'cave_waiting',
    mapNode: 7,
    title: '8. Die Drachenhöhle & Das Nickerchen',
    speaker: '📜 Zettel von Olaf an der Höhle',
    portrait: 'dragon.jpg',
    story: '„Du erreichst die Höhle. Drache Olaf ist nicht da! Am Felsen hängt ein Zettel: "Bin um 17:00 Uhr zurück, Olaf". Deine Uhr zeigt 24 Minuten vor drei (14:36 Uhr). Du beschließt, dich bis 16:50 Uhr hinzulegen.“',
    instruction: 'Löse die beiden Zeitaufgaben in Minuten:',
    type: 'double_time',
    task1: '1) Wie viele Minuten musst du insgesamt auf Olaf warten (von 14:36 bis 17:00 Uhr)?',
    answer1: '144',
    task2: '2) Dein Wecker klingelt um 16:50 Uhr. Jetzt ist es 15:12 Uhr. Wie viele Minuten dauert dein Nickerchen?',
    answer2: '98',
    hint: '1) Bis 15 Uhr sind es 24 Min, dann 2 Std = 120 Min -> 144 Min! 2) Von 15:12 bis 16:00 sind es 48 Min + 50 Min bis 16:50 = 98 Min.'
  },
  // 9. Drachenkampf: Pfeile & Lanze
  {
    id: 'dragon_battle',
    mapNode: 8,
    title: '9. Der Kampf: Pfeilhagel & Drachenlanze',
    speaker: '🐲 Drache Olaf der Schläfrige',
    portrait: 'dragon.jpg',
    story: '„ROAAAR! Olaf kreist über dir! Du greifst nach Bogen und Lanze. 20 Pfeile hast du im Köcher und schießt 3 Pfeile pro Minute ab. Danach suchst du mit der Lanze nach einer der dünnen Schuppen (1 von 500 Schuppen bei 100.000 Gesamtschuppen).“',
    instruction: 'Berechne die Schussdauer und die Trefferchance:',
    type: 'battle_inputs',
    task1: 'Für wie lange reicht dein Pfeilvorrat (20 Pfeile bei 3 Pfeile/Min)?',
    ansMin: '6',
    ansSec: '40',
    task2: 'Wie hoch ist die Chance in Prozent auf eine durchbohrbare Schuppe?',
    ansPercent: ['0,5', '0.5', '0,2', '0.2'],
    hint: '20 geteilt durch 3 = 6 Minuten und Rest 2 Pfeile. 2 Pfeile von 3 pro Min = 40 Sekunden! Laut Lehrbuch-Kürzung beträgt die Chance 0,5 %.'
  },
  // 10. Das Rätselduell
  {
    id: 'riddle_duel',
    mapNode: 9,
    title: '10. Das Rätselduell mit Olaf',
    speaker: '🐲 Drache Olaf der Schläfrige',
    portrait: 'dragon.jpg',
    story: '„Die Lanze prallt ab! Du rufst: "Ehrwürdiger Olaf! Lösen wir das wie vernünftige Wesen im Rätselduell! Wenn ich deine Rätsel löse, ziehst du friedlich ab!" Olaf grinst: "Einverstanden. Löse meine drei Rätsel!"“',
    instruction: 'Beantworte Olafs 3 Prüfungen:',
    type: 'riddle_trio',
    riddle1: {
      q: 'Rätsel 1: Nenne die 10. Zahl der Zauberreihe: 0, 3, 8, 15, 24, 35, 48, 63, 80, ... ?',
      answer: '99',
      hint: '+3, +5, +7, +9, +11, +13, +15, +17, +19! 80 + 19 = 99 (oder 10² - 1 = 99).'
    },
    riddle2: {
      q: 'Rätsel 2: Was ist schwerer? Ein Kilo Gold oder ein Kilo Federn?',
      options: ['Ein Kilo Gold', 'Ein Kilo Federn', 'Beides wiegt gleich viel'],
      correct: 2
    },
    riddle3: {
      q: 'Rätsel 3: Beim Grillen gab es 10 Fleischstücke (4 Feldmaus, 3 Hamster, 2 Pudel, 1 Einhorn) und 10 Krusten (4 Ameise, 3 Spinne, 2 Schnecke, 1 Schmetterling). Alle hatten verschiedene Krusten. Welche Kombination war UNMÖGLICH?',
      options: [
        'Einhorn mit Schmetterling',
        'Feldmaus mit Ameise',
        'Hamster mit Spinne',
        'Pudel mit Spinne'
      ],
      correct: 0
    }
  },
  // 11. Die Schatzkammer & Urkunde
  {
    id: 'treasure_chamber',
    mapNode: 10,
    title: '11. Die Schatzkammer (Epilog)',
    speaker: '👑 Königin Annalena & Königreich Al Gebra',
    portrait: 'queen.jpg',
    story: '„Du hast alle Rätsel mit Bravour gemeistert! Olaf schnaubt geschlagen Dampf aus den Nüstern und fliegt für immer davon. In der Höhle findest du den versprochenen Schatz: Eine stolze Drachenjugendspiele-Urkunde und 5.000 winzige Ameisenkinder! Du hast das Königreich gerettet!“',
    instruction: 'Trage deinen Namen ein, um deine persönliche Drachenjäger-Urkunde zu erhalten!',
    type: 'certificate'
  }
];

// ========================================================
// Map Coordinates (11 Nodes across a Fantasy Kingdom)
// ========================================================
const MAP_COORDS = [
  { x: 50,  y: 150, name: 'Schloss' },
  { x: 120, y: 120, name: 'Waffenladen' },
  { x: 190, y: 160, name: 'Alchemie' },
  { x: 270, y: 110, name: 'Weggabelung' },
  { x: 350, y: 70,  name: 'Pferd Joe' },
  { x: 440, y: 90,  name: 'Gemüsestand' },
  { x: 520, y: 130, name: 'Imbiss' },
  { x: 610, y: 90,  name: 'Vorland' },
  { x: 690, y: 140, name: 'Kampf' },
  { x: 770, y: 90,  name: 'Rätselduell' },
  { x: 850, y: 130, name: 'Schatz' }
];

// ========================================================
// Game State Manager
// ========================================================
class GameManager {
  constructor() {
    this.selectedChar = null;
    this.currentStageIdx = 0;
    this.powerUsed = false;
    this.score = 0;
    this.playerName = 'Tapfere Mathe-Heldin';
    this.xp = 0;
    this.level = 1;
    this.bossHp = 100;
    this.inventory = [
      { name: '🧭 Abenteurer-Kompass', desc: 'Zeigt stets den sichersten Pfad durch das Königreich Al Gebra.' }
    ];
    this.initElements();
    this.initEventListeners();
    this.renderMap();
    this.renderInventory();
    this.addXp(0);
  }

  initElements() {
    this.screenChar = document.getElementById('charSelectScreen');
    this.screenGame = document.getElementById('gameScreen');
    this.screenVictory = document.getElementById('victoryScreen');

    this.btnStartQuest = document.getElementById('btnStartQuest');
    this.heroBadge = document.getElementById('heroBadge');
    this.heroPowerBtn = document.getElementById('heroPowerBtn');
    this.btnCheck = document.getElementById('btnCheck');
    this.btnNext = document.getElementById('btnNext');
    this.feedbackMsg = document.getElementById('feedbackMsg');
    this.questContent = document.getElementById('questContent');

    // XP & Boss & Inventar
    this.playerLevel = document.getElementById('playerLevel');
    this.playerXp = document.getElementById('playerXp');
    this.xpBarFill = document.getElementById('xpBarFill');
    this.bossBanner = document.getElementById('bossBanner');
    this.bossHpText = document.getElementById('bossHpText');
    this.bossHpFill = document.getElementById('bossHpFill');
    this.invSlots = document.getElementById('invSlots');

    // Scratchpad elements
    this.scratchpadModal = document.getElementById('scratchpadModal');
    this.btnToggleScratchpad = document.getElementById('btnToggleScratchpad');
    this.btnCloseScratchpad = document.getElementById('btnCloseScratchpad');
    this.btnClearCanvas = document.getElementById('btnClearCanvas');
    this.btnPenMode = document.getElementById('btnPenMode');
    this.btnEraserMode = document.getElementById('btnEraserMode');
    this.canvas = document.getElementById('scratchpadCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.isEraser = false;

    // Calc elements
    this.calcModal = document.getElementById('calcModal');
    this.calcDisplay = document.getElementById('calcDisplay');
    this.btnCloseCalc = document.getElementById('btnCloseCalc');
    this.calcValue = '0';

    // Sound toggle
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
  }

  addXp(amount) {
    this.xp += amount;
    const levels = [
      { lvl: 1, name: 'Stufe 1: Knappe', max: 100 },
      { lvl: 2, name: 'Stufe 2: Mathe-Abenteurer', max: 250 },
      { lvl: 3, name: 'Stufe 3: Formel-Jäger', max: 450 },
      { lvl: 4, name: 'Stufe 4: Drachen-Bändiger', max: 600 },
      { lvl: 5, name: 'Stufe 5: Großmeister von Al Gebra', max: 600 }
    ];

    let current = levels[0];
    for (let l of levels) {
      if (this.xp >= l.max && l.lvl < 5) continue;
      current = l;
      break;
    }

    if (current.lvl > this.level) {
      this.level = current.lvl;
      sounds.victory();
      this.showFeedback(`⚡ LEVEL UP! Du erreichst ${current.name}!`, 'hint');
    }

    const prevMax = this.level === 1 ? 0 : levels[this.level - 2].max;
    const progress = Math.min(100, Math.max(0, ((this.xp - prevMax) / (current.max - prevMax)) * 100));

    if (this.playerLevel) this.playerLevel.textContent = current.name;
    if (this.playerXp) this.playerXp.textContent = `${this.xp} / ${current.max} XP`;
    if (this.xpBarFill) this.xpBarFill.style.width = `${progress}%`;
  }

  updateBossHp(hp) {
    this.bossHp = Math.max(0, hp);
    if (this.bossHpText) this.bossHpText.textContent = `${this.bossHp} / 100 HP`;
    if (this.bossHpFill) this.bossHpFill.style.width = `${this.bossHp}%`;
    const card = document.querySelector('.quest-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 450);
    }
  }

  addItem(name, desc) {
    if (!this.inventory.find(i => i.name === name)) {
      this.inventory.push({ name, desc });
      this.renderInventory();
    }
  }

  renderInventory() {
    if (!this.invSlots) return;
    this.invSlots.innerHTML = '';
    this.inventory.forEach(item => {
      const it = typeof item === 'string' ? { name: item, desc: 'Ein wertvolles Ausrüstungsstück.' } : item;
      const el = document.createElement('div');
      el.className = 'inv-item';
      el.textContent = it.name;
      el.title = it.desc;
      el.addEventListener('click', () => {
        sounds.click();
        alert(`${it.name}\n\n${it.desc}`);
      });
      this.invSlots.appendChild(el);
    });
  }

  initEventListeners() {
    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      const active = sounds.toggle();
      this.btnSoundToggle.textContent = active ? '🔊 Ton: An' : '🔇 Ton: Aus';
    });

    // Character Card Selection
    document.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        sounds.click();
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const charId = card.dataset.charId;
        this.selectedChar = CHARACTERS.find(c => c.id === charId);
        this.btnStartQuest.disabled = false;
        this.btnStartQuest.style.opacity = '1';
      });
    });

    // Start Quest
    this.btnStartQuest.addEventListener('click', () => {
      if (!this.selectedChar) return;
      sounds.magic();
      this.screenChar.classList.remove('active');
      this.screenGame.classList.add('active');
      this.setupHeroStatus();
      this.loadStage(0);
    });

    // Special Ability Button
    this.heroPowerBtn.addEventListener('click', () => {
      this.useSpecialPower();
    });

    // Check Answer
    this.btnCheck.addEventListener('click', () => {
      this.validateCurrentStage();
    });

    // Next Stage
    this.btnNext.addEventListener('click', () => {
      sounds.click();
      if (this.currentStageIdx < STAGES.length - 1) {
        this.currentStageIdx++;
        this.loadStage(this.currentStageIdx);
      } else {
        this.showVictoryScreen();
      }
    });

    // Scratchpad canvas setup
    this.setupScratchpad();

    // Calculator setup
    this.setupCalculator();
  }

  setupHeroStatus() {
    this.heroBadge.textContent = `${this.selectedChar.avatar} ${this.selectedChar.name}`;
    this.heroPowerBtn.innerHTML = `⚡ ${this.selectedChar.powerName} (1x)`;
    this.heroPowerBtn.disabled = false;
  }

  useSpecialPower() {
    if (this.powerUsed) return;
    sounds.magic();
    this.powerUsed = true;
    this.heroPowerBtn.disabled = true;
    this.heroPowerBtn.innerHTML = `⚡ ${this.selectedChar.powerName} (Verbraucht)`;
    this.heroPowerBtn.style.opacity = '0.5';

    const pType = this.selectedChar.powerType;
    if (pType === 'skip') {
      this.showFeedback('🧙‍♀️ Mathemagie! Die Aufgabe wurde erfolgreich weggezaubert!', 'success');
      this.btnCheck.style.display = 'none';
      this.btnNext.classList.add('show');
      sounds.correct();
    } else if (pType === 'reveal') {
      const inputs = this.questContent.querySelectorAll('input');
      if (inputs.length > 0) {
        const inp = inputs[0];
        inp.value = inp.dataset.answer || '1227';
        inp.classList.add('correct');
        this.showFeedback('🦹 Klau-Erfolg: Du hast dir ein Ergebnis gekrallt!', 'hint');
      }
    } else if (pType === 'calc') {
      this.calcModal.classList.add('open');
      this.showFeedback('💡 Der Zauber-Taschenrechner steht dir nun zur Seite!', 'hint');
    } else if (pType === 'hint') {
      const stage = STAGES[this.currentStageIdx];
      this.showFeedback(`🧟 Fingerhilfe: ${stage.hint || 'Schau dir die Rechenschritte genau an!'}`, 'hint');
    }
  }

  renderMap() {
    const svg = document.getElementById('mapSvg');
    if (!svg) return;
    svg.innerHTML = '';

    // Draw connecting paths between nodes
    let pathD = `M ${MAP_COORDS[0].x} ${MAP_COORDS[0].y}`;
    for (let i = 1; i < MAP_COORDS.length; i++) {
      pathD += ` L ${MAP_COORDS[i].x} ${MAP_COORDS[i].y}`;
    }

    const pathBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathBg.setAttribute('d', pathD);
    pathBg.setAttribute('stroke', '#334155');
    pathBg.setAttribute('stroke-width', '4');
    pathBg.setAttribute('fill', 'none');
    pathBg.setAttribute('stroke-dasharray', '6,6');
    svg.appendChild(pathBg);

    // Draw active progress path
    if (this.currentStageIdx > 0) {
      let activeD = `M ${MAP_COORDS[0].x} ${MAP_COORDS[0].y}`;
      for (let i = 1; i <= this.currentStageIdx; i++) {
        activeD += ` L ${MAP_COORDS[i].x} ${MAP_COORDS[i].y}`;
      }
      const activePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      activePath.setAttribute('d', activeD);
      activePath.setAttribute('stroke', '#f59e0b');
      activePath.setAttribute('stroke-width', '4');
      activePath.setAttribute('fill', 'none');
      svg.appendChild(activePath);
    }

    // Draw Nodes
    MAP_COORDS.forEach((coord, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `map-node ${idx < this.currentStageIdx ? 'completed' : (idx === this.currentStageIdx ? 'active' : 'locked')}`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', coord.x);
      circle.setAttribute('cy', coord.y);
      circle.setAttribute('r', idx === this.currentStageIdx ? '14' : '10');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', coord.x);
      text.setAttribute('y', coord.y + 4);
      text.textContent = (idx + 1).toString();

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', coord.x);
      label.setAttribute('y', coord.y + (coord.y > 110 ? 24 : -16));
      label.setAttribute('class', 'map-node-label');
      label.textContent = coord.name;

      g.appendChild(circle);
      g.appendChild(text);
      g.appendChild(label);
      svg.appendChild(g);
    });

    document.getElementById('mapProgressText').textContent = `Station ${this.currentStageIdx + 1} von ${STAGES.length}`;
  }

  loadStage(idx) {
    this.currentStageIdx = idx;
    this.renderMap();
    const stage = STAGES[idx];

    // Boss-Banner Steuerung
    if (this.bossBanner) {
      if (idx === 8 || idx === 9) {
        this.bossBanner.classList.add('show');
      } else {
        this.bossBanner.classList.remove('show');
      }
    }

    // Reset Buttons & Feedback
    this.btnCheck.style.display = 'inline-flex';
    this.btnNext.classList.remove('show');
    this.hideFeedback();

    let html = `
      <div class="stage-badge">⚔️ Station ${idx + 1} von ${STAGES.length}</div>
      <div class="story-dialog-wrapper">
        <div class="dialog-avatar-box">
          <img src="${stage.portrait}" alt="${stage.speaker}" class="dialog-avatar-img" onerror="if(!this.dataset.t){this.dataset.t='1';this.src='assets/'+this.getAttribute('src');}">
        </div>
        <div class="dialog-text-content">
          <div class="speaker-tag">${stage.speaker}</div>
          <p>${stage.story}</p>
        </div>
      </div>
      <div class="task-box">
        <div class="task-instruction">📌 ${stage.instruction}</div>
    `;

    // Render task content based on type
    if (stage.type === 'table_subtraction') {
      html += `
        <div class="rpg-table-wrapper">
          <table class="rpg-table">
            <thead>
              <tr><th>Tier</th><th>Bestand</th><th>1. Monat</th><th>2. Monat</th><th>3. Monat</th><th>Noch übrig</th></tr>
            </thead>
            <tbody>
              ${stage.rows.map((r, i) => `
                <tr>
                  <td><strong>${r.name}</strong></td>
                  <td>${r.start}</td>
                  <td>${r.m1}</td>
                  <td>${r.m2}</td>
                  <td>${r.m3}</td>
                  <td><input type="number" inputmode="numeric" class="math-input q-sub" data-answer="${r.answer}" placeholder="?"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (stage.type === 'single_input') {
      html += `
        <div class="rpg-table-wrapper">
          <table class="rpg-table">
            <thead><tr><th>Gegenstand</th><th>Preis</th></tr></thead>
            <tbody>
              ${stage.items.map(it => `<tr><td>${it.name}</td><td><strong>${it.price} Gold</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top: 14px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <label style="font-weight: 700; font-size: 1.1rem;">${stage.inputLabel}</label>
          <input type="text" class="math-input q-single" placeholder="z. B. 173,30" style="max-width: 200px;">
        </div>
      `;
    } else if (stage.type === 'table_multiplication') {
      html += `
        <div class="rpg-table-wrapper">
          <table class="rpg-table">
            <thead><tr><th>Zutat</th><th>Rechnung</th><th>Gesamtmenge (Zahl)</th></tr></thead>
            <tbody>
              ${stage.rows.map((r, i) => `
                <tr>
                  <td>${r.item}</td>
                  <td><code>${r.factor}</code></td>
                  <td><input type="text" class="math-input q-mult" data-answers="${r.answers ? r.answers.join('|') : r.answer}" placeholder="?"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (stage.type === 'travel_choice') {
      html += `
        <div class="rpg-table-wrapper">
          <table class="rpg-table">
            <thead><tr><th>Strecke</th><th>Benötigte Zeit (Stunden)</th></tr></thead>
            <tbody>
              ${stage.routes.map((r, i) => `
                <tr>
                  <td>${r.name}</td>
                  <td><input type="text" class="math-input q-route-time" data-answers="${r.timeAnswer.join('|')}" placeholder="z. B. 1,5"> Std.</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top: 14px;">
          <strong style="color: var(--gold);">Welcher Weg ist am schnellsten?</strong>
          <div class="options-grid">
            ${stage.routes.map((r, i) => `
              <button class="btn-option route-opt" data-fastest="${r.fastest ? 'true' : 'false'}">${r.name.split('(')[0]}</button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (stage.type === 'single_choice') {
      html += `
        <div class="options-grid">
          ${stage.options.map((opt, i) => `
            <button class="btn-option single-opt" data-index="${i}">${opt}</button>
          `).join('')}
        </div>
      `;
    } else if (stage.type === 'best_bargain') {
      html += `
        <div class="rpg-table-wrapper">
          <table class="rpg-table">
            <thead><tr><th>Angebot</th><th>Preis pro Möhre (Cent)</th><th>Auswahl</th></tr></thead>
            <tbody>
              ${stage.items.map((it, i) => `
                <tr>
                  <td>${it.desc}</td>
                  <td><input type="number" class="math-input q-bargain" data-answer="${it.unitAnswer}" placeholder="Cent"></td>
                  <td><button class="btn-option bargain-opt" data-best="${it.isBest ? 'true' : 'false'}">Dieses Angebot wählen</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (stage.type === 'multi_choice') {
      html += `
        <div class="options-grid">
          ${stage.options.map((opt, i) => `
            <button class="btn-option multi-opt" data-affordable="${opt.affordable ? 'true' : 'false'}">
              <span>${opt.name}</span>
            </button>
          `).join('')}
        </div>
      `;
    } else if (stage.type === 'double_time') {
      html += `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <p style="margin-bottom: 6px;">${stage.task1}</p>
            <input type="number" class="math-input q-time1" placeholder="Minuten"> Minuten
          </div>
          <div>
            <p style="margin-bottom: 6px;">${stage.task2}</p>
            <input type="number" class="math-input q-time2" placeholder="Minuten"> Minuten
          </div>
        </div>
      `;
    } else if (stage.type === 'battle_inputs') {
      html += `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <p style="margin-bottom: 6px;"><strong>1) Pfeilvorrat (20 Pfeile bei 3 pro Minute):</strong></p>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="number" class="math-input q-battle-min" placeholder="Minuten" style="width: 100px;"> Minuten
              <input type="number" class="math-input q-battle-sec" placeholder="Sekunden" style="width: 100px;"> Sekunden
            </div>
          </div>
          <div>
            <p style="margin-bottom: 6px;"><strong>2) Trefferchance mit Lanze (in Prozent):</strong></p>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" class="math-input q-battle-pct" placeholder="z. B. 0,5" style="width: 120px;"> %
            </div>
          </div>
        </div>
      `;
    } else if (stage.type === 'riddle_trio') {
      html += `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
            <p><strong>${stage.riddle1.q}</strong></p>
            <input type="number" class="math-input q-rid1" placeholder="10. Zahl" style="margin-top: 8px;">
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
            <p><strong>${stage.riddle2.q}</strong></p>
            <div class="options-grid">
              ${stage.riddle2.options.map((opt, i) => `
                <button class="btn-option rid2-opt" data-index="${i}">${opt}</button>
              `).join('')}
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">
            <p><strong>${stage.riddle3.q}</strong></p>
            <div class="options-grid">
              ${stage.riddle3.options.map((opt, i) => `
                <button class="btn-option rid3-opt" data-index="${i}">${opt}</button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (stage.type === 'certificate') {
      html += `
        <div style="text-align: center; padding: 20px;">
          <p style="font-size: 1.2rem; margin-bottom: 16px;">Gib deinen Namen ein, um deine offizielle Urkunde zu erhalten:</p>
          <input type="text" id="playerHeroName" class="math-input" placeholder="Dein Name" style="max-width: 300px; font-size: 1.3rem;">
        </div>
      `;
    }

    html += `</div>`; // task-box close
    this.questContent.innerHTML = html;

    // Attach listeners for interactive option selections in the current stage
    this.attachStageInteraction(stage);
  }

  attachStageInteraction(stage) {
    if (stage.type === 'travel_choice') {
      const btns = this.questContent.querySelectorAll('.route-opt');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.click();
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    } else if (stage.type === 'single_choice') {
      const btns = this.questContent.querySelectorAll('.single-opt');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.click();
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    } else if (stage.type === 'best_bargain') {
      const btns = this.questContent.querySelectorAll('.bargain-opt');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.click();
          btns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    } else if (stage.type === 'multi_choice') {
      const btns = this.questContent.querySelectorAll('.multi-opt');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.click();
          btn.classList.toggle('selected');
        });
      });
    } else if (stage.type === 'riddle_trio') {
      const rid2 = this.questContent.querySelectorAll('.rid2-opt');
      rid2.forEach(b => b.addEventListener('click', () => {
        sounds.click();
        rid2.forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
      }));
      const rid3 = this.questContent.querySelectorAll('.rid3-opt');
      rid3.forEach(b => b.addEventListener('click', () => {
        sounds.click();
        rid3.forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
      }));
    }
  }

  validateCurrentStage() {
    const stage = STAGES[this.currentStageIdx];
    let isCorrect = true;

    if (stage.type === 'table_subtraction') {
      const inputs = this.questContent.querySelectorAll('.q-sub');
      inputs.forEach(inp => {
        const val = inp.value.trim().replace('.', '');
        const target = inp.dataset.answer;
        if (val === target) {
          inp.classList.remove('incorrect');
          inp.classList.add('correct');
        } else {
          inp.classList.remove('correct');
          inp.classList.add('incorrect');
          isCorrect = false;
        }
      });
    } else if (stage.type === 'single_input') {
      const inp = this.questContent.querySelector('.q-single');
      const val = inp.value.trim().replace('€', '').replace('Gold', '').trim();
      if (stage.answers.includes(val)) {
        inp.classList.remove('incorrect');
        inp.classList.add('correct');
      } else {
        inp.classList.remove('correct');
        inp.classList.add('incorrect');
        isCorrect = false;
      }
    } else if (stage.type === 'table_multiplication') {
      const inputs = this.questContent.querySelectorAll('.q-mult');
      inputs.forEach(inp => {
        const val = inp.value.trim().replace('g', '').replace('ml', '').trim();
        const targets = inp.dataset.answers.split('|');
        if (targets.includes(val)) {
          inp.classList.remove('incorrect');
          inp.classList.add('correct');
        } else {
          inp.classList.remove('correct');
          inp.classList.add('incorrect');
          isCorrect = false;
        }
      });
    } else if (stage.type === 'travel_choice') {
      const timeInputs = this.questContent.querySelectorAll('.q-route-time');
      timeInputs.forEach(inp => {
        const val = inp.value.trim().replace('Std', '').replace('h', '').trim();
        const targets = inp.dataset.answers.split('|');
        if (targets.includes(val)) {
          inp.classList.remove('incorrect');
          inp.classList.add('correct');
        } else {
          inp.classList.remove('correct');
          inp.classList.add('incorrect');
          isCorrect = false;
        }
      });
      const selected = this.questContent.querySelector('.route-opt.selected');
      if (!selected || selected.dataset.fastest !== 'true') {
        isCorrect = false;
      }
    } else if (stage.type === 'single_choice') {
      const selected = this.questContent.querySelector('.single-opt.selected');
      if (!selected || parseInt(selected.dataset.index) !== stage.correctIndex) {
        isCorrect = false;
      }
    } else if (stage.type === 'best_bargain') {
      const inputs = this.questContent.querySelectorAll('.q-bargain');
      inputs.forEach(inp => {
        const val = inp.value.trim().replace('Cent', '').replace('ct', '').trim();
        if (val === inp.dataset.answer) {
          inp.classList.remove('incorrect');
          inp.classList.add('correct');
        } else {
          inp.classList.remove('correct');
          inp.classList.add('incorrect');
          isCorrect = false;
        }
      });
      const selected = this.questContent.querySelector('.bargain-opt.selected');
      if (!selected || selected.dataset.best !== 'true') {
        isCorrect = false;
      }
    } else if (stage.type === 'multi_choice') {
      const btns = this.questContent.querySelectorAll('.multi-opt');
      btns.forEach(btn => {
        const shouldBe = btn.dataset.affordable === 'true';
        const isSelected = btn.classList.contains('selected');
        if (shouldBe !== isSelected) {
          isCorrect = false;
        }
      });
    } else if (stage.type === 'double_time') {
      const t1 = this.questContent.querySelector('.q-time1').value.trim();
      const t2 = this.questContent.querySelector('.q-time2').value.trim();
      if (t1 !== stage.answer1 || t2 !== stage.answer2) {
        isCorrect = false;
      }
    } else if (stage.type === 'battle_inputs') {
      const m = this.questContent.querySelector('.q-battle-min').value.trim();
      const s = this.questContent.querySelector('.q-battle-sec').value.trim();
      const pct = this.questContent.querySelector('.q-battle-pct').value.trim().replace('%', '');
      if (m !== stage.ansMin || s !== stage.ansSec || !stage.ansPercent.includes(pct)) {
        isCorrect = false;
      }
    } else if (stage.type === 'riddle_trio') {
      const r1 = this.questContent.querySelector('.q-rid1').value.trim();
      const sel2 = this.questContent.querySelector('.rid2-opt.selected');
      const sel3 = this.questContent.querySelector('.rid3-opt.selected');
      if (r1 !== stage.riddle1.answer ||
          !sel2 || parseInt(sel2.dataset.index) !== stage.riddle2.correct ||
          !sel3 || parseInt(sel3.dataset.index) !== stage.riddle3.correct) {
        isCorrect = false;
      }
    } else if (stage.type === 'certificate') {
      const nameInput = document.getElementById('playerHeroName');
      if (nameInput && nameInput.value.trim().length > 0) {
        this.playerName = nameInput.value.trim();
      }
      isCorrect = true;
    }

    if (isCorrect) {
      sounds.correct();
      this.addXp(60);

      // Boss-Schaden berechnen
      if (this.currentStageIdx === 8) {
        this.updateBossHp(66);
      } else if (this.currentStageIdx === 9) {
        this.updateBossHp(0);
      }

      // RPG-Items zum Inventar hinzufügen
      if (this.currentStageIdx === 1) {
        this.addItem('🤺 Fechtermaske', 'Feuerfeste Maske: Schützt vor 1000° heißem Drachenatem.');
        this.addItem('🗡️ Drachenlanze', 'Mächtige magische Lanze gegen dicke Drachenschuppen.');
        this.addItem('🏹 20 Elfenpfeile', 'Treffsichere Pfeile für den Weitschuss.');
      } else if (this.currentStageIdx === 2) {
        this.addItem('🧪 Heiltrank', 'Selbstgebrauter Trank: Stellt Lebenspunkte und Fokus wieder her.');
      } else if (this.currentStageIdx === 5) {
        this.addItem('🥕 Möhren für Joe', 'Frische Möhren: Pferd Joe galoppiert voller Kraft!');
      }

      this.showFeedback('🎉 Perfekt gerechnet! (+60 XP erhalten)', 'success');
      this.btnCheck.style.display = 'none';
      this.btnNext.classList.add('show');
    } else {
      sounds.wrong();
      this.showFeedback('🧐 Noch nicht ganz richtig! Überprüfe deine Rechnungen noch einmal (Tipp: Notizblock nutzen).', 'error');
    }
  }

  showFeedback(text, type = 'success') {
    this.feedbackMsg.textContent = text;
    this.feedbackMsg.className = `feedback-msg show ${type}`;
  }

  hideFeedback() {
    this.feedbackMsg.className = 'feedback-msg';
  }

  showVictoryScreen() {
    sounds.victory();
    this.screenGame.classList.remove('active');
    this.screenVictory.classList.add('active');

    document.getElementById('certName').textContent = this.playerName;
    document.getElementById('certChar').textContent = `${this.selectedChar.avatar} ${this.selectedChar.name}`;
    document.getElementById('certDate').textContent = new Date().toLocaleDateString('de-DE');
  }

  // ========================================================
  // Scratchpad Canvas Setup (Finger & Apple Pencil on iPad)
  // ========================================================
  setupScratchpad() {
    this.btnToggleScratchpad.addEventListener('click', () => {
      this.scratchpadModal.classList.add('open');
      this.resizeCanvas();
    });

    this.btnCloseScratchpad.addEventListener('click', () => {
      this.scratchpadModal.classList.remove('open');
    });

    this.btnClearCanvas.addEventListener('click', () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    });

    this.btnPenMode.addEventListener('click', () => {
      this.isEraser = false;
      this.btnPenMode.classList.add('active');
      this.btnEraserMode.classList.remove('active');
    });

    this.btnEraserMode.addEventListener('click', () => {
      this.isEraser = true;
      this.btnEraserMode.classList.add('active');
      this.btnPenMode.classList.remove('active');
    });

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      if (this.isEraser) {
        this.ctx.strokeStyle = '#fffffa';
        this.ctx.lineWidth = 20;
      } else {
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 3;
      }
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const endDraw = () => {
      this.isDrawing = false;
    };

    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);

    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    this.canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  // ========================================================
  // In-Game Calculator Setup
  // ========================================================
  setupCalculator() {
    this.btnCloseCalc.addEventListener('click', () => {
      this.calcModal.classList.remove('open');
    });

    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.click();
        const action = btn.dataset.action;
        const val = btn.textContent;

        if (action === 'clear') {
          this.calcValue = '0';
        } else if (action === 'equals') {
          try {
            const sanitized = this.calcValue.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
            const res = Function(`'use strict'; return (${sanitized})`)();
            this.calcValue = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(4)).toString();
          } catch (e) {
            this.calcValue = 'Fehler';
          }
        } else {
          if (this.calcValue === '0' || this.calcValue === 'Fehler') {
            this.calcValue = val;
          } else {
            this.calcValue += val;
          }
        }
        this.calcDisplay.textContent = this.calcValue;
      });
    });
  }
}

// Initialisiere Spiel beim Laden der Seite
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});

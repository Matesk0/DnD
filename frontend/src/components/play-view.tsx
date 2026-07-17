import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';
import Animated, { FadeIn, ZoomIn, FadeInUp } from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRuleset } from '@/hooks/useRuleset';
import { Lineicons } from '@lineiconshq/react-native-lineicons';
import {
  GamePadModern1Stroke,
  User4Stroke,
  Shield2Stroke,
  Book1Stroke,
  PlusStroke,
  XmarkStroke,
  HeartStroke,
  Crown3Stroke,
  Pencil1Stroke,
} from '@lineiconshq/free-icons';
import { CampaignGraph, Note } from '@/components/notes-view';

/* ──────────────────── Types ──────────────────── */

interface Campaign {
  id: string;
  title: string;
  description: string;
  playerCount: number;
  lastPlayed: string;
}

interface Player {
  name: string;
  characterName: string;
  charClass: string;
  status: 'online' | 'offline' | 'dm';
  color: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'message' | 'roll' | 'narrative';
  timestamp: string;
}

interface InventoryItem {
  id: string;
  name: string;
  qty: number;
}

interface CharacterSeed {
  id: string;
  name: string;
  charClass: string;
  race: string;
  stats: Record<string, number>;
  hp: number;
  speed: number;
}

/* ──────────────────── Data ──────────────────── */

const CAMPAIGNS_5E: Campaign[] = [
  {
    id: 'sword-coast',
    title: 'Echoes of the Underdark (5e)',
    description: 'A perilous descent through the twisted caverns beneath the Sword Coast. Strange whispers echo from the deep…',
    playerCount: 4,
    lastPlayed: '2 hours ago',
  },
  {
    id: 'icespire-peak',
    title: 'The Dragon of Icespire Peak (5e)',
    description: 'White dragon Cryovain has driven creatures from the mountains, terrorising the frontier town of Phandalin.',
    playerCount: 3,
    lastPlayed: 'Yesterday',
  },
  {
    id: 'barovia',
    title: 'Curse of Strahd (5e)',
    description: 'Trapped in the mist-shrouded realm of Barovia, your party must confront the vampire lord who rules the land.',
    playerCount: 5,
    lastPlayed: '3 days ago',
  },
];

const CAMPAIGNS_PF2E: Campaign[] = [
  {
    id: 'abomination-vaults',
    title: 'Abomination Vaults (PF2e)',
    description: 'Enter the megadungeon near Otari! Spooky ruins, malicious ghosts, and ancient vaults await.',
    playerCount: 4,
    lastPlayed: '3 hours ago',
  },
  {
    id: 'kingmaker',
    title: 'Kingmaker (PF2e)',
    description: 'Claim the Stolen Lands and build your own kingdom in this epic open-world sandbox.',
    playerCount: 5,
    lastPlayed: '1 week ago',
  },
];

const PLAYERS: Player[] = [
  { name: 'DM Dave', characterName: 'Dungeon Master', charClass: 'DM', status: 'dm', color: '#dfb15b' },
  { name: 'Alex', characterName: 'Thorrall Ironbreaker', charClass: 'Cleric', status: 'online', color: '#34c759' },
  { name: 'Sam', characterName: 'Elysia Moonwhisper', charClass: 'Wizard', status: 'offline', color: '#af52de' },
  { name: 'Jordan', characterName: 'Kaelen Shadowstep', charClass: 'Fighter', status: 'online', color: '#007aff' },
];

const CHARACTERS_5E: CharacterSeed[] = [
  {
    id: 'char_5e_1', name: 'Thorrall Ironbreaker', charClass: 'Cleric', race: 'Dwarf',
    stats: { strength: 14, dexterity: 8, constitution: 16, intelligence: 10, wisdom: 15, charisma: 12 },
    hp: 11, speed: 25,
  },
  {
    id: 'char_5e_2', name: 'Elysia Moonwhisper', charClass: 'Wizard', race: 'Elf',
    stats: { strength: 8, dexterity: 15, constitution: 12, intelligence: 16, wisdom: 13, charisma: 10 },
    hp: 7, speed: 30,
  },
];

const CHARACTERS_PF2E: CharacterSeed[] = [
  {
    id: 'char_pf2e_1', name: 'Valeros', charClass: 'Fighter', race: 'Human',
    stats: { strength: 18, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 10 },
    hp: 20, speed: 25,
  },
  {
    id: 'char_pf2e_2', name: 'Ezren', charClass: 'Wizard', race: 'Human',
    stats: { strength: 10, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 12, charisma: 10 },
    hp: 14, speed: 25,
  },
];

// 0=wall 1=floor 2=door 3=water 4=treasure
const DUNGEON_MAP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,4,1,0],
  [0,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,0],
  [0,1,1,4,1,1,0,0,0,1,0,0,0,0,1,1,1,1,1,0],
  [0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,2,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,2,0,0,0,0],
  [0,1,1,1,1,1,0,0,0,1,0,0,0,1,1,1,1,1,1,0],
  [0,1,4,1,1,1,0,0,0,1,0,0,0,1,3,3,1,1,1,0],
  [0,1,1,1,1,1,2,1,1,1,1,1,2,1,3,3,1,4,1,0],
  [0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const SCENES = [
  { id: 'dungeon', name: '🏰 Castle Dungeon Crawl', map: DUNGEON_MAP },
  {
    id: 'forest',
    name: '🌲 Goblin Ambush Forest',
    map: [
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,0,1,1,1,3,3,1,1,0,1,1,1,1,1,4,1,1],
      [1,1,1,0,1,1,1,2,1,1,1,0,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,0,0,1,1,1],
      [0,1,1,0,1,1,1,3,3,1,1,1,1,1,1,0,0,1,1,0],
      [0,1,1,0,1,1,1,3,3,1,4,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,0,0]
    ]
  },
  {
    id: 'cave',
    name: '🌋 Dragon\'s Lair Cave',
    map: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,3,3,3,3,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,3,3,3,3,1,1,1,1,1,1,4,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,3,3,3,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,3,3,3,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  }
];

const TILE_BG: Record<number, string> = {
  0: '#0a0a0d',
  1: '#16161b',
  2: '#4a2c10',
  3: '#0a1e3d',
  4: '#2a2008',
};
const TILE_BORDER: Record<number, string> = {
  0: '#0a0a0d',
  1: '#1e1e24',
  2: '#6b3d15',
  3: '#0d2e5a',
  4: '#3d3010',
};

const TILE_SIZE = 30;
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;

/* ──────────────────── Component ──────────────────── */

export function PlayView({
  campaigns: parentCampaigns,
  setCampaigns: setParentCampaigns,
}: {
  campaigns: CampaignGraph[];
  setCampaigns: React.Dispatch<React.SetStateAction<CampaignGraph[]>>;
}) {
  const theme = useTheme();
  const { ruleset } = useRuleset();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;

  const campaigns = ruleset === '5e' ? CAMPAIGNS_5E : CAMPAIGNS_PF2E;
  const characters = ruleset === '5e' ? CHARACTERS_5E : CHARACTERS_PF2E;

  /* ── Campaign selection ── */
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null;

  /* ── Character selection ── */
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedCharId(characters[0]?.id || null);
    setSelectedCampaignId(null);
  }, [ruleset]);

  const activeChar = characters.find((c) => c.id === selectedCharId) ?? null;

  /* ── Campaign graph mapping ── */
  const currentCampaignGraph = useMemo(() => {
    if (!selectedCampaignId || !activeCampaign) return null;
    let graph = parentCampaigns.find(c => c.id === selectedCampaignId);
    if (!graph) {
      // Create a default graph for this campaign on the fly
      const newGraph: CampaignGraph = {
        id: selectedCampaignId,
        title: activeCampaign.title,
        emoji: '⚔️',
        desc: activeCampaign.description,
        ruleset,
        notes: [
          {
            id: '1',
            title: 'Session Started',
            body: `Campaign play session started for ${activeCampaign.title}.`,
            linkedIds: []
          }
        ]
      };
      setTimeout(() => {
        setParentCampaigns(prev => [...prev, newGraph]);
      }, 0);
      return newGraph;
    }
    return graph;
  }, [selectedCampaignId, parentCampaigns, activeCampaign, ruleset]);

  const addAutoNote = useCallback((title: string, body: string) => {
    if (!selectedCampaignId) return;
    setParentCampaigns(prev => prev.map(c => {
      if (c.id === selectedCampaignId) {
        const newNote: Note = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          title,
          body,
          linkedIds: c.notes.length > 0 ? [c.notes[0].id] : []
        };
        return {
          ...c,
          notes: [...c.notes, newNote]
        };
      }
      return c;
    }));
  }, [selectedCampaignId, setParentCampaigns]);

  /* ── Right tab state ── */
  const [rightTab, setRightTab] = useState<'players' | 'inventories' | 'notes'>('players');
  const [selectedPlayNote, setSelectedPlayNote] = useState<Note | null>(null);
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteBody, setQuickNoteBody] = useState('');

  const handleCreateQuickNote = () => {
    if (!quickNoteTitle.trim() || !quickNoteBody.trim()) return;
    addAutoNote(quickNoteTitle, quickNoteBody);
    setQuickNoteTitle('');
    setQuickNoteBody('');
  };

  /* ── Player token positions on map ── */
  const [playerPositions, setPlayerPositions] = useState<Record<string, { row: number; col: number }>>({
    Thorrall: { row: 2, col: 2 },
    Elysia: { row: 2, col: 3 },
    Kaelen: { row: 3, col: 9 },
  });

  /* ── VTT / Foundry States ── */
  const [activeSceneId, setActiveSceneId] = useState<'dungeon' | 'forest' | 'cave'>('dungeon');
  const activeSceneMap = useMemo(() => {
    return SCENES.find((s) => s.id === activeSceneId)?.map || DUNGEON_MAP;
  }, [activeSceneId]);

  const [toolMode, setToolMode] = useState<'select' | 'measure' | 'draw' | 'light' | 'journal'>('select');
  const [measureStart, setMeasureStart] = useState<{ row: number; col: number } | null>(null);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [paintedCells, setPaintedCells] = useState<Record<string, string>>({});

  const scenePins = useMemo(() => {
    if (activeSceneId === 'dungeon') {
      return [
        { row: 4, col: 3, title: 'Goblin Guard Quarters', body: 'A heavy iron door locks this side room. A guard chest stands nearby.' },
        { row: 2, col: 17, title: 'Crypt Urn', body: 'A heavy clay urn covered in glyphs. Inspecting it reveals 250 silver coins.' },
      ];
    }
    if (activeSceneId === 'forest') {
      return [
        { row: 2, col: 17, title: 'Forgotten Alter Shrine', body: 'A weathered statue of a forgotten forest god. Ancient elvish carvings are faded.' },
      ];
    }
    return [];
  }, [activeSceneId]);

  // WASD/Arrows keyboard token movement listener on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || !selectedCampaignId || !activeChar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (typeof document !== 'undefined' && (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA')) {
        return;
      }

      const key = activeChar.name.split(' ')[0];
      const pos = playerPositions[key];
      if (!pos) return;

      let newRow = pos.row;
      let newCol = pos.col;

      if (e.key === 'w' || e.key === 'ArrowUp') newRow--;
      else if (e.key === 's' || e.key === 'ArrowDown') newRow++;
      else if (e.key === 'a' || e.key === 'ArrowLeft') newCol--;
      else if (e.key === 'd' || e.key === 'ArrowRight') newCol++;
      else return;

      if (newRow >= 0 && newRow < activeSceneMap.length && newCol >= 0 && newCol < activeSceneMap[0].length) {
        if (activeSceneMap[newRow][newCol] !== 0) {
          setPlayerPositions((prev) => ({
            ...prev,
            [key]: { row: newRow, col: newCol },
          }));
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedCampaignId, activeChar, playerPositions, activeSceneMap]);

  /* ── Chat ── */
  const chatRef = useRef<FlatList>(null);
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    { id: 'm1', sender: 'DM Dave', text: 'The heavy stone door creaks open, revealing a damp chamber filled with glowing blue fungi. A low growl echoes from the shadows…', type: 'narrative', timestamp: '12:00' },
    { id: 'm2', sender: 'Thorrall Ironbreaker', text: 'I raise my shield, preparing to cast Light.', type: 'message', timestamp: '12:02' },
  ]);
  const [messageText, setMessageText] = useState('');

  /* ── Inventories ── */
  const [backpack, setBackpack] = useState<InventoryItem[]>([
    { id: 'b1', name: 'Studded Leather Armor', qty: 1 },
    { id: 'b2', name: 'Potion of Healing', qty: 2 },
    { id: 'b3', name: 'Rations', qty: 5 },
  ]);
  const [sharedChest, setSharedChest] = useState<InventoryItem[]>([
    { id: 's1', name: 'Bag of Holding', qty: 1 },
    { id: 's2', name: 'Gold Pieces (GP)', qty: 450 },
    { id: 's3', name: 'Flawless Emerald', qty: 1 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemTarget, setNewItemTarget] = useState<'backpack' | 'shared'>('backpack');

  /* ── Dice roller ── */
  const [diceOpen, setDiceOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<number>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDisplay, setRollingDisplay] = useState<number | null>(null);
  const [rollResults, setRollResults] = useState<number[] | null>(null);
  const [rollKey, setRollKey] = useState(0);
  const rollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (rollingRef.current) clearInterval(rollingRef.current); };
  }, []);

  /* ── Helpers ── */

  const statMod = (val: number) => Math.floor((val - 10) / 2);

  const skills = useMemo(() => {
    if (!activeChar) return [];
    const s = activeChar.stats;
    return [
      { name: 'Acrobatics',     ability: 'DEX', mod: statMod(s.dexterity) },
      { name: 'Athletics',      ability: 'STR', mod: statMod(s.strength) },
      { name: 'Arcana',         ability: 'INT', mod: statMod(s.intelligence) },
      { name: 'History',        ability: 'INT', mod: statMod(s.intelligence) },
      { name: 'Insight',        ability: 'WIS', mod: statMod(s.wisdom) },
      { name: 'Investigation',  ability: 'INT', mod: statMod(s.intelligence) },
      { name: 'Perception',     ability: 'WIS', mod: statMod(s.wisdom) },
      { name: 'Persuasion',     ability: 'CHA', mod: statMod(s.charisma) },
      { name: 'Stealth',        ability: 'DEX', mod: statMod(s.dexterity) },
      { name: 'Survival',       ability: 'WIS', mod: statMod(s.wisdom) },
    ];
  }, [activeChar]);

  const postToChat = useCallback((sender: string, text: string, type: ChatMessage['type'] = 'roll') => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sender,
      text,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatLogs((prev) => [...prev, msg]);
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setRollResults(null);
    let ticks = 0;
    rollingRef.current = setInterval(() => {
      ticks++;
      setRollingDisplay(Math.floor(Math.random() * selectedDie) + 1);
      if (ticks >= 15) {
        if (rollingRef.current) clearInterval(rollingRef.current);
        const results: number[] = [];
        for (let i = 0; i < diceCount; i++) results.push(Math.floor(Math.random() * selectedDie) + 1);
        const total = results.reduce((a, b) => a + b, 0);
        setRollResults(results);
        setRollingDisplay(null);
        setIsRolling(false);
        setRollKey((k) => k + 1);
        const senderName = activeChar ? activeChar.name : 'Adventurer';
        postToChat(senderName, `rolled ${diceCount}d${selectedDie}: [${results.join(', ')}] = ${total}`);
        
        // Auto-log critical rolls
        if (selectedDie === 20) {
          results.forEach((val) => {
            if (val === 20) {
              addAutoNote("Critical Success! 🎲", `${senderName} rolled a Natural 20 on a d20 roll!`);
            } else if (val === 1) {
              addAutoNote("Critical Failure! 💀", `${senderName} rolled a Natural 1 on a d20 roll!`);
            }
          });
        }
      }
    }, 80);
  }, [isRolling, selectedDie, diceCount, activeChar, postToChat, addAutoNote]);

  const rollSkill = useCallback((skillName: string, ability: string, mod: number) => {
    const raw = Math.floor(Math.random() * 20) + 1;
    const total = raw + mod;
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
    const senderName = activeChar ? activeChar.name : 'Adventurer';
    postToChat(senderName, `${skillName} (${ability}) check: d20${modStr} → [${raw}] = ${total}`);

    // Auto-log critical checks
    if (raw === 20) {
      addAutoNote(`${skillName} Crit! 🎯`, `${senderName} rolled a Natural 20 on a ${skillName} (${ability}) check! (Total: ${total})`);
    } else if (raw === 1) {
      addAutoNote(`${skillName} Fumble! ⚠️`, `${senderName} rolled a Natural 1 on a ${skillName} (${ability}) check! (Total: ${total})`);
    }
  }, [activeChar, postToChat, addAutoNote]);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    postToChat(activeChar ? activeChar.name : 'Adventurer', messageText, 'message');
    setMessageText('');
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const item: InventoryItem = { id: `item_${Date.now()}`, name: newItemName, qty: 1 };
    if (newItemTarget === 'backpack') setBackpack((p) => [...p, item]);
    else setSharedChest((p) => [...p, item]);
    setNewItemName('');
  };

  const claimItem = (item: InventoryItem) => {
    setSharedChest((p) => p.filter((i) => i.id !== item.id));
    setBackpack((p) => [...p, item]);
  };

  const handleCellPress = (row: number, col: number) => {
    if (toolMode === 'select') {
      if (!activeChar || activeSceneMap[row][col] === 0) return;
      const key = activeChar.name.split(' ')[0];
      setPlayerPositions((prev) => ({ ...prev, [key]: { row, col } }));
    } else if (toolMode === 'measure') {
      if (!measureStart) {
        setMeasureStart({ row, col });
        setMeasuredDistance(null);
      } else {
        const dist = Math.max(Math.abs(row - measureStart.row), Math.abs(col - measureStart.col)) * 5;
        setMeasuredDistance(dist);
        setMeasureStart(null);
      }
    } else if (toolMode === 'draw') {
      const cellKey = `${row}-${col}`;
      setPaintedCells((prev) => {
        const updated = { ...prev };
        if (updated[cellKey]) {
          delete updated[cellKey];
        } else {
          updated[cellKey] = theme.accent;
        }
        return updated;
      });
    } else if (toolMode === 'journal') {
      const pin = scenePins.find((p) => p.row === row && p.col === col);
      if (pin) {
        setSelectedPlayNote({
          id: `pin-${row}-${col}`,
          title: `📌 VTT Note: ${pin.title}`,
          body: pin.body,
          linkedIds: [],
        });
      }
    }
  };

  const isCellVisible = (row: number, col: number) => {
    if (toolMode !== 'light') return true;
    if (!activeChar) return true;
    const key = activeChar.name.split(' ')[0];
    const pos = playerPositions[key];
    if (!pos) return true;
    const dist = Math.max(Math.abs(row - pos.row), Math.abs(col - pos.col));
    return dist <= 5; // Dynamic lighting visibility radius of 25ft
  };

  const runMacro = (index: number) => {
    if (!activeChar) return;
    const charName = activeChar.name;
    const d20 = () => Math.floor(Math.random() * 20) + 1;

    if (index === 1) {
      const roll = d20();
      const dexMod = Math.floor((activeChar.stats.dexterity - 10) / 2);
      postToChat(charName, `rolls for Initiative! 🎲 d20(${roll}) + Dex(${dexMod >= 0 ? '+' : ''}${dexMod}) = ${roll + dexMod}`, 'roll');
    } else if (index === 2) {
      const roll = d20();
      const strMod = Math.floor((activeChar.stats.strength - 10) / 2);
      const dmg = Math.floor(Math.random() * 8) + 1 + strMod;
      postToChat(charName, `swings Warhammer! 🗡️ d20(${roll}) + Str(${strMod >= 0 ? '+' : ''}${strMod}) = ${roll + strMod} to hit. Damage: ${dmg} bludgeoning!`, 'roll');
    } else if (index === 3) {
      const dmg = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
      postToChat(charName, `casts Burning Hands! 🪄 3d6 fire damage wave. Result: ${dmg} fire damage!`, 'roll');
    } else if (index === 4) {
      const roll = d20();
      const wisMod = Math.floor((activeChar.stats.wisdom - 10) / 2);
      postToChat(charName, `checks Perception! 👁️ d20(${roll}) + Wis(${wisMod >= 0 ? '+' : ''}${wisMod}) = ${roll + wisMod}`, 'roll');
    } else if (index === 5) {
      const roll = d20();
      const strMod = Math.floor((activeChar.stats.strength - 10) / 2);
      postToChat(charName, `checks Athletics! 💪 d20(${roll}) + Str(${strMod >= 0 ? '+' : ''}${strMod}) = ${roll + strMod}`, 'roll');
    } else if (index === 6) {
      const roll = d20();
      const dexMod = Math.floor((activeChar.stats.dexterity - 10) / 2);
      if (roll === 20) {
        addAutoNote('Critical Stealth Success!', `${charName} rolled a Natural 20 during a Stealth check in scene ${activeSceneId}.`);
      }
      postToChat(charName, `rolls Stealth! 👤 d20(${roll}) + Dex(${dexMod >= 0 ? '+' : ''}${dexMod}) = ${roll + dexMod}`, 'roll');
    } else if (index === 7) {
      postToChat(charName, `spends a Hit Die during a Short Rest! 💤 Recovers ${Math.floor(Math.random() * 8) + 1} HP.`, 'narrative');
    } else if (index === 8) {
      const recovered = Math.floor(Math.random() * 4) + Math.floor(Math.random() * 4) + 2;
      postToChat(charName, `drinks a Potion of Healing! 🧪 Recovers ${recovered} HP.`, 'narrative');
    } else if (index === 9) {
      postToChat(charName, `takes the Dodge action! 🛡️ Attacks against them have disadvantage until next turn.`, 'narrative');
    } else if (index === 10) {
      const roll = d20();
      if (roll === 20) {
        addAutoNote('Critical Success Event!', `A natural 20 was rolled during campaign sessions.`);
      }
      postToChat(charName, `rolls a raw d20: 🎲 ${roll}`, 'roll');
    }
  };

  /* ══════════════════ CAMPAIGN SELECTOR ══════════════════ */

  if (!selectedCampaignId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.campaignSelectorContent}>
          <View style={styles.campaignHeader}>
            <Lineicons icon={Crown3Stroke} size={28} color="#dfb15b" />
            <ThemedText type="subtitle" style={styles.campaignTitle}>Choose Your Campaign</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', marginBottom: Spacing.four }}>
            Select a campaign to enter the play session board.
          </ThemedText>

          <View style={styles.campaignGrid}>
            {campaigns.map((c) => (
              <Pressable
                key={c.id}
                style={(state: any) => [
                  styles.campaignCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                  state.hovered && styles.campaignCardHover,
                  state.pressed && { opacity: 0.9 },
                ]}
                onPress={() => setSelectedCampaignId(c.id)}>
                <View style={styles.campaignCardIcon}>
                  <Lineicons icon={Book1Stroke} size={26} color="#dfb15b" />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <ThemedText type="subtitle" style={{ fontSize: 17, fontWeight: 'bold' }}>{c.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 18 }}>{c.description}</ThemedText>
                  <View style={{ flexDirection: 'row', gap: Spacing.three, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Lineicons icon={User4Stroke} size={11} color="#dfb15b" />
                      <ThemedText type="code" style={{ fontSize: 10 }}>{c.playerCount} players</ThemedText>
                    </View>
                    <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>Last played: {c.lastPlayed}</ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ══════════════════ PLAY SESSION BOARD ══════════════════ */

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── Header bar ── */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <Pressable onPress={() => setSelectedCampaignId(null)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <ThemedText style={{ color: '#dfb15b', fontWeight: 'bold', fontSize: 12 }}>← Back</ThemedText>
          </Pressable>
          <Lineicons icon={Crown3Stroke} size={16} color="#dfb15b" />
          <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>{activeCampaign?.title}</ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>Character:</ThemedText>
          {characters.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.charPill, selectedCharId === c.id && styles.charPillActive]}
              onPress={() => setSelectedCharId(c.id)}>
              <ThemedText style={[styles.charPillText, selectedCharId === c.id && { color: '#dfb15b' }]}>
                {c.name.split(' ')[0]}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Board ── */}
      <View style={[styles.board, isLargeScreen && styles.boardLarge]}>

        {/* ═══ LEFT COLUMN: Chat (top) + Skills (bottom) ═══ */}
        <View style={[styles.leftCol, isLargeScreen && styles.leftColLarge]}>
          {/* Chat */}
          <ThemedView type="backgroundElement" style={[styles.panel, { flex: 3 }]}>  
            <ThemedText type="smallBold" style={styles.panelTitle}>
              <Lineicons icon={Pencil1Stroke} size={12} color="#dfb15b" /> Chat Log
            </ThemedText>
            <FlatList
              ref={chatRef}
              data={chatLogs}
              keyExtractor={(m) => m.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: Spacing.one, paddingBottom: Spacing.one }}
              renderItem={({ item }) => (
                <View style={[
                  styles.chatBubble,
                  item.type === 'narrative' && styles.chatNarrative,
                  item.type === 'roll' && styles.chatRoll,
                ]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type="code" style={[{ fontSize: 9, fontWeight: 'bold' }, item.type === 'narrative' && { color: '#dfb15b' }]}>
                      {item.sender}
                    </ThemedText>
                    <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 8 }}>{item.timestamp}</ThemedText>
                  </View>
                  <ThemedText type="small" style={[
                    { lineHeight: 17, fontSize: 12 },
                    item.type === 'narrative' && { fontStyle: 'italic', color: '#d0d0d0' },
                    item.type === 'roll' && { color: '#dfb15b', fontWeight: 'bold' },
                  ]}>
                    {item.text}
                  </ThemedText>
                </View>
              )}
            />
            <View style={styles.chatInputRow}>
              <TextInput
                style={[styles.chatInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                placeholder="Say something…"
                placeholderTextColor={theme.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                onSubmitEditing={sendMessage}
              />
              <Pressable style={styles.chatSendBtn} onPress={sendMessage}>
                <ThemedText style={{ color: '#000', fontWeight: 'bold', fontSize: 11 }}>Send</ThemedText>
              </Pressable>
            </View>
          </ThemedView>

          {/* Skills */}
          <ThemedView type="backgroundElement" style={[styles.panel, { flex: 2 }]}>
            <ThemedText type="smallBold" style={styles.panelTitle}>
              <Lineicons icon={Shield2Stroke} size={12} color="#dfb15b" /> Skills
              {activeChar && <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 9 }}> — {activeChar.name.split(' ')[0]}</ThemedText>}
            </ThemedText>
            {!activeChar ? (
              <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic', padding: Spacing.two }}>Select a character above.</ThemedText>
            ) : (
              <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                {skills.map((sk) => (
                  <Pressable
                    key={sk.name}
                    style={({ pressed }) => [styles.skillRow, pressed && { backgroundColor: 'rgba(223,177,91,0.08)' }]}
                    onPress={() => rollSkill(sk.name, sk.ability, sk.mod)}>
                    <ThemedText type="small" style={{ fontSize: 11 }}>{sk.name}</ThemedText>
                    <ThemedText type="code" style={{ color: '#dfb15b', fontWeight: 'bold', fontSize: 11 }}>
                      {sk.mod >= 0 ? `+${sk.mod}` : sk.mod}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </ThemedView>
        </View>

        {/* ═══ CENTER COLUMN: Map + Floating Tools + Macros ═══ */}
        <View style={styles.centerCol}>
          {/* Scenes Selector Header */}
          <View style={[styles.sceneBar, { borderBottomColor: theme.borderColor }]}>
            {SCENES.map((sc) => (
              <Pressable
                key={sc.id}
                style={[
                  styles.sceneBtn,
                  activeSceneId === sc.id && [styles.sceneBtnActive, { borderBottomColor: theme.accent }],
                ]}
                onPress={() => {
                  setActiveSceneId(sc.id as any);
                  setPaintedCells({});
                  setMeasureStart(null);
                  setMeasuredDistance(null);
                }}>
                <ThemedText
                  style={[
                    styles.sceneBtnText,
                    activeSceneId === sc.id && { color: theme.accent, fontWeight: 'bold' },
                  ]}>
                  {sc.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.mapGridContainer}>
            {/* Left Floating Tool Palette */}
            <View style={[styles.toolPalette, { backgroundColor: theme.backgroundElement, borderColor: theme.borderColor }]}>
              {[
                { mode: 'select', icon: User4Stroke, tooltip: 'Select Token' },
                { mode: 'measure', icon: Shield2Stroke, tooltip: 'Measure' },
                { mode: 'draw', icon: Pencil1Stroke, tooltip: 'Draw Zone' },
                { mode: 'light', icon: GamePadModern1Stroke, tooltip: 'Dynamic Vision' },
                { mode: 'journal', icon: Book1Stroke, tooltip: 'Journal Pins' },
              ].map((tool) => {
                const isActive = toolMode === tool.mode;
                return (
                  <Pressable
                    key={tool.mode}
                    style={[
                      styles.toolBtn,
                      isActive && [styles.toolBtnActive, { backgroundColor: theme.backgroundSelected }],
                    ]}
                    onPress={() => {
                      setToolMode(tool.mode as any);
                      setMeasureStart(null);
                      setMeasuredDistance(null);
                    }}>
                    <Lineicons icon={tool.icon} size={15} color={isActive ? theme.accent : theme.textSecondary} />
                  </Pressable>
                );
              })}
            </View>

            {/* Interactive Grid Canvas */}
            <ThemedView type="backgroundElement" style={styles.mapContainer}>
              <ScrollView horizontal contentContainerStyle={{ alignItems: 'center' }}>
                <ScrollView
                  nestedScrollEnabled
                  contentContainerStyle={{ alignItems: 'center', paddingVertical: Spacing.two }}>
                  <View>
                    {activeSceneMap.map((row, rIdx) => (
                      <View key={rIdx} style={{ flexDirection: 'row' }}>
                        {row.map((cell, cIdx) => {
                          const playerHere = Object.entries(playerPositions).find(
                            ([, pos]) => pos.row === rIdx && pos.col === cIdx
                          );
                          const playerData = playerHere
                            ? PLAYERS.find((p) => p.characterName.startsWith(playerHere[0]))
                            : null;
                          const cellKey = `${rIdx}-${cIdx}`;
                          const isPainted = paintedCells[cellKey];
                          const visible = isCellVisible(rIdx, cIdx);
                          const hasPin = scenePins.some((p) => p.row === rIdx && p.col === cIdx);

                          return (
                            <Pressable
                              key={cIdx}
                              onPress={() => handleCellPress(rIdx, cIdx)}
                              style={[
                                styles.mapCell,
                                {
                                  backgroundColor: isPainted
                                    ? isPainted
                                    : TILE_BG[cell] ?? '#0a0a0d',
                                  borderColor: TILE_BORDER[cell] ?? '#0a0a0d',
                                },
                                cell === 4 && styles.treasureGlow,
                                !visible && { opacity: 0.1 },
                              ]}>
                              {playerData && (
                                <View style={[styles.playerToken, { borderColor: playerData.color }]}>
                                  <ThemedText style={[styles.tokenLetter, { color: playerData.color }]}>
                                    {playerData.characterName[0]}
                                  </ThemedText>
                                </View>
                              )}
                              {cell === 4 && !playerData && !isPainted && (
                                <ThemedText style={{ fontSize: 10, color: theme.accent }}>✦</ThemedText>
                              )}
                              {hasPin && toolMode === 'journal' && !playerData && (
                                <View style={styles.pinDot}>
                                  <ThemedText style={{ color: '#fff', fontSize: 6, fontWeight: 'bold' }}>📌</ThemedText>
                                </View>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </ScrollView>

              {/* Status display overlay */}
              <View style={styles.distanceDisplay}>
                <ThemedText type="code" style={{ fontSize: 9 }}>
                  Mode: {toolMode.toUpperCase()}
                  {measuredDistance !== null ? ` | Measured: ${measuredDistance} ft` : ''}
                  {measureStart ? ' | Clicking destination...' : ''}
                </ThemedText>
              </View>

              {/* Dice FAB */}
              <Pressable
                style={[styles.diceFab, { backgroundColor: theme.accent }]}
                onPress={() => {
                  setDiceOpen(!diceOpen);
                  setRollResults(null);
                }}>
                <Lineicons icon={GamePadModern1Stroke} size={20} color="#000" />
              </Pressable>

              {/* Dice popup */}
              {diceOpen && (
                <Animated.View entering={FadeInUp.duration(200)} style={styles.dicePopup}>
                  <View style={styles.dicePopupHeader}>
                    <ThemedText type="smallBold" style={{ color: theme.accent, fontSize: 12 }}>
                      Table Roller
                    </ThemedText>
                    <Pressable onPress={() => setDiceOpen(false)}>
                      <Lineicons icon={XmarkStroke} size={14} color="#888" />
                    </Pressable>
                  </View>

                  {/* Die type selector */}
                  <View style={styles.diceTypeRow}>
                    {DICE_TYPES.map((d) => (
                      <Pressable
                        key={d}
                        style={[
                          styles.dieTypeBtn,
                          selectedDie === d && [styles.dieTypeBtnActive, { backgroundColor: theme.accent, borderColor: theme.accent }],
                        ]}
                        onPress={() => setSelectedDie(d)}>
                        <ThemedText
                          style={[
                            styles.dieTypeText,
                            selectedDie === d && { color: '#000' },
                          ]}>
                          d{d}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>

                  {/* Count selector */}
                  <View style={styles.countRow}>
                    <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>
                      Count:
                    </ThemedText>
                    <Pressable
                      style={styles.countBtn}
                      onPress={() => setDiceCount((c) => Math.max(1, c - 1))}>
                      <ThemedText style={{ color: theme.accent, fontSize: 14, fontWeight: 'bold' }}>−</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.countValue}>{diceCount}</ThemedText>
                    <Pressable
                      style={styles.countBtn}
                      onPress={() => setDiceCount((c) => Math.min(10, c + 1))}>
                      <ThemedText style={{ color: theme.accent, fontSize: 14, fontWeight: 'bold' }}>+</ThemedText>
                    </Pressable>
                  </View>

                  {/* Result display */}
                  <View style={styles.resultArea}>
                    {isRolling && rollingDisplay !== null && (
                      <ThemedText style={styles.rollingNumber}>{rollingDisplay}</ThemedText>
                    )}
                    {!isRolling && rollResults && (
                      <Animated.View
                        key={rollKey}
                        entering={ZoomIn.duration(300)}
                        style={{ alignItems: 'center' }}>
                        <ThemedText style={[styles.resultTotal, { color: theme.accent }]}>
                          {rollResults.reduce((a, b) => a + b, 0)}
                        </ThemedText>
                        {rollResults.length > 1 && (
                          <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 9 }}>
                            [{rollResults.join(', ')}]
                          </ThemedText>
                        )}
                      </Animated.View>
                    )}
                    {!isRolling && !rollResults && (
                      <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>
                        —
                      </ThemedText>
                    )}
                  </View>

                  {/* Roll button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.rollBtn,
                      { backgroundColor: theme.accent },
                      pressed && { opacity: 0.8 },
                      isRolling && { opacity: 0.5 },
                    ]}
                    disabled={isRolling}
                    onPress={rollDice}>
                    <ThemedText style={styles.rollBtnText}>
                      {isRolling ? 'Rolling…' : 'Roll!'}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              )}
            </ThemedView>

            {/* Bottom hotbar macros */}
            <View style={[styles.macroBar, { borderTopColor: theme.borderColor }]}>
              <ThemedText type="code" style={[styles.macroTitle, { color: theme.accent }]}>
                Macros:
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.macroScroll}>
                {[
                  { label: 'Initiative ⚔️', idx: 1 },
                  { label: 'Melee Attack 🗡️', idx: 2 },
                  { label: 'Cast Spell 🪄', idx: 3 },
                  { label: 'Perception 👁️', idx: 4 },
                  { label: 'Athletics 💪', idx: 5 },
                  { label: 'Stealth 👤', idx: 6 },
                  { label: 'Short Rest 💤', idx: 7 },
                  { label: 'Heal Potion 🧪', idx: 8 },
                  { label: 'Dodge 🛡️', idx: 9 },
                  { label: 'Raw d20 🎲', idx: 10 },
                ].map((macro) => (
                  <Pressable
                    key={macro.idx}
                    style={({ pressed }) => [
                      styles.macroSlot,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.borderColor,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => runMacro(macro.idx)}>
                    <ThemedText style={styles.macroLabel}>{macro.label}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* ═══ RIGHT COLUMN: Players / Inventories / Campaign Notes (Tabbed) ═══ */}
        {isLargeScreen && (
          <View style={styles.rightCol}>
            {/* Tab navigation headers */}
            <View style={styles.rightTabs}>
              {(['players', 'inventories', 'notes'] as const).map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.rightTabHeader, rightTab === tab && styles.rightTabHeaderActive]}
                  onPress={() => setRightTab(tab)}>
                  <ThemedText style={[styles.rightTabHeaderText, rightTab === tab && { color: '#dfb15b' }]}>
                    {tab.toUpperCase()}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {rightTab === 'players' && (
              <ThemedView type="backgroundElement" style={[styles.panel, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.panelTitle}>
                  <Lineicons icon={User4Stroke} size={12} color="#dfb15b" /> Active Players
                </ThemedText>
                <View style={{ gap: Spacing.two }}>
                  {PLAYERS.map((p, i) => (
                    <View key={i} style={styles.playerRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.statusDot, { backgroundColor: p.status === 'online' ? '#34c759' : p.status === 'dm' ? '#dfb15b' : '#555' }]} />
                        <View>
                          <ThemedText type="smallBold" style={{ fontSize: 11 }}>{p.characterName}</ThemedText>
                          <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 9 }}>
                            {p.status === 'dm' ? 'Dungeon Master' : `${p.charClass} · ${p.name}`}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText type="code" style={[
                        { fontSize: 9, fontWeight: 'bold' },
                        p.status === 'online' && { color: '#34c759' },
                        p.status === 'dm' && { color: '#dfb15b' },
                        p.status === 'offline' && { color: '#555' },
                      ]}>
                        {p.status.toUpperCase()}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </ThemedView>
            )}

            {rightTab === 'inventories' && (
              <ThemedView type="backgroundElement" style={[styles.panel, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.panelTitle}>
                  <Lineicons icon={Book1Stroke} size={12} color="#dfb15b" /> Inventories
                </ThemedText>
                <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                  {/* Backpack */}
                  <ThemedText type="code" style={styles.invSectionTitle}>Personal Backpack</ThemedText>
                  {backpack.map((it) => (
                    <View key={it.id} style={styles.invRow}>
                      <ThemedText type="small" style={{ fontSize: 11 }}>{it.name}</ThemedText>
                      <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>×{it.qty}</ThemedText>
                    </View>
                  ))}

                  {/* Shared */}
                  <ThemedText type="code" style={[styles.invSectionTitle, { marginTop: Spacing.three }]}>Shared Chest</ThemedText>
                  {sharedChest.map((it) => (
                    <View key={it.id} style={styles.invRow}>
                      <ThemedText type="small" style={{ fontSize: 11 }}>{it.name}</ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 10 }}>×{it.qty}</ThemedText>
                        <Pressable onPress={() => claimItem(it)}>
                          <ThemedText style={styles.claimBtn}>Claim</ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Add item */}
                <View style={styles.addItemBar}>
                  <TextInput
                    style={[styles.addItemInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                    placeholder="Add item…"
                    placeholderTextColor={theme.textSecondary}
                    value={newItemName}
                    onChangeText={setNewItemName}
                    onSubmitEditing={addItem}
                  />
                  <View style={styles.addItemTargets}>
                    <Pressable
                      style={[styles.addItemTargetBtn, newItemTarget === 'backpack' && styles.addItemTargetActive]}
                      onPress={() => setNewItemTarget('backpack')}>
                      <ThemedText style={{ fontSize: 8, fontWeight: 'bold' }}>BP</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.addItemTargetBtn, newItemTarget === 'shared' && styles.addItemTargetActive]}
                      onPress={() => setNewItemTarget('shared')}>
                      <ThemedText style={{ fontSize: 8, fontWeight: 'bold' }}>SC</ThemedText>
                    </Pressable>
                    <Pressable style={styles.addItemSubmit} onPress={addItem}>
                      <Lineicons icon={PlusStroke} size={12} color="#000" />
                    </Pressable>
                  </View>
                </View>
              </ThemedView>
            )}

            {rightTab === 'notes' && (
              <ThemedView type="backgroundElement" style={[styles.panel, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.panelTitle}>
                  <Lineicons icon={Book1Stroke} size={12} color="#dfb15b" /> Campaign Notes
                </ThemedText>
                
                <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                  {currentCampaignGraph?.notes.map((note) => (
                    <Pressable
                      key={note.id}
                      style={({ pressed }) => [styles.invRow, pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }]}
                      onPress={() => setSelectedPlayNote(note)}>
                      <ThemedText type="small" style={{ fontSize: 11, color: '#dfb15b', fontWeight: '500' }}>
                        📄 {note.title}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 9 }}>›</ThemedText>
                    </Pressable>
                  ))}
                  {(!currentCampaignGraph || currentCampaignGraph.notes.length === 0) && (
                    <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic', padding: 8 }}>
                      No campaign notes found.
                    </ThemedText>
                  )}
                </ScrollView>

                {/* Add Quick Note Form */}
                <View style={styles.addItemBar}>
                  <TextInput
                    style={[styles.addItemInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background, height: 24 }]}
                    placeholder="Quick Note Title…"
                    placeholderTextColor={theme.textSecondary}
                    value={quickNoteTitle}
                    onChangeText={setQuickNoteTitle}
                  />
                  <TextInput
                    style={[styles.addItemInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background, height: 40, textAlignVertical: 'top' }]}
                    placeholder="Note Body text…"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    value={quickNoteBody}
                    onChangeText={setQuickNoteBody}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.rollBtn,
                      { paddingVertical: 4, marginTop: 4 },
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={handleCreateQuickNote}>
                    <ThemedText style={[styles.rollBtnText, { fontSize: 11 }]}>Save Journal Note</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            )}
          </View>
        )}
      </View>

      {/* Note Reader Modal overlay */}
      {selectedPlayNote && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>Campaign Log Note</ThemedText>
              <Pressable onPress={() => setSelectedPlayNote(null)}>
                <Lineicons icon={XmarkStroke} size={16} color="#aaa" />
              </Pressable>
            </View>
            <View style={styles.modalDivider} />
            <ScrollView contentContainerStyle={{ paddingVertical: Spacing.two }}>
              <ThemedText type="subtitle" style={{ fontSize: 18, color: '#dfb15b', fontWeight: 'bold', marginBottom: 12 }}>
                {selectedPlayNote.title}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, lineHeight: 18 }}>
                {selectedPlayNote.body}
              </ThemedText>
            </ScrollView>
          </ThemedView>
        </Animated.View>
      )}
    </View>
  );
}

/* ──────────────────── Styles ──────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Campaign selector */
  campaignSelectorContent: { padding: Spacing.four, alignItems: 'center' },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  campaignTitle: { color: '#dfb15b', fontWeight: 'bold', fontSize: 22 },
  campaignGrid: { width: '100%', maxWidth: 700, gap: Spacing.three },
  campaignCard: {
    flexDirection: 'row',
    padding: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    gap: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: '#dfb15b',
  },
  campaignCardHover: {
    borderColor: '#dfb15b',
    shadowColor: '#dfb15b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    transform: [{ translateY: -2 }],
  },
  campaignCardIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(223,177,91,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(223,177,91,0.12)',
  },

  /* Header bar */
  headerBar: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    borderBottomWidth: 1, borderBottomColor: '#1d1d21',
    backgroundColor: '#0a0a0d',
    gap: Spacing.two,
  },
  backBtn: {
    paddingVertical: 3, paddingHorizontal: Spacing.two,
    borderRadius: 4, borderWidth: 1, borderColor: '#262629',
  },
  charPill: {
    paddingHorizontal: Spacing.two, paddingVertical: 3,
    borderRadius: 4, borderWidth: 1, borderColor: '#262629',
    backgroundColor: '#121215',
  },
  charPillActive: { borderColor: '#dfb15b', backgroundColor: 'rgba(223,177,91,0.08)' },
  charPillText: { fontSize: 10, fontWeight: 'bold', color: '#777' },

  /* Board layout */
  board: { flex: 1, padding: Spacing.two, gap: Spacing.two },
  boardLarge: { flexDirection: 'row' },
  leftCol: { gap: Spacing.two },
  leftColLarge: { width: 260 },
  centerCol: { flex: 1 },
  rightCol: { width: 240, gap: Spacing.two },

  /* Panels */
  panel: {
    borderRadius: Spacing.two, borderWidth: 1, borderColor: '#1d1d21',
    padding: Spacing.two, gap: Spacing.one,
    overflow: 'hidden',
  },
  panelTitle: {
    color: '#dfb15b', fontSize: 12, fontWeight: 'bold',
    paddingBottom: Spacing.one,
    borderBottomWidth: 1, borderBottomColor: 'rgba(223,177,91,0.1)',
    marginBottom: Spacing.half,
  },

  /* Chat */
  chatBubble: {
    padding: Spacing.one, borderRadius: 4, gap: 2,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderLeftWidth: 2, borderLeftColor: '#262629',
  },
  chatNarrative: { backgroundColor: 'rgba(223,177,91,0.03)', borderLeftColor: '#dfb15b' },
  chatRoll: { backgroundColor: 'rgba(223,177,91,0.06)', borderLeftColor: '#dfb15b' },
  chatInputRow: { flexDirection: 'row', gap: Spacing.one, marginTop: Spacing.one },
  chatInput: { flex: 1, height: 30, borderWidth: 1, borderRadius: 4, paddingHorizontal: Spacing.two, fontSize: 11 },
  chatSendBtn: {
    height: 30, paddingHorizontal: Spacing.two,
    backgroundColor: '#dfb15b', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Skills */
  skillRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 5, paddingHorizontal: 6,
    borderRadius: 3,
  },

  /* Map */
  mapContainer: {
    flex: 1, borderRadius: Spacing.two, borderWidth: 1, borderColor: '#1d1d21',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapCell: {
    width: TILE_SIZE, height: TILE_SIZE,
    borderWidth: 0.5,
    justifyContent: 'center', alignItems: 'center',
  },
  treasureGlow: {
    shadowColor: '#dfb15b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  playerToken: {
    width: TILE_SIZE - 6, height: TILE_SIZE - 6,
    borderRadius: (TILE_SIZE - 6) / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  tokenLetter: { fontSize: 10, fontWeight: 'bold' },

  /* Dice FAB */
  diceFab: {
    position: 'absolute', bottom: Spacing.three,
    alignSelf: 'center',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#dfb15b',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#dfb15b', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  dicePopup: {
    position: 'absolute', bottom: 70,
    alignSelf: 'center',
    width: 260,
    backgroundColor: '#111114',
    borderRadius: Spacing.two,
    borderWidth: 1, borderColor: '#262629',
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 10,
  },
  dicePopupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diceTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dieTypeBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 4, borderWidth: 1, borderColor: '#262629',
  },
  dieTypeBtnActive: { backgroundColor: '#dfb15b', borderColor: '#dfb15b' },
  dieTypeText: { fontSize: 10, fontWeight: 'bold', color: '#999' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  countBtn: {
    width: 24, height: 24, borderRadius: 4,
    borderWidth: 1, borderColor: '#262629',
    justifyContent: 'center', alignItems: 'center',
  },
  countBtnText: { color: '#dfb15b', fontSize: 14, fontWeight: 'bold' },
  countValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  resultArea: {
    height: 60,
    backgroundColor: '#0a0a0d',
    borderRadius: Spacing.one,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#1d1d21',
  },
  rollingNumber: { fontSize: 28, fontWeight: 'bold', color: '#555' },
  resultTotal: { fontSize: 32, fontWeight: 'bold', color: '#dfb15b' },
  rollBtn: {
    backgroundColor: '#dfb15b', borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rollBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },

  /* Players */
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  /* Inventories */
  invSectionTitle: { fontSize: 10, color: '#dfb15b', fontWeight: 'bold', marginBottom: 2 },
  invRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  claimBtn: {
    fontSize: 8, color: '#dfb15b', fontWeight: 'bold',
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: '#dfb15b', borderRadius: 2,
  },
  addItemBar: { marginTop: Spacing.one, gap: 4, paddingTop: Spacing.one, borderTopWidth: 1, borderTopColor: '#1d1d21' },
  addItemInput: { height: 26, borderWidth: 1, borderRadius: 3, paddingHorizontal: Spacing.one, fontSize: 10 },
  addItemTargets: { flexDirection: 'row', gap: 3 },
  addItemTargetBtn: {
    flex: 1, height: 22, borderRadius: 3,
    borderWidth: 1, borderColor: '#262629',
    justifyContent: 'center', alignItems: 'center',
  },
  addItemTargetActive: { backgroundColor: '#dfb15b', borderColor: '#dfb15b' },
  addItemSubmit: {
    width: 22, height: 22, backgroundColor: '#dfb15b',
    borderRadius: 3, justifyContent: 'center', alignItems: 'center',
  },
  
  /* Tabs in right column */
  rightTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
    backgroundColor: '#0a0a0d',
    borderRadius: 4,
    borderWidth: 1, borderColor: '#1d1d21',
    overflow: 'hidden',
  },
  rightTabHeader: {
    flex: 1,
    paddingVertical: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightTabHeaderActive: {
    backgroundColor: 'rgba(223,177,91,0.08)',
  },
  rightTabHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
  },
  
  /* Modal Overlay */
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#dfb15b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#2d2d2d',
    marginVertical: Spacing.two,
  },

  /* VTT Foundry Additions */
  sceneBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0d',
    borderBottomWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    gap: 8,
  },
  sceneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sceneBtnActive: {},
  sceneBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  mapGridContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  toolPalette: {
    width: 36,
    borderRightWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  toolBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBtnActive: {},
  distanceDisplay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },
  macroBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    borderTopWidth: 1,
    backgroundColor: '#08080a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
    zIndex: 5,
  },
  macroTitle: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  macroScroll: {
    alignItems: 'center',
    gap: 6,
  },
  macroSlot: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#aaa',
  },
});

import React, { useState, useMemo, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Note {
  id: string;
  title: string;
  body: string;
  linkedIds: string[];
}

interface CampaignGraph {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  notes: Note[];
}

const INITIAL_CAMPAIGNS: CampaignGraph[] = [
  {
    id: 'sword-coast',
    title: 'Sword Coast Chronicles',
    emoji: '⚔️',
    desc: 'The Campaign set in the Forgotten Realms. Track the Cult of the Dragon Eye near Neverwinter.',
    notes: [
      {
        id: '1',
        title: 'Forgotten Realms Campaign',
        body: 'The campaign is set in the Sword Coast. The party is currently investigating a mysterious cult in Neverwinter.',
        linkedIds: ['2', '3'],
      },
      {
        id: '2',
        title: 'Cult of the Dragon Eye',
        body: 'A secretive cult worshipping an ancient red dragon. Their symbol is a crimson eye encircled by gold claws. They seek magic relics.',
        linkedIds: ['1', '4'],
      },
      {
        id: '3',
        title: 'Neverwinter Hub',
        body: 'The jewel of the North. Lord Neverember rules. The city is recovering from volcanic eruptions and plague.',
        linkedIds: ['1'],
      },
      {
        id: '4',
        title: 'Amulet of Fire',
        body: 'A magic item currently held by the Cult of the Dragon Eye. It grants immunity to fire damage and can summon flame spirits.',
        linkedIds: ['2'],
      },
    ],
  },
  {
    id: 'barovia',
    title: 'Barovia Gothic Journal',
    emoji: '🏰',
    desc: 'Curse of Strahd campaign notes. Track the Tarokka readings, Castle Ravenloft mysteries, and Strahd himself.',
    notes: [
      {
        id: '1',
        title: 'Curse of Strahd Campaign',
        body: 'Trapped in the mist-shrouded land of Barovia. We must find a way to escape or defeat the vampire lord.',
        linkedIds: ['2', '3'],
      },
      {
        id: '2',
        title: 'Count Strahd von Zarovich',
        body: 'The ancient lord of Barovia. A powerful vampire wizard residing in Castle Ravenloft. He has taken an interest in Ireena.',
        linkedIds: ['1', '3'],
      },
      {
        id: '3',
        title: 'Castle Ravenloft',
        body: 'The gothic fortress looming over the valley of Barovia. Full of deadly traps, crypts, and Strahd\'s court.',
        linkedIds: ['1', '2', '4'],
      },
      {
        id: '4',
        title: 'The Sunsword',
        body: 'A legendary sentient weapon with a blade of pure sunlight. Capable of dealing radiant damage, deadly to vampires.',
        linkedIds: ['3'],
      },
    ],
  },
  {
    id: 'waterdeep',
    title: 'Waterdeep Dragon Heist',
    emoji: '🪙',
    desc: 'Urban faction war for 500,000 gold dragons. Track faction ranks and underworld contacts.',
    notes: [
      {
        id: '1',
        title: 'Dragon Heist Campaign',
        body: 'A secret vault containing half a million gold coins is hidden somewhere in the city. Multiple factions are racing to find it.',
        linkedIds: ['2', '3'],
      },
      {
        id: '2',
        title: 'Xanathar Guild',
        body: 'An underworld criminal organization run by Xanathar, a paranoid Beholder. Their base is in the sewers.',
        linkedIds: ['1', '4'],
      },
      {
        id: '3',
        title: 'The Stone of Golorr',
        body: 'A sentient green stone that holds the key to unlocking the vault. It can wipe memories and telepathically communicate.',
        linkedIds: ['1'],
      },
      {
        id: '4',
        title: 'Volo\'s Quest',
        body: 'Volothamp Geddarm hired us to find Floon Blagmaar. As a reward, he gave us Trollskull Manor.',
        linkedIds: ['1'],
      },
    ],
  },
];

export function NotesView() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [campaigns, setCampaigns] = useState<CampaignGraph[]>(INITIAL_CAMPAIGNS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Time state for floating animation like Obsidian
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      setTime((t) => t + 0.015);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Active Campaign Data
  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  // Selected note details inside the active campaign
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteEditMode, setNoteEditMode] = useState<boolean>(false);

  // Form State for editing/creating
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editLinks, setEditLinks] = useState<string[]>([]);

  // Find currently active note
  const activeNote = useMemo(() => {
    if (!activeCampaign || !activeNoteId) return null;
    return activeCampaign.notes.find((n) => n.id === activeNoteId) || null;
  }, [activeCampaign, activeNoteId]);

  // Handle note selection
  const handleSelectNote = (noteId: string) => {
    const note = activeCampaign?.notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNoteId(noteId);
      setEditTitle(note.title);
      setEditBody(note.body);
      setEditLinks(note.linkedIds);
      setNoteEditMode(false);
    }
  };

  // Handle note creation
  const handleCreateNote = () => {
    if (!activeCampaign) return;
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: 'New Journal Entry',
      body: 'Write journal details here...',
      linkedIds: [],
    };

    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === selectedCampaignId) {
        return {
          ...c,
          notes: [...c.notes, newNote],
        };
      }
      return c;
    });

    setCampaigns(updatedCampaigns);
    setActiveNoteId(newId);
    setEditTitle(newNote.title);
    setEditBody(newNote.body);
    setEditLinks([]);
    setNoteEditMode(true);
  };

  // Handle note save
  const handleSaveNote = () => {
    if (!activeCampaign || !activeNoteId) return;

    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === selectedCampaignId) {
        // Build updated notes list
        const updatedNotes = c.notes.map((n) => {
          if (n.id === activeNoteId) {
            return {
              ...n,
              title: editTitle,
              body: editBody,
              linkedIds: editLinks,
            };
          }
          // Remove activeNoteId from other notes' links if they are not selected anymore
          // or add mutual links if desired. Here we just ensure connections.
          return n;
        });
        return { ...c, notes: updatedNotes };
      }
      return c;
    });

    setCampaigns(updatedCampaigns);
    setNoteEditMode(false);
  };

  // Handle note deletion
  const handleDeleteNote = () => {
    if (!activeCampaign || !activeNoteId) return;

    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === selectedCampaignId) {
        const filteredNotes = c.notes
          .filter((n) => n.id !== activeNoteId)
          .map((n) => ({
            ...n,
            linkedIds: n.linkedIds.filter((id) => id !== activeNoteId),
          }));
        return { ...c, notes: filteredNotes };
      }
      return c;
    });

    setCampaigns(updatedCampaigns);
    setActiveNoteId(null);
  };

  const toggleLinkInEdit = (id: string) => {
    setEditLinks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate coordinates for nodes (Circle Layout with floating animation)
  const nodePositions = useMemo(() => {
    if (!activeCampaign) return {};
    const notesCount = activeCampaign.notes.length;
    const center = { x: width / 2 - 40, y: height / 2 - 120 };
    const radius = Math.min(width, height) * 0.28; // Adjust radius based on screen size
    const positions: Record<string, { x: number; y: number }> = {};

    activeCampaign.notes.forEach((note, index) => {
      const angle = (index * 2 * Math.PI) / (notesCount || 1);
      const baseX = center.x + Math.cos(angle) * radius;
      const baseY = center.y + Math.sin(angle) * radius;

      // Gentle floating drift like in Obsidian
      const phase = index * 1.7; // unique phase offset per node
      const driftX = Math.sin(time + phase) * 15;
      const driftY = Math.cos(time * 0.7 + phase) * 15;

      positions[note.id] = {
        x: baseX + driftX,
        y: baseY + driftY,
      };
    });

    return positions;
  }, [activeCampaign, width, height, time]);

  // Compute connections/lines between nodes
  const graphConnections = useMemo(() => {
    if (!activeCampaign) return [];
    const connections: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const seen = new Set<string>();

    activeCampaign.notes.forEach((note) => {
      note.linkedIds.forEach((linkedId) => {
        const p1 = nodePositions[note.id];
        const p2 = nodePositions[linkedId];
        if (p1 && p2) {
          const key = [note.id, linkedId].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            connections.push({
              id: key,
              x1: p1.x + 35, // Adjusting line position relative to node bounds (center of 70px node)
              y1: p1.y + 35,
              x2: p2.x + 35,
              y2: p2.y + 35,
            });
          }
        }
      });
    });

    return connections;
  }, [activeCampaign, nodePositions]);

  // Derived backlinks
  const backlinks = useMemo(() => {
    if (!activeCampaign || !activeNote) return [];
    return activeCampaign.notes.filter(
      (n) => n.id !== activeNote.id && n.linkedIds.includes(activeNote.id)
    );
  }, [activeCampaign, activeNote]);

  // Campaign creation
  const handleCreateCampaign = () => {
    const newId = Date.now().toString();
    const newCampaign: CampaignGraph = {
      id: newId,
      title: 'New Campaign Journal',
      emoji: '📓',
      desc: 'Customize this campaign and start building your interactive note graph.',
      notes: [
        {
          id: '1',
          title: 'Main Quest Log',
          body: 'Create nodes and establish link networks between quests, factions, and loot.',
          linkedIds: [],
        },
      ],
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    setSelectedCampaignId(newId);
  };

  // Render Campaign Selector
  if (!selectedCampaignId) {
    return (
      <View style={styles.container}>
        <View style={styles.mainHeader}>
          <ThemedText type="subtitle" style={styles.title}>
            📝 Campaign Journals
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }]}
            onPress={handleCreateCampaign}>
            <ThemedText style={styles.createBtnText}>+ New Campaign</ThemedText>
          </Pressable>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Select a D&D Campaign Graph to view and connect your campaign logs:
        </ThemedText>

        <ScrollView contentContainerStyle={styles.campaignList}>
          {campaigns.map((c) => (
            <Pressable
              key={c.id}
              style={({ hovered, pressed }) => [
                styles.campaignCard,
                { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                  hovered && {
                    borderColor: '#dfb15b',
                    shadowColor: '#dfb15b',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                  pressed && { opacity: 0.9 },
              ]}
              onPress={() => setSelectedCampaignId(c.id)}>
              <ThemedText style={styles.campaignEmoji}>{c.emoji}</ThemedText>
              <View style={{ flex: 1, gap: 4 }}>
                <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {c.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 16 }}>
                  {c.desc}
                </ThemedText>
                <View style={styles.campaignMeta}>
                  <ThemedText style={styles.metaBadge}>
                    📝 {c.notes.length} Note{c.notes.length > 1 ? 's' : ''}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Render Full Screen Graph View
  return (
    <View style={styles.fullScreenContainer}>
      {/* Graph Toolbar */}
      <View style={styles.toolbar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
          onPress={() => {
            setSelectedCampaignId(null);
            setActiveNoteId(null);
          }}>
          <ThemedText style={styles.toolbarBtnText}>← Campaigns</ThemedText>
        </Pressable>

        <ThemedText type="smallBold" style={styles.toolbarTitle}>
          {activeCampaign?.emoji} {activeCampaign?.title}
        </ThemedText>

        <Pressable
          style={({ pressed }) => [styles.addNoteBtn, pressed && { opacity: 0.8 }]}
          onPress={handleCreateNote}>
          <ThemedText style={styles.toolbarBtnText}>+ Add Note Node</ThemedText>
        </Pressable>
      </View>

      {/* Full Screen Canvas */}
      <View style={styles.canvasContainer}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.graphInstruction}>
          🔗 Knowledge Graph view. Click any node to read or edit.
        </ThemedText>

        <View style={styles.canvas}>
          {/* Render Lines */}
          {graphConnections.map((conn) => {
            // Render lines using basic absolute components since SVG elements require react-native-svg package.
            const dx = conn.x2 - conn.x1;
            const dy = conn.y2 - conn.y1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            return (
              <View
                key={conn.id}
                style={[
                  styles.canvasConnector,
                  {
                    width: distance,
                    left: conn.x1,
                    top: conn.y1,
                    transform: [
                      { translateX: 0 },
                      { translateY: 0 },
                      { rotate: `${angle}deg` },
                    ],
                  },
                ]}
              />
            );
          })}

          {/* Render Nodes */}
          {activeCampaign?.notes.map((note) => {
            const pos = nodePositions[note.id];
            if (!pos) return null;
            const isNoteActive = note.id === activeNoteId;

            return (
              <Pressable
                key={note.id}
                style={({ hovered, pressed }) => [
                  styles.canvasNode,
                  {
                    left: pos.x,
                    top: pos.y,
                    borderColor: isNoteActive ? '#dfb15b' : theme.backgroundSelected,
                    backgroundColor: isNoteActive ? '#dfb15b' : theme.backgroundElement,
                  },
                   hovered && {
                     borderColor: '#dfb15b',
                     transform: [{ scale: 1.12 }],
                     shadowColor: '#dfb15b',
                     shadowOffset: { width: 0, height: 0 },
                     shadowOpacity: 0.6,
                     shadowRadius: 8,
                     elevation: 5,
                   },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleSelectNote(note.id)}>
                <ThemedText style={[styles.canvasNodeText, isNoteActive && { color: '#fff', fontWeight: 'bold' }]} numberOfLines={2}>
                  {note.title}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Note Reader / Editor Modal Panel */}
      {activeNote && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>
                {noteEditMode ? '📝 Editing Note' : '📖 Reading Note'}
              </ThemedText>
              <View style={styles.modalHeaderActions}>
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleDeleteNote}>
                  <ThemedText style={styles.deleteBtnText}>🗑️ Delete</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => setActiveNoteId(null)}>
                  <ThemedText style={{ color: '#aaa', fontWeight: 'bold' }}>✕</ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalDivider} />

            {/* Read or Edit Body */}
            {noteEditMode ? (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.editorScroll}>
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Note Title</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.03)' }]}
                    value={editTitle}
                    onChangeText={setEditTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Journal Content</ThemedText>
                  <TextInput
                    style={[styles.textarea, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255,255,255,0.03)' }]}
                    multiline
                    numberOfLines={10}
                    value={editBody}
                    onChangeText={setEditBody}
                  />
                </View>

                {/* Connections selection */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Connect Node to</ThemedText>
                  <View style={styles.linkGrid}>
                    {activeCampaign?.notes
                      .filter((n) => n.id !== activeNoteId)
                      .map((n) => {
                        const isLinked = editLinks.includes(n.id);
                        return (
                          <Pressable
                            key={n.id}
                            style={[
                              styles.linkSelectorBadge,
                              { borderColor: theme.backgroundSelected },
                              isLinked && { backgroundColor: '#dfb15b', borderColor: '#dfb15b' },
                            ]}
                            onPress={() => toggleLinkInEdit(n.id)}>
                            <ThemedText style={[styles.linkSelectorBadgeText, isLinked && { color: '#fff' }]}>
                              🔗 {n.title}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleSaveNote}>
                  <ThemedText style={styles.saveBtnText}>💾 Save Entry</ThemedText>
                </Pressable>
              </ScrollView>
            ) : (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.readerScroll}>
                <ThemedText type="subtitle" style={styles.readerTitle}>
                  {activeNote.title}
                </ThemedText>

                <ThemedText style={styles.readerBody}>
                  {activeNote.body}
                </ThemedText>

                <View style={styles.modalDivider} />

                {/* Relational Backlinks */}
                <View style={styles.relationsGroup}>
                  <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>
                    Backlinks (Who references this note)
                  </ThemedText>
                  <View style={styles.relationsList}>
                    {backlinks.map((link) => (
                      <Pressable
                        key={link.id}
                        style={styles.relationItem}
                        onPress={() => handleSelectNote(link.id)}>
                        <ThemedText style={styles.relationLinkText}>← {link.title}</ThemedText>
                      </Pressable>
                    ))}
                    {backlinks.length === 0 && (
                      <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic' }}>
                        No incoming references.
                      </ThemedText>
                    )}
                  </View>
                </View>

                {/* Relational Outgoing Links */}
                <View style={styles.relationsGroup}>
                  <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>
                    Outgoing Connections
                  </ThemedText>
                  <View style={styles.relationsList}>
                    {activeCampaign?.notes
                      .filter((n) => activeNote.linkedIds.includes(n.id))
                      .map((link) => (
                        <Pressable
                          key={link.id}
                          style={styles.relationItem}
                          onPress={() => handleSelectNote(link.id)}>
                          <ThemedText style={styles.relationLinkText}>→ {link.title}</ThemedText>
                        </Pressable>
                      ))}
                    {activeNote.linkedIds.length === 0 && (
                      <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic' }}>
                        No outgoing links.
                      </ThemedText>
                    )}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => setNoteEditMode(true)}>
                  <ThemedText style={styles.editBtnText}>✏️ Edit Entry</ThemedText>
                </Pressable>
              </ScrollView>
            )}
          </ThemedView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.three,
  },
  title: {
    color: '#dfb15b',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.four,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  createBtn: {
    backgroundColor: '#dfb15b',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  campaignList: {
    gap: Spacing.three,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingBottom: Spacing.six,
  },
  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.three,
  },
  campaignEmoji: {
    fontSize: 36,
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
    fontSize: 11,
    color: '#aaa',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  toolbar: {
    height: 56,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  addNoteBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: '#dfb15b',
  },
  toolbarBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolbarTitle: {
    fontSize: 14,
    color: '#fff',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphInstruction: {
    position: 'absolute',
    top: Spacing.three,
    zIndex: 10,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  canvasConnector: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(216, 25, 33, 0.3)',
    transformOrigin: 'left center',
    zIndex: 1,
  },
  canvasNode: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.one,
    zIndex: 5,
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  },
  canvasNodeText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#eee',
    lineHeight: 12,
  },
  modalOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 420,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  deleteBtn: {
    backgroundColor: 'rgba(229,62,62,0.1)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.one,
  },
  deleteBtnText: {
    color: '#e53e3e',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: Spacing.three,
  },
  readerScroll: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  readerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  readerBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#ddd',
  },
  relationsGroup: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  relationsList: {
    gap: Spacing.one,
  },
  relationItem: {
    paddingVertical: Spacing.half,
  },
  relationLinkText: {
    fontSize: 13,
    color: '#34c759',
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#dfb15b',
    height: 40,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  editBtnText: {
    color: '#dfb15b',
    fontWeight: 'bold',
    fontSize: 13,
  },
  editorScroll: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  formGroup: {
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  textarea: {
    height: 150,
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  linkSelectorBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  linkSelectorBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#dfb15b',
    height: 40,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

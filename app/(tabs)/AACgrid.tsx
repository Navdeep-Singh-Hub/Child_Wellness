// app/(tabs)/AACGrid.tsx
import { fetchTiles, TileDto } from '@/app/lib/api';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Languages that need RTL and/or smaller columns
const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);
const DEFAULT_LANG = 'en-US';

function speak(text: string, lang?: string) {
  Speech.stop();
  Speech.speak(text, { language: lang || DEFAULT_LANG, pitch: 1.0, rate: 1.0 });
}

export default function AACGrid() {
  const [query, setQuery] = useState('');
  const [utterance, setUtterance] = useState<string[]>([]);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [tiles, setTiles] = useState<TileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch from backend once
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTiles();
        if (on) setTiles(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tiles');
        // small offline fallback
        if (on) setTiles([{ id: 'go', label: 'go', core: true }]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { on = false; };
  }, []);

  // If most tiles are a non-Latin language, adjust layout (fewer columns for longer labels)
  const dominantLang = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tiles) {
      const code = (t.lang || DEFAULT_LANG).split('-')[0];
      counts[code] = (counts[code] || 0) + 1;
    }
    let best = 'en';
    let max = 0;
    for (const k of Object.keys(counts)) if (counts[k] > max) { best = k; max = counts[k]; }
    return best;
  }, [tiles]);

  const isRTL = RTL_LANGS.has(dominantLang);
  const cols = isRTL ? 3 : 4;            // fewer columns for RTL/longer scripts
  const labelSize = isRTL ? 14 : 16;      // slightly smaller text for RTL scripts
  const minTileHeight = isRTL ? 132 : 116;

  // search + sort (core first, then favorites)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tiles;
    if (q) list = list.filter(t => t.label.toLowerCase().includes(q));
    return list
      .sort((a, b) => Number(!!b.core) - Number(!!a.core))
      .sort((a, b) => Number(!!favs[b.id]) - Number(!!favs[a.id]));
  }, [tiles, query, favs]);

  const onTilePress = (t: TileDto) => {
    Haptics.selectionAsync();
    setUtterance(s => [...s, t.label]);
    speak(t.label, t.lang);
  };
  const onTileLongPress = (t: TileDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFavs(f => ({ ...f, [t.id]: !f[t.id] }));
  };
  const onSpeakSentence = () => {
    if (!utterance.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // speak sentence in dominant language as a fallback
    const lang = dominantLang === 'en' ? 'en-US' : `${dominantLang}-IN`;
    speak(utterance.join(' '), lang);
  };

  return (
    <View className="flex-1 bg-white" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Search */}
      <View className="p-4 flex-row items-center gap-3">
        <TextInput
          placeholder={isRTL ? 'खोजें… / بحث…' : 'Search words…'}
          value={query}
          onChangeText={setQuery}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
        />
      </View>

      {/* Sentence strip */}
      <View className="px-4">
        <View className="min-h-[56px] border border-blue-200 rounded-2xl px-3 py-2 bg-blue-50 flex-row flex-wrap items-center">
          {utterance.length === 0 ? (
            <Text className="text-blue-500">{isRTL ? 'वाक्य बनाएं…' : 'Build a sentence…'}</Text>
          ) : (
            utterance.map((w, i) => (
              <View key={`${w}-${i}`} className="px-2 py-1 bg-white rounded-xl mr-2 mb-2 border border-blue-200">
                <Text className="text-blue-800" style={{ fontSize: labelSize }}>{w}</Text>
              </View>
            ))
          )}
        </View>
        <View className="flex-row gap-3 mt-2">
          <TouchableOpacity onPress={onSpeakSentence} className="px-4 py-2 bg-blue-600 rounded-xl">
            <Text className="text-white font-semibold">{isRTL ? 'बोलो' : 'Speak'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUtterance([])} className="px-4 py-2 bg-gray-200 rounded-xl">
            <Text>{isRTL ? 'साफ़' : 'Clear'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text className="px-4 mt-2 text-red-600">{error}</Text> : null}
      {loading ? <Text className="px-4 mt-2 text-gray-500">Loading…</Text> : null}

      {/* Grid from backend (imageUri) */}
      <FlatList
        className="mt-4 px-4"
        data={filtered}
        key={`grid-${cols}-${isRTL}`}   // force reflow on language change
        numColumns={cols}
        keyExtractor={(t) => t.id}
        columnWrapperStyle={{ gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onTilePress(item)}
            onLongPress={() => onTileLongPress(item)}
            accessibilityLabel={item.label}
            className="flex-1 items-center justify-center rounded-3xl p-3"
            style={{
              minHeight: minTileHeight,
              backgroundColor: '#F3F4F6',
              borderWidth: favs[item.id] ? 2 : 1,
              borderColor: favs[item.id] ? '#F59E0B' : '#E5E7EB',
            }}
          >
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: 56, height: 56, marginBottom: 6 }}
                resizeMode="contain"
              />
            ) : null}
            <Text
              className="text-gray-900 font-semibold"
              style={{ fontSize: labelSize, textAlign: 'center' }}
              numberOfLines={2}
            >
              {item.label}
            </Text>
            {favs[item.id] ? <Text className="text-amber-600 text-xs mt-1">★</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

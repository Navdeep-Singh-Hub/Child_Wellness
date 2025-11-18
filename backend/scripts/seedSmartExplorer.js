import 'dotenv/config';
import mongoose from 'mongoose';
import { SmartItem } from '../models/SmartItem.js';
import { SmartPrompt } from '../models/SmartPrompt.js';
import { SmartScene } from '../models/SmartScene.js';

const MONGODB_URI = process.env.MONGODB_URI;

const sceneSeed = {
  slug: 'farm',
  title: 'Farm',
  imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=1600&q=80',
  meta: {
    theme: 'animals',
    ageMin: 3,
    ageMax: 8,
    langTags: ['en', 'hi', 'pa'],
  },
};

const itemSeeds = [
  {
    label: 'Parrot',
    altLabels: ['bird', 'parrot'],
    bbox: { x: 0.62, y: 0.12, w: 0.1, h: 0.18 },
    tags: ['animal', 'can_fly'],
    tts: {
      en: 'Parrot',
      hi: 'तोता',
      pa: 'ਤੋਤਾ',
    },
  },
  {
    label: 'Tractor',
    altLabels: ['farm truck'],
    bbox: { x: 0.26, y: 0.55, w: 0.22, h: 0.22 },
    tags: ['vehicle', 'farm'],
    tts: {
      en: 'Tractor',
      hi: 'ट्रैक्टर',
      pa: 'ਟ੍ਰੈਕਟਰ',
    },
  },
  {
    label: 'Barn',
    altLabels: ['shed'],
    bbox: { x: 0.05, y: 0.25, w: 0.24, h: 0.32 },
    tags: ['building'],
    tts: {
      en: 'Barn',
      hi: 'गोदाम',
      pa: 'ਖਲਿਹਾਨ',
    },
  },
];

const promptSeeds = [
  {
    type: 'find',
    difficulty: 'tierA',
    payload: {
      targetItemIds: [], // fill after items inserted
    },
    tts: {
      prompt: {
        en: 'Can you find the parrot?',
        hi: 'क्या तुम तोता ढूंढ सकते हो?',
        pa: 'ਕੀ ਤੁਸੀਂ ਤੋਤਾ ਲੱਭ ਸਕਦੇ ਹੋ?',
      },
      clue: {
        en: 'Look for bright green feathers.',
        hi: 'चमकीले हरे पंख देखें।',
        pa: 'ਚਮਕੀਲੇ ਹਰੇ ਪੰਖ ਵੇਖੋ।',
      },
      correct: {
        en: 'Great! You found the parrot.',
        hi: 'बहुत बढ़िया! तुमने तोता ढूंढ लिया।',
        pa: 'ਸ਼ਾਬਾਸ਼! ਤੁਸੀਂ ਤੋਤਾ ਲੱਭ ਲਿਆ।',
      },
      retry: {
        en: 'Try again. The parrot can fly.',
        hi: 'फिर से कोशिश करो। तोता उड़ सकता है।',
        pa: 'ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ। ਤੋਤਾ ਉੱਡ ਸਕਦਾ ਹੈ।',
      },
    },
  },
  {
    type: 'category',
    difficulty: 'tierB',
    payload: {
      category: 'vehicle',
      targetItemIds: [],
    },
    tts: {
      prompt: {
        en: 'Tap something that helps on the farm.',
        hi: 'ऐसा कुछ टैप करो जो खेत में मदद करे।',
        pa: 'ਕੁਝ ਐਦਾਂ ਤੱਪ ਕਰੋ ਜੋ ਖੇਤ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
      },
      clue: {
        en: 'It has big wheels.',
        hi: 'इसके बड़े पहिये हैं।',
        pa: 'ਇਸ ਦੇ ਵੱਡੇ ਪਹੀਏ ਹਨ।',
      },
      correct: {
        en: 'Yes! The tractor helps on the farm.',
        hi: 'हाँ! ट्रैक्टर खेत में मदद करता है।',
        pa: 'ਹਾਂ! ਟ੍ਰੈਕਟਰ ਖੇਤ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
      },
      retry: {
        en: 'Look for something that farmers drive.',
        hi: 'कुछ ऐसा देखो जो किसान चलाते हैं।',
        pa: 'ਕੁਝ ਐਦਾਂ ਵੇਖੋ ਜੋ ਕਿਸਾਨ ਚਲਾਉਂਦੇ ਹਨ।',
      },
    },
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const scene = await SmartScene.findOneAndUpdate(
    { slug: sceneSeed.slug },
    { $set: sceneSeed },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const itemIdMap = new Map();
  for (const item of itemSeeds) {
    const doc = await SmartItem.findOneAndUpdate(
      { sceneId: scene._id, label: item.label },
      { $set: { ...item, sceneId: scene._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    itemIdMap.set(item.label, doc._id);
  }

  const promptsToSeed = promptSeeds.map((prompt) => {
    const payload = { ...(prompt.payload || {}) };
    if (payload.targetItemIds && payload.targetItemIds.length === 0) {
      if (prompt.type === 'find') {
        payload.targetItemIds = [itemIdMap.get('Parrot')];
      } else if (prompt.type === 'category') {
        payload.targetItemIds = [itemIdMap.get('Tractor')];
      }
    }
    return {
      ...prompt,
      payload,
    };
  });

  for (const prompt of promptsToSeed) {
    await SmartPrompt.findOneAndUpdate(
      {
        sceneId: scene._id,
        'tts.prompt.en': prompt.tts.prompt.en,
      },
      {
        $set: {
          sceneId: scene._id,
          type: prompt.type,
          difficulty: prompt.difficulty,
          payload: prompt.payload,
          tts: prompt.tts,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log('DB name:', mongoose.connection.db.databaseName);
  console.log('Collections:', (await mongoose.connection.db.listCollections().toArray()).map(c => c.name));  
  console.log('Smart Explorer seed complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


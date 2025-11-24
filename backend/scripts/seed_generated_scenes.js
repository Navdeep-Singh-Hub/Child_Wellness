import 'dotenv/config';
import mongoose from 'mongoose';
import { SmartItem } from '../models/SmartItem.js';
import { SmartPrompt } from '../models/SmartPrompt.js';
import { SmartScene } from '../models/SmartScene.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';
const BASE_URL = 'http://localhost:4000/static/uploads';

const scenes = [
    {
        slug: 'park',
        title: 'Playground Park',
        imageUrl: `${BASE_URL}/smart_explorer_park.png`,
        meta: {
            theme: 'outdoors',
            ageMin: 3,
            ageMax: 8,
            langTags: ['en'],
        },
        items: [
            {
                label: 'Slide',
                altLabels: ['red slide'],
                bbox: { x: 0.1, y: 0.4, w: 0.2, h: 0.4 },
                tags: ['play', 'equipment'],
                tts: { en: 'Slide' },
            },
            {
                label: 'Swing Set',
                altLabels: ['swings'],
                bbox: { x: 0.7, y: 0.4, w: 0.25, h: 0.4 },
                tags: ['play', 'equipment'],
                tts: { en: 'Swing Set' },
            },
            {
                label: 'Tree',
                altLabels: ['big tree'],
                bbox: { x: 0.4, y: 0.1, w: 0.3, h: 0.4 },
                tags: ['nature', 'plant'],
                tts: { en: 'Tree' },
            },
            {
                label: 'Sun',
                altLabels: ['sunshine'],
                bbox: { x: 0.1, y: 0.05, w: 0.15, h: 0.15 },
                tags: ['nature', 'sky'],
                tts: { en: 'Sun' },
            },
            {
                label: 'Bench',
                altLabels: ['seat'],
                bbox: { x: 0.4, y: 0.7, w: 0.2, h: 0.15 },
                tags: ['furniture', 'wood'],
                tts: { en: 'Bench' },
            },
            {
                label: 'Soccer Ball',
                altLabels: ['ball', 'football'],
                bbox: { x: 0.2, y: 0.8, w: 0.08, h: 0.08 },
                tags: ['toy', 'sport'],
                tts: { en: 'Soccer Ball' },
            },
        ],
        prompts: [
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Slide',
                tts: {
                    prompt: { en: 'Can you find the red slide?' },
                    clue: { en: 'It is red and you slide down it.' },
                    correct: { en: 'Yay! You found the slide.' },
                    retry: { en: 'Look for something red on the left.' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Soccer Ball',
                tts: {
                    prompt: { en: 'Where is the soccer ball?' },
                    clue: { en: 'It is on the grass.' },
                    correct: { en: 'Goal! You found the ball.' },
                    retry: { en: 'Look on the green grass.' },
                },
            },
            {
                type: 'function',
                difficulty: 'tierB',
                targetLabel: 'Bench',
                tts: {
                    prompt: { en: 'Find something you can sit on.' },
                    clue: { en: 'It is made of wood.' },
                    correct: { en: 'Correct! You can sit on the bench.' },
                    retry: { en: 'Look for the wooden seat.' },
                },
            },
            {
                type: 'category',
                difficulty: 'tierB',
                targetLabel: 'Tree',
                tts: {
                    prompt: { en: 'Find something that grows in nature.' },
                    clue: { en: 'It has green leaves.' },
                    correct: { en: 'Yes! The tree grows in nature.' },
                    retry: { en: 'Look for the big green tree.' },
                },
            },
        ],
    },
    {
        slug: 'kitchen',
        title: 'Cozy Kitchen',
        imageUrl: `${BASE_URL}/smart_explorer_kitchen.png`,
        meta: {
            theme: 'home',
            ageMin: 3,
            ageMax: 8,
            langTags: ['en'],
        },
        items: [
            {
                label: 'Refrigerator',
                altLabels: ['fridge'],
                bbox: { x: 0.1, y: 0.2, w: 0.2, h: 0.6 },
                tags: ['appliance', 'cold'],
                tts: { en: 'Refrigerator' },
            },
            {
                label: 'Stove',
                altLabels: ['oven'],
                bbox: { x: 0.35, y: 0.4, w: 0.2, h: 0.4 },
                tags: ['appliance', 'hot'],
                tts: { en: 'Stove' },
            },
            {
                label: 'Table',
                altLabels: ['dining table'],
                bbox: { x: 0.6, y: 0.5, w: 0.3, h: 0.3 },
                tags: ['furniture'],
                tts: { en: 'Table' },
            },
            {
                label: 'Fruit Bowl',
                altLabels: ['apples', 'bananas'],
                bbox: { x: 0.7, y: 0.55, w: 0.1, h: 0.1 },
                tags: ['food'],
                tts: { en: 'Fruit Bowl' },
            },
            {
                label: 'Clock',
                altLabels: ['wall clock'],
                bbox: { x: 0.5, y: 0.1, w: 0.1, h: 0.1 },
                tags: ['time'],
                tts: { en: 'Clock' },
            },
        ],
        prompts: [
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Refrigerator',
                tts: {
                    prompt: { en: 'Where is the fridge?' },
                    clue: { en: 'It keeps food cold.' },
                    correct: { en: 'Good job! That is the fridge.' },
                    retry: { en: 'Look for the tall white box.' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Fruit Bowl',
                tts: {
                    prompt: { en: 'Can you find the fruit?' },
                    clue: { en: 'Apples and bananas are fruit.' },
                    correct: { en: 'Yum! You found the fruit.' },
                    retry: { en: 'Look on the table.' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierB',
                targetLabel: 'Clock',
                tts: {
                    prompt: { en: 'What tells the time?' },
                    clue: { en: 'It is on the wall.' },
                    correct: { en: 'Tick tock! You found the clock.' },
                    retry: { en: 'Look up high on the wall.' },
                },
            },
            {
                type: 'function',
                difficulty: 'tierB',
                targetLabel: 'Stove',
                tts: {
                    prompt: { en: 'Find something used for cooking.' },
                    clue: { en: 'It gets hot.' },
                    correct: { en: 'Yes, we cook on the stove.' },
                    retry: { en: 'Look next to the fridge.' },
                },
            },
        ],
    },
    {
        slug: 'bedroom',
        title: 'My Bedroom',
        imageUrl: `${BASE_URL}/smart_explorer_bedroom.png`,
        meta: {
            theme: 'home',
            ageMin: 3,
            ageMax: 8,
            langTags: ['en'],
        },
        items: [
            {
                label: 'Bed',
                altLabels: ['sleeping place'],
                bbox: { x: 0.1, y: 0.4, w: 0.4, h: 0.4 },
                tags: ['furniture', 'sleep'],
                tts: { en: 'Bed' },
            },
            {
                label: 'Lamp',
                altLabels: ['light'],
                bbox: { x: 0.05, y: 0.3, w: 0.1, h: 0.15 },
                tags: ['furniture', 'light'],
                tts: { en: 'Lamp' },
            },
            {
                label: 'Bookshelf',
                altLabels: ['books'],
                bbox: { x: 0.6, y: 0.2, w: 0.2, h: 0.5 },
                tags: ['furniture', 'reading'],
                tts: { en: 'Bookshelf' },
            },
            {
                label: 'Toy Chest',
                altLabels: ['toys'],
                bbox: { x: 0.6, y: 0.75, w: 0.2, h: 0.15 },
                tags: ['furniture', 'play'],
                tts: { en: 'Toy Chest' },
            },
            {
                label: 'Teddy Bear',
                altLabels: ['bear'],
                bbox: { x: 0.4, y: 0.7, w: 0.1, h: 0.15 },
                tags: ['toy'],
                tts: { en: 'Teddy Bear' },
            },
        ],
        prompts: [
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Bed',
                tts: {
                    prompt: { en: 'Where do you sleep?' },
                    clue: { en: 'It has soft pillows.' },
                    correct: { en: 'Good night! You found the bed.' },
                    retry: { en: 'Look for the big comfy bed.' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Teddy Bear',
                tts: {
                    prompt: { en: 'Find the teddy bear.' },
                    clue: { en: 'It is sitting on the floor.' },
                    correct: { en: 'You found the bear!' },
                    retry: { en: 'Look near the bed.' },
                },
            },
            {
                type: 'category',
                difficulty: 'tierB',
                targetLabel: 'Bookshelf',
                tts: {
                    prompt: { en: 'Find something to read.' },
                    clue: { en: 'Books are on the shelf.' },
                    correct: { en: 'Yes! Reading is fun.' },
                    retry: { en: 'Look for the tall shelf.' },
                },
            },
            {
                type: 'function',
                difficulty: 'tierB',
                targetLabel: 'Lamp',
                tts: {
                    prompt: { en: 'Find something that gives light.' },
                    clue: { en: 'It is on the nightstand.' },
                    correct: { en: 'Bright idea! You found the lamp.' },
                    retry: { en: 'Look next to the bed.' },
                },
            },
        ],
    },
    {
        slug: 'farm',
        title: 'Sunny Farm',
        imageUrl: `${BASE_URL}/smart_explorer_farm.png`,
        meta: {
            theme: 'animals',
            ageMin: 3,
            ageMax: 8,
            langTags: ['en', 'hi', 'pa'],
        },
        items: [
            {
                label: 'Barn',
                altLabels: ['red barn'],
                bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
                tags: ['building', 'farm'],
                tts: { en: 'Barn', hi: 'खलिहान', pa: 'ਖਲਿਹਾਨ' },
            },
            {
                label: 'Tractor',
                altLabels: ['green tractor'],
                bbox: { x: 0.5, y: 0.4, w: 0.25, h: 0.3 },
                tags: ['vehicle', 'farm'],
                tts: { en: 'Tractor', hi: 'ट्रैक्टर', pa: 'ਟ੍ਰੈਕਟਰ' },
            },
            {
                label: 'Duck',
                altLabels: ['white duck'],
                bbox: { x: 0.8, y: 0.7, w: 0.1, h: 0.1 },
                tags: ['animal', 'bird'],
                tts: { en: 'Duck', hi: 'बत्तख', pa: 'ਬਤਖ' },
            },
            {
                label: 'Cow',
                altLabels: ['grazing cow'],
                bbox: { x: 0.1, y: 0.7, w: 0.2, h: 0.2 },
                tags: ['animal', 'mammal'],
                tts: { en: 'Cow', hi: 'गाय', pa: 'ਗਾਂ' },
            },
            {
                label: 'Fence',
                altLabels: ['wooden fence'],
                bbox: { x: 0.0, y: 0.6, w: 1.0, h: 0.1 },
                tags: ['structure'],
                tts: { en: 'Fence', hi: 'बाड़', pa: 'ਵਾੜ' },
            },
        ],
        prompts: [
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Barn',
                tts: {
                    prompt: { en: 'Where is the big red barn?', hi: 'बड़ा लाल खलिहान कहाँ है?', pa: 'ਵੱਡਾ ਲਾਲ ਖਲਿਹਾਨ ਕਿੱਥੇ ਹੈ?' },
                    clue: { en: 'It is red and has big doors.', hi: 'यह लाल है और इसके बड़े दरवाजे हैं।', pa: 'ਇਹ ਲਾਲ ਹੈ ਅਤੇ ਇਸਦੇ ਵੱਡੇ ਦਰਵਾਜ਼ੇ ਹਨ।' },
                    correct: { en: 'You found the barn!', hi: 'तुमने खलिहान ढूँढ लिया!', pa: 'ਤੁਸੀਂ ਖਲਿਹਾਨ ਲੱਭ ਲਿਆ!' },
                    retry: { en: 'Look for the red building.', hi: 'लाल इमारत देखो।', pa: 'ਲਾਲ ਇਮਾਰਤ ਵੇਖੋ।' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierA',
                targetLabel: 'Cow',
                tts: {
                    prompt: { en: 'Can you find the cow?', hi: 'क्या तुम गाय ढूँढ सकते हो?', pa: 'ਕੀ ਤੁਸੀਂ ਗਾਂ ਲੱਭ ਸਕਦੇ ਹੋ?' },
                    clue: { en: 'It says Moo.', hi: 'यह रंभाती है।', pa: 'ਇਹ ਰੰਭਦੀ ਹੈ।' },
                    correct: { en: 'Moo! You found the cow.', hi: 'बहुत बढ़िया! तुमने गाय ढूँढ ली।', pa: 'ਸ਼ਾਬਾਸ਼! ਤੁਸੀਂ ਗਾਂ ਲੱਭ ਲਈ।' },
                    retry: { en: 'Look on the grass.', hi: 'घास पर देखो।', pa: 'ਘਾਹ ਤੇ ਵੇਖੋ।' },
                },
            },
            {
                type: 'category',
                difficulty: 'tierB',
                targetLabel: 'Tractor',
                tts: {
                    prompt: { en: 'Find something the farmer drives.', hi: 'कुछ ऐसा ढूँढो जो किसान चलाता है।', pa: 'ਕੁਝ ਅਜਿਹਾ ਲੱਭੋ ਜੋ ਕਿਸਾਨ ਚਲਾਉਂਦਾ ਹੈ।' },
                    clue: { en: 'It has big wheels.', hi: 'इसके बड़े पहिये हैं।', pa: 'ਇਸਦੇ ਵੱਡੇ ਪਹੀਏ ਹਨ।' },
                    correct: { en: 'Yes! The tractor helps on the farm.', hi: 'हाँ! ट्रैक्टर खेत में मदद करता है।', pa: 'ਹਾਂ! ਟ੍ਰੈਕਟਰ ਖੇਤ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।' },
                    retry: { en: 'Look for the green vehicle.', hi: 'हरा वाहन देखो।', pa: 'ਹਰਾ ਵਾਹਨ ਵੇਖੋ।' },
                },
            },
            {
                type: 'find',
                difficulty: 'tierB',
                targetLabel: 'Duck',
                tts: {
                    prompt: { en: 'Where is the duck?', hi: 'बत्तख कहाँ है?', pa: 'ਬਤਖ ਕਿੱਥੇ ਹੈ?' },
                    clue: { en: 'It is swimming in the water.', hi: 'यह पानी में तैर रही है।', pa: 'ਇਹ ਪਾਣੀ ਵਿੱਚ ਤੈਰ ਰਹੀ ਹੈ।' },
                    correct: { en: 'Quack quack! You found it.', hi: 'क्वाक क्वाक! तुमने इसे ढूँढ लिया।', pa: 'ਕਵੈਕ ਕਵੈਕ! ਤੁਸੀਂ ਇਸਨੂੰ ਲੱਭ ਲਿਆ।' },
                    retry: { en: 'Look in the pond.', hi: 'तालाब में देखो।', pa: 'ਤਲਾਬ ਵਿੱਚ ਵੇਖੋ।' },
                },
            },
        ],
    },
];

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const sceneData of scenes) {
        console.log(`Seeding scene: ${sceneData.title}`);

        // 1. Create/Update Scene
        const scene = await SmartScene.findOneAndUpdate(
            { slug: sceneData.slug },
            {
                $set: {
                    title: sceneData.title,
                    imageUrl: sceneData.imageUrl,
                    meta: sceneData.meta,
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        // 2. Create/Update Items
        const itemIdMap = new Map();
        for (const item of sceneData.items) {
            const doc = await SmartItem.findOneAndUpdate(
                { sceneId: scene._id, label: item.label },
                {
                    $set: {
                        ...item,
                        sceneId: scene._id
                    }
                },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
            itemIdMap.set(item.label, doc._id);
        }

        // 3. Create/Update Prompts
        for (const prompt of sceneData.prompts) {
            const targetId = itemIdMap.get(prompt.targetLabel);
            if (!targetId) {
                console.warn(`Target item not found for prompt: ${prompt.targetLabel}`);
                continue;
            }

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
                        payload: { targetItemIds: [targetId] },
                        tts: prompt.tts,
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
        }
    }

    console.log('Seed complete.');
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

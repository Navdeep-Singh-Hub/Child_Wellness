import mongoose, { Schema } from 'mongoose';

const TileSchema = new Schema({ label: String, lang: String, imageUrl: String, tags: [String] });
const BoardSchema = new Schema({ name: String, tileIds: [String] });
const LessonSchema = new Schema({ type: String, config: Schema.Types.Mixed, boardId: String, version: Number });

export const Tile = mongoose.models.Tile || mongoose.model('Tile', TileSchema);
export const Board = mongoose.models.Board || mongoose.model('Board', BoardSchema);
export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);



import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const dataRoomDocumentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    storageKey: { type: String, required: true },
    contentType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    watermarked: { type: Boolean, default: false },
    accessLog: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          accessedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const dataRoomSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, unique: true },
    documents: { type: [dataRoomDocumentSchema], default: [] },
  },
  { timestamps: true },
);

export type DataRoomRecord = HydratedDocument<InferSchemaType<typeof dataRoomSchema>>;

export const DataRoomModel = model("DataRoom", dataRoomSchema);

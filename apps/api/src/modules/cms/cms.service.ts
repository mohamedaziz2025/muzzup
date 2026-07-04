import { CmsContentModel, type CmsLocale } from "../../models/cms-content.model.js";

export const cmsService = {
  /** Public read: returns only the keys that exist in DB — frontend supplies hardcoded fallbacks. */
  async getPublic(locale: CmsLocale, keys: string[] | undefined) {
    const filter: Record<string, unknown> = { locale };
    if (keys && keys.length > 0) filter.key = { $in: keys };

    const docs = await CmsContentModel.find(filter).select("key value").exec();
    return Object.fromEntries(docs.map((doc) => [doc.key, doc.value]));
  },

  async listAdmin(locale: CmsLocale | undefined) {
    const filter: Record<string, unknown> = {};
    if (locale) filter.locale = locale;
    return CmsContentModel.find(filter).sort({ key: 1, locale: 1 }).exec();
  },

  async upsert(key: string, locale: CmsLocale, value: string, actorId: string) {
    return CmsContentModel.findOneAndUpdate(
      { key, locale },
      { $set: { value, updatedBy: actorId } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  },
};

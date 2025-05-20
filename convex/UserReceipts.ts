import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upload = mutation({
  args: { base64: v.string(), owner: v.string(), company: v.string(), txHash: v.string(), rawHash: v.string() },
  handler: async (ctx, args) => {
    const existingReceipt = await ctx.db.query("UserReceipts").withIndex("by_hash", (q) => q.eq("rawHash", args.txHash)).first();

    if (existingReceipt) {
      throw new Error("Receipt already exists!");
    }

    const id = await ctx.db.insert("UserReceipts", {
      imageUrl: `data:image/png;base64,${args.base64}`,
      owner: args.owner,
      company: args.company,
      rawHash: args.rawHash,
      txHash: args.txHash,
      timestamp: Date.now(),
    });

    return id;
  },
});

export const getByUser = query({
  args: { owner: v.string() },
  handler: async (ctx, { owner }) => {

    const results = await ctx.db
      .query("UserReceipts")
      .withIndex("by_owner", (q) => q.eq("owner", owner))
      .order("desc")
      .collect();

    return results;
  },
});

export const getByHash = query({
  args: { rawHash: v.string() },
  handler: async (ctx, { rawHash }) => {
    const result = await ctx.db
      .query("UserReceipts")
      .withIndex("by_hash", (q) => q.eq("rawHash", rawHash))
      .first();

    return result;
  },
});
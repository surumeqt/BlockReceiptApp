import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upload = mutation({
  args: { base64: v.string(), owner: v.string(), company: v.string(), txHash: v.string() },
  handler: async (ctx, args) => {
    const existingReceipt = await ctx.db.query("UserReceipts").withIndex("by_hash", (q) => q.eq("txHash", args.txHash)).first();

    if (existingReceipt) {
      throw new Error("Receipt already exists!");
    }

    const id = await ctx.db.insert("UserReceipts", {
      imageUrl: `data:image/png;base64,${args.base64}`,
      owner: args.owner,
      company: args.company,
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
  args: { txHash: v.string() },
  handler: async (ctx, { txHash }) => {
    const result = await ctx.db
      .query("UserReceipts")
      .withIndex("by_hash", (q) => q.eq("txHash", txHash))
      .first();

    return result;
  },
});
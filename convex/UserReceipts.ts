import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upload = mutation({
  args: { base64: v.string(), owner: v.string(), company: v.string(), txHash: v.string(), OrNumber: v.string(), amount: v.number(), category: v.string() },
  handler: async (ctx, args) => {
    const existingReceipt = await ctx.db.query("UserReceipts").withIndex("by_userOr", (q) => q.eq("OrNumber", args.txHash)).first();

    if (existingReceipt) {
      throw new Error("Receipt already exists!");
    }

    const id = await ctx.db.insert("UserReceipts", {
      imageUrl: `data:image/png;base64,${args.base64}`,
      owner: args.owner,
      company: args.company,
      OrNumber: args.OrNumber,
      txHash: args.txHash,
      timestamp: Date.now(),
      amount: args.amount,
      category: args.category
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

export const getByOrNumber = query({
  args: { ORnumber: v.string() },
  handler: async (ctx, { ORnumber }) => {
    const result = await ctx.db
      .query("UserReceipts")
      .withIndex("by_userOr", (q) => q.eq("OrNumber", ORnumber))
      .first();

    return result;
  },
});

export const getAnalytics = query({
  args: { owner: v.string() },
  handler: async (ctx, { owner }) => {
    const receipts = await ctx.db
      .query("UserReceipts")
      .withIndex("by_owner", (q) => q.eq("owner", owner))
      .collect();

    const totalReceipts = receipts.length;
    const totalSpent = receipts.reduce((sum, r) => sum + r.amount, 0);
    const averageAmount = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

    const countBy = (key: keyof typeof receipts[0]) =>
      receipts.reduce((map, r) => {
        const val = r[key];
        map[val] = (map[val] || 0) + 1;
        return map;
      }, {} as Record<string, number>);

    const mostCommon = (map: Record<string, number>) =>
      Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const commonCategory = mostCommon(countBy("category"));
    const commonMerchant = mostCommon(countBy("company"));

    return {
      totalReceipts,
      totalSpent,
      averageAmount,
      mostCommonCategory: commonCategory,
      mostCommonMerchant: commonMerchant
    };
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByReceiptId = query({
  args: { receiptId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("CompanyReceipts")
      .withIndex("by_ORnumber", (q) => q.eq("ORnumber", args.receiptId))
      .order("desc")
      .first();
  },
});

export const saveReceipt = mutation({
  args: {
    receiptUrl: v.string(),
    company: v.string(),
    TIN: v.string(),
    ORnumber: v.string(),
    companyAddress: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('CompanyReceipts', {
      receiptUrl: args.receiptUrl,
      company: args.company,
      TIN: args.TIN,
      ORnumber: args.ORnumber,
      companyAddress: args.companyAddress,
      date: args.date,
    });
  },
});
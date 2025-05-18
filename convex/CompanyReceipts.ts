import { query } from "./_generated/server";
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
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

export const getUniqueReceiptDatesByUser = query({
  args: { owner: v.string() },
  handler: async (ctx, { owner }) => {
    const receipts = await ctx.db
      .query("UserReceipts")
      .withIndex("by_owner", (q) => q.eq("owner", owner))
      .collect();

    const uniqueDatesSet = new Set<string>();
    receipts.forEach(receipt => {
      const date = new Date(receipt.timestamp);

      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      uniqueDatesSet.add(formattedDate);
      console.log(`[getUniqueReceiptDatesByUser] Receipt ID: ${receipt._id}, Timestamp: ${receipt.timestamp}, Formatted Date (UTC): ${formattedDate}`);
    });

    const uniqueDatesArray = Array.from(uniqueDatesSet).sort().reverse();
    console.log("[getUniqueReceiptDatesByUser] Returning unique dates (UTC):", uniqueDatesArray);
    return uniqueDatesArray;
  },
});

export const getByUserAndSingleDay = query({
  args: {
    owner: v.string(),
    selectedDate: v.string(), // e.g., "YYYY-MM-DD"
  },
  handler: async (ctx, { owner, selectedDate }) => {
    const dateParts = selectedDate.split('-').map(Number);
    const year = dateParts[0];
    const month = dateParts[1] - 1; // Month is 0-indexed
    const day = dateParts[2];

    // ***** THIS IS ALSO CRITICAL *****
    // Create Date objects representing the start and end of the day in UTC
    const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    // **********************************

    const startOfDayMs = startOfDayUTC.getTime();
    const endOfDayMs = endOfDayUTC.getTime();

    console.log(`[getByUserAndSingleDay] Filtering for selectedDate (UTC): ${selectedDate}`);
    console.log(`[getByUserAndSingleDay] Calculated Start MS (UTC): ${startOfDayMs} (${startOfDayUTC.toISOString()})`);
    console.log(`[getByUserAndSingleDay] Calculated End MS (UTC): ${endOfDayMs} (${endOfDayUTC.toISOString()})`);

    const receipts = await ctx.db
      .query('UserReceipts')
      .withIndex('by_owner_and_timestamp', (q) =>
        q
          .eq('owner', owner)
          .gte('timestamp', startOfDayMs)
          .lte('timestamp', endOfDayMs)
      )
      .collect();

    console.log(`[getByUserAndSingleDay] Found ${receipts.length} receipts for ${selectedDate} between ${startOfDayMs} and ${endOfDayMs}`);
    return receipts;
  },
});
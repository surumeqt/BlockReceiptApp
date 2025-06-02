import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from './_generated/dataModel';

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
    clientName: v.string(),
    clientAddress: v.optional(v.string()),
    serviceType: v.string(),
    serviceName: v.string(),
    serviceDetails: v.optional(v.string()),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('CompanyReceipts', {
      receiptUrl: args.receiptUrl,
      company: args.company,
      TIN: args.TIN,
      ORnumber: args.ORnumber,
      companyAddress: args.companyAddress,
      date: args.date,
      clientName: args.clientName,
      clientAddress: args.clientAddress,
      serviceName: args.serviceName,
      serviceDetails: args.serviceDetails,
      serviceType: args.serviceType,
      price: args.price,
    });
  },
});

export const listReceipts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("CompanyReceipts").collect();
  },
});

export const listReceiptsByDateRange = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allReceipts = await ctx.db.query("CompanyReceipts").collect();

    let filteredReceipts: Doc<"CompanyReceipts">[] = allReceipts;

    const filterStartDate = args.startDate ? new Date(args.startDate) : null;
    const filterEndDate = args.endDate ? new Date(args.endDate) : null;
    if (filterEndDate) {
      filterEndDate.setHours(23, 59, 59, 999);
    }

    if (filterStartDate || filterEndDate) {
      filteredReceipts = allReceipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);

        const isAfterStartDate = filterStartDate ? receiptDate >= filterStartDate : true;
        const isBeforeEndDate = filterEndDate ? receiptDate <= filterEndDate : true;

        return isAfterStartDate && isBeforeEndDate;
      });
    }

    return filteredReceipts;
  },
});
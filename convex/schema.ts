import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        username: v.string(),
        image: v.string(),
        clerkId: v.string(),
    })
    .index("by_clerk_id", ["clerkId"]),

    UserReceipts: defineTable({
        imageUrl: v.string(),
        owner: v.string(),
        company: v.string(),
        OrNumber: v.string(),
        txHash: v.string(),
        timestamp: v.number(),
        amount: v.number(),
        category: v.string(),
      })
      .index("by_owner", ["owner"])
      .index("by_userOr", ["OrNumber"])
      .index("by_owner_and_timestamp", ["owner", "timestamp"]),

    CompanyReceipts: defineTable({
      receiptUrl: v.string(),
      company: v.string(),
      TIN: v.string(),
      ORnumber: v.string(),
      companyAddress: v.string(),
      date: v.string(),
      clientName: v.string(),
      clientAddress: v.optional(v.string()),
      serviceName: v.string(),
      serviceType: v.string(),
      serviceDetails: v.optional(v.string()),
      price: v.number(),
    }).index("by_ORnumber", ["ORnumber"]),
});
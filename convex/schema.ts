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
        timestamp: v.float64(),
        amount: v.number(),
        category: v.string(),
      })
      .index("by_owner", ["owner"])
      .index("by_userOr", ["OrNumber"]),

    CompanyReceipts: defineTable({
        receiptUrl: v.string(),
        company: v.string(),
        TIN: v.string(),
        ORnumber: v.string(),
        companyAddress: v.string(),
        date: v.string(),
        amount: v.number(),
        category: v.string(),
      }).index("by_ORnumber", ["ORnumber"]),
});
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args:{
        email: v.string(),
        username: v.string(),
        image: v.string(),
        clerkId: v.string(),
    },

    handler: async(ctx, args) => {

        const existingUser = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        
        if (existingUser){
            console.log("User already exists in Convex. Skipping creation.");
            return new Response("User already exists", { status: 200 });
        }

        await ctx.db.insert("users", {
            email: args.email,
            username: args.username,
            image: args.image,
            clerkId: args.clerkId,
        })

    }
});
import { z } from "zod";

/** 0x-prefixed 20-byte address as the Go API emits it (any case). */
const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Expected a 20-byte hex address");

export const tokenHistorySchema = z.object({
  TokenHistory: z.array(
    z.object({
      RecordType: z.number(),
      Record: z
        .object({
          BlockNum: z.number().optional(),
          TimeStamp: z.number(),
          DateTime: z.string(),
          OwnerAddr: z.string().optional(),
          SellerAddr: z.string().optional(),
          BuyerAddr: z.string().optional(),
          Price: z.number().optional(),
          OfferId: z.number().optional()
        })
        .passthrough()
    })
  )
});

export const tokenInfoSchema = z.object({
  TokenInfo: z.object({
    TokenId: z.number().int().nonnegative(),
    CurOwnerAddr: addressSchema,
    SeedHex: z.string().regex(/^(0x)?[a-fA-F0-9]+$/, "Expected a hex seed"),
    CurName: z.string(),
    LastPrice: z.number().optional().default(0),
    TotalVolume: z.number().optional().default(0),
    NumTrades: z.number().optional().default(0)
  })
});

export const actionResponseSchema = z.object({
  result: z.string()
});

export const voteCountSchema = z.object({
  total_count: z.number()
});

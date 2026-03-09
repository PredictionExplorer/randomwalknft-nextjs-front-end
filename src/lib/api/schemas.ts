import { z } from "zod";

export const tokenDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  seed: z.string(),
  rating: z.number(),
  status: z.number()
});

export const offerSchema = z.object({
  Id: z.number(),
  OfferId: z.number(),
  TokenId: z.number(),
  SellerAddr: z.string(),
  BuyerAddr: z.string(),
  Active: z.boolean(),
  Price: z.number(),
  TimeStamp: z.number(),
  DateTime: z.string(),
  OfferType: z.number()
});

export const tradingRecordSchema = z.object({
  Id: z.number(),
  OfferId: z.number(),
  TokenId: z.number(),
  SellerAddr: z.string(),
  BuyerAddr: z.string(),
  Price: z.number(),
  TimeStamp: z.number(),
  DateTime: z.string(),
  TxHash: z.string()
});

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
    TokenId: z.number(),
    CurOwnerAddr: z.string(),
    SeedHex: z.string(),
    CurName: z.string(),
    LastPrice: z.number().optional().default(0),
    TotalVolume: z.number().optional().default(0),
    NumTrades: z.number().optional().default(0)
  })
});

export const blogSchema = z.object({
  id: z.number(),
  title: z.string(),
  epic: z.string(),
  content: z.string(),
  banner_image: z.string(),
  thumb_image: z.string(),
  slug: z.string(),
  status: z.boolean().nullish().transform((value) => value ?? false),
  created_at: z.number()
});

export const loginResponseSchema = z.object({
  result: z.string(),
  token: z.string().optional()
});

export const authCheckResponseSchema = z.object({
  result: z.string()
});

export const actionResponseSchema = z.object({
  result: z.string()
});

export const voteCountSchema = z.object({
  total_count: z.number()
});

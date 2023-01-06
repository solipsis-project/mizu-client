export const ReservedFieldConstants = {
   SIGNATURES: "$signatures",
   SIGNATURES_KEY: "key",
   SIGNATURES_DIGEST: "digest"
} as const;

export const ReservedFields = [ReservedFieldConstants.SIGNATURES] as string[];
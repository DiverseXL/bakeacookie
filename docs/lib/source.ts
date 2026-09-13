import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

const sourceData = docs.toFumadocsSource();

// Debug: log the shape of sourceData
if (typeof window === "undefined") {
  console.log("[source.ts] sourceData type:", typeof sourceData);
  console.log("[source.ts] sourceData keys:", sourceData ? Object.keys(sourceData) : "null");
  console.log("[source.ts] sourceData.pages type:", sourceData?.pages ? typeof sourceData.pages : "undefined");
  if (Array.isArray(sourceData?.pages)) {
    console.log("[source.ts] sourceData.pages length:", sourceData.pages.length);
    console.log("[source.ts] first page:", JSON.stringify(sourceData.pages[0]).substring(0, 200));
  }
}

export const source = loader({
  baseUrl: "/docs",
  source: sourceData,
});

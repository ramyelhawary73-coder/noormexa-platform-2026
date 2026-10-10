import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
// Generates reviewable SQL; deliberately NEVER connects to a database.
// Production execution is a separate, explicit approval gate.
const manifest = JSON.parse(readFileSync(new URL("../data/official-preview-catalog.json", import.meta.url), "utf8"));
assert.equal(manifest.official_store_id, "store-noormexa-official");
assert.equal(manifest.products.length, 36);
const ids = new Set();
const escape = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const nullable = (value) => value == null ? "NULL" : escape(value);
const rows = manifest.products.map((p) => {
  assert(!ids.has(p.id)); ids.add(p.id);
  assert.equal(p.store_id, manifest.official_store_id);
  assert.equal(p.price, 0); assert.equal(p.stock, 0); assert.equal(p.status, "active");
  assert(p.name?.length > 0);
  const vals = [p.id,p.store_id,p.name,p.name_en,p.description,p.description_en,p.category_id,p.category_slug,0,0,"active",p.image_url,false];
  return "(" + vals.map((v,i) => i===8||i===9?"0":i===12?"false":nullable(v)).join(", ") + ")";
});
const sql = `-- OFFICIAL SHOWCASE ONLY; NO PURCHASES. Execution requires separate Production approval.
-- Insert-only, idempotent: already existing rows are not overwritten.
-- Public RLS allows active products; checkout RPC strictly requires price>0 and available stock.
BEGIN;
DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id='store-noormexa-official' AND status='approved' AND is_official IS TRUE)
  THEN RAISE EXCEPTION 'Verified official store does not exist';
  END IF;
END $guard$;
INSERT INTO public.products
(id, store_id, name, name_en, description, description_en, category_id, category_slug,
 price, stock, status, image_url, free_shipping)
VALUES
${rows.join(",\n")}
ON CONFLICT (id) DO NOTHING;
COMMIT;`;
if (process.argv.includes("--sql")) process.stdout.write(sql + "\n");
else console.log(`PASS: ${rows.length} deterministic non-sellable official listings; use --sql to inspect SQL. No database modified.`);

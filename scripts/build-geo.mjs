// Builds data/kentucky.json (state outline + interior county lines) from the
// us-atlas package. Run: npm install us-atlas topojson-client && node scripts/build-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";

const require = createRequire(import.meta.url);
const us = JSON.parse(readFileSync(require.resolve("us-atlas/counties-10m.json")));
const isKy = (g) => String(g.id).startsWith("21");
const counties = us.objects.counties.geometries.filter(isKy);
const round = (c) => (typeof c[0] === "number" ? [+c[0].toFixed(3), +c[1].toFixed(3)] : c.map(round));

const outline = topojson.merge(us, counties);
const lines = topojson.mesh(us, { type: "GeometryCollection", geometries: counties }, (a, b) => a !== b);
outline.coordinates = round(outline.coordinates);
lines.coordinates = round(lines.coordinates);

writeFileSync(new URL("../data/kentucky.json", import.meta.url), JSON.stringify({ outline, countyLines: lines }));
console.log("counties:", counties.length);

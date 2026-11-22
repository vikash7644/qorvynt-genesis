// Minimal source reader for the QORVYNT character-authoring subset used by Genesis.
// It reads QORVYNT define/map/array values; it does not pretend to execute QVM bytecode.
function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const char = source[i];
    if (/\s/.test(char)) { i++; continue; }
    if (char === "#") { while (i < source.length && source[i] !== "\n") i++; continue; }
    if ('(),[]'.includes(char)) { tokens.push({ punctuation: char }); i++; continue; }
    if (char === '"') {
      const start = i++;
      let escaped = false;
      while (i < source.length) {
        const current = source[i++];
        if (escaped) escaped = false;
        else if (current === "\\") escaped = true;
        else if (current === '"') break;
      }
      const raw = source.slice(start, i);
      try { tokens.push(JSON.parse(raw)); }
      catch { throw new SyntaxError("Invalid QORVYNT string literal: " + raw); }
      continue;
    }
    const number = source.slice(i).match(/^-?\d+(?:\.\d+)?/);
    if (number) { tokens.push(Number(number[0])); i += number[0].length; continue; }
    const identifier = source.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) { tokens.push({ identifier: identifier[0] }); i += identifier[0].length; continue; }
    throw new SyntaxError("Unexpected character in QORVYNT authoring source at offset " + i);
  }
  return tokens;
}

function parseExpression(tokens, environment) {
  let cursor = 0;
  const peek = () => tokens[cursor];
  const take = () => tokens[cursor++];
  const expect = (value) => {
    const token = take();
    if (token?.punctuation !== value) throw new SyntaxError("Expected '" + value + "' in QORVYNT authoring expression");
  };
  function value() {
    const token = take();
    if (typeof token === "string" || typeof token === "number") return token;
    if (token?.punctuation === "[") {
      const items = [];
      while (peek()?.punctuation !== "]") {
        items.push(value());
        if (peek()?.punctuation !== "]") expect(",");
      }
      expect("]");
      return items;
    }
    if (token && typeof token === "object" && token.identifier) {
      const name = token.identifier;
      if (name === "true") return true;
      if (name === "false") return false;
      if (name === "map") {
        expect("(");
        const result = {};
        while (peek()?.punctuation !== ")") {
          const key = value();
          if (typeof key !== "string") throw new SyntaxError("QORVYNT map keys must be strings");
          expect(",");
          result[key] = value();
          if (peek()?.punctuation !== ")") expect(",");
        }
        expect(")");
        return result;
      }
      if (!Object.prototype.hasOwnProperty.call(environment, name)) {
        throw new SyntaxError("Unknown QORVYNT authoring value: " + name);
      }
      return environment[name];
    }
    throw new SyntaxError("Expected a QORVYNT map, array, string, number, boolean or defined value");
  }
  const result = value();
  if (cursor !== tokens.length) throw new SyntaxError("Unexpected trailing tokens in QORVYNT authoring expression");
  return result;
}

export function parseQorvyntAuthoring(source) {
  if (typeof source !== "string") throw new TypeError("QORVYNT source must be text");
  const definitions = Object.create(null);
  const shown = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const definition = line.match(/^define\s+([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/);
    if (definition) {
      const [, name, expression] = definition;
      if (Object.prototype.hasOwnProperty.call(definitions, name)) throw new SyntaxError("Duplicate QORVYNT definition: " + name);
      definitions[name] = parseExpression(tokenize(expression), definitions);
      continue;
    }
    const show = line.match(/^show\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/);
    if (show) { shown.push(show[1]); continue; }
    throw new SyntaxError("Unsupported QORVYNT character-authoring statement: " + line.slice(0, 80));
  }
  for (const name of shown) {
    if (!Object.prototype.hasOwnProperty.call(definitions, name)) throw new SyntaxError("QORVYNT show references undefined value: " + name);
  }
  return Object.freeze({ definitions: Object.freeze(definitions), shown: Object.freeze(shown) });
}

export function loadQorvyntCharacterProfile(source) {
  const program = parseQorvyntAuthoring(source);
  const character = program.definitions.explorer_character;
  const asset = program.definitions.explorer_asset_pipeline;
  if (!character || !asset) throw new Error("QORVYNT source must define explorer_character and explorer_asset_pipeline");
  if (asset.format !== "glb" || asset.specification !== "gltf_2_0") throw new Error("Unsupported QORVYNT character asset format");
  if (asset.requires_skinned_mesh !== true) throw new Error("QORVYNT character profile must require a skinned mesh");
  if (!Number.isFinite(asset.target_height) || asset.target_height <= 0) throw new Error("QORVYNT target_height must be positive");
  if (!Array.isArray(asset.required_bones) || !asset.required_bones.length) throw new Error("QORVYNT required_bones must be a non-empty array");
  if (!asset.clip_aliases || typeof asset.clip_aliases !== "object") throw new Error("QORVYNT clip_aliases map is required");
  for (const state of ["idle", "walk", "run", "jump", "attack"]) {
    if (!Array.isArray(asset.clip_aliases[state]) || !asset.clip_aliases[state].length) throw new Error("QORVYNT clip aliases missing for " + state);
  }
  return Object.freeze({ character, asset });
}

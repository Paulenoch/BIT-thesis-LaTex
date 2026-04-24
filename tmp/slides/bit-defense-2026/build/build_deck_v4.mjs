const fs = await import("node:fs/promises");
const path = await import("node:path");
const { fileURLToPath, pathToFileURL } = await import("node:url");
const { Presentation, PresentationFile } = await import("@oai/artifact-tool");

const W = 1280;
const H = 720;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const OUT_BASE = path.join(ROOT, "outputs", "bit-defense-2026");
const OUT_DIR = path.join(OUT_BASE, "ppt");
const SCRATCH_DIR = path.join(ROOT, "tmp", "slides", "bit-defense-2026-v4");
const PREVIEW_DIR = path.join(SCRATCH_DIR, "preview");
const VERIFICATION_DIR = path.join(SCRATCH_DIR, "verification");
const INSPECT_PATH = path.join(SCRATCH_DIR, "inspect.ndjson");
const { deckMeta, theme, slideDeck } = await import(pathToFileURL(path.join(OUT_BASE, "assets", "content_v4.mjs")).href);

const TITLE_FACE = "Microsoft YaHei";
const BODY_FACE = "Microsoft YaHei";
const MONO_FACE = "Aptos";

const inspectRecords = [];

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
}

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function resolveAssetPath(assetRef) {
  if (path.isAbsolute(assetRef)) {
    return assetRef;
  }
  return path.join(ROOT, assetRef);
}

function line(fill = "#00000000", width = 0) {
  return { style: "solid", fill, width };
}

function record(kind, value) {
  inspectRecords.push({ kind, ...value });
}

function addShape(slide, slideNo, geometry, position, fill = "#00000000", stroke = "#00000000", strokeWidth = 0, role = geometry, extra = {}) {
  const shape = slide.shapes.add({
    geometry,
    position,
    fill,
    line: line(stroke, strokeWidth),
    ...extra,
  });
  record("shape", {
    slide: slideNo,
    role,
    bbox: [position.left, position.top, position.width, position.height],
  });
  return shape;
}

function addText(
  slide,
  slideNo,
  text,
  position,
  {
    fontSize = 24,
    color = theme.ink,
    bold = false,
    face = BODY_FACE,
    align = "left",
    valign = "top",
    fill = "#00000000",
    stroke = "#00000000",
    strokeWidth = 0,
    insets = { left: 0, right: 0, top: 0, bottom: 0 },
    autoFit = "shrinkText",
    role = "text",
  } = {},
) {
  const box = addShape(slide, slideNo, "rect", position, fill, stroke, strokeWidth, role);
  box.text = text;
  box.text.fontSize = fontSize;
  box.text.color = color;
  box.text.bold = bold;
  box.text.typeface = face;
  box.text.alignment = align;
  box.text.verticalAlignment = valign;
  box.text.insets = insets;
  box.text.autoFit = autoFit;
  record("textbox", {
    slide: slideNo,
    role,
    text: String(text),
    textChars: String(text).length,
    textLines: String(text).split("\n").length,
    bbox: [position.left, position.top, position.width, position.height],
  });
  return box;
}

async function addImage(slide, slideNo, imageFile, position, fit = "contain", role = "image", geometry = null) {
  const imagePath = resolveAssetPath(imageFile);
  const blob = await readImageBlob(imagePath);
  const image = slide.images.add({ blob, fit, alt: role, geometry: geometry || undefined });
  image.position = position;
  record("image", {
    slide: slideNo,
    role,
    path: imagePath,
    bbox: [position.left, position.top, position.width, position.height],
  });
  return image;
}

function addHeader(slide, slideNo, kicker) {
  const indexText = slideNo <= deckMeta.mainSlideCount
    ? `${String(slideNo).padStart(2, "0")} / ${String(deckMeta.mainSlideCount).padStart(2, "0")}`
    : `B${slideNo - deckMeta.mainSlideCount} / ${String(deckMeta.slideCount - deckMeta.mainSlideCount).padStart(2, "0")}`;
  addText(
    slide,
    slideNo,
    kicker || deckMeta.school,
    { left: 54, top: 24, width: 440, height: 20 },
    {
      fontSize: 14,
      color: theme.bitGreen,
      bold: true,
      face: MONO_FACE,
      autoFit: null,
      role: "header kicker",
    },
  );
  addText(
    slide,
    slideNo,
    indexText,
    { left: 1120, top: 24, width: 106, height: 20 },
    {
      fontSize: 14,
      color: theme.muted,
      bold: true,
      face: MONO_FACE,
      align: "right",
      autoFit: null,
      role: "header index",
    },
  );
  addShape(slide, slideNo, "rect", { left: 54, top: 54, width: 1172, height: 1.4 }, theme.line, "#00000000", 0, "header rule");
  addShape(slide, slideNo, "ellipse", { left: 46, top: 46, width: 16, height: 16 }, theme.bitRed, "#ffffff", 0.8, "header marker");
}

function addTitle(slide, slideNo, title, top = 82, width = 760) {
  addText(
    slide,
    slideNo,
    title,
    { left: 58, top, width, height: 94 },
    {
      fontSize: 34,
      color: theme.bitRed,
      bold: true,
      face: TITLE_FACE,
      role: "title",
    },
  );
}

function addFooterBand(slide, slideNo, text, color = theme.bitGreen) {
  addShape(slide, slideNo, "roundRect", { left: 58, top: 640, width: 1164, height: 48 }, color, "#00000000", 0, "footer band");
  addText(
    slide,
    slideNo,
    text,
    { left: 82, top: 650, width: 1118, height: 24 },
    {
      fontSize: 18,
      color: "#FFFFFF",
      bold: true,
      face: BODY_FACE,
      autoFit: null,
      role: "footer text",
    },
  );
}

function addBulletPanel(slide, slideNo, items, position, { fill = "#FFFFFF", stroke = theme.line, accent = theme.bitRed, fontSize = 20, role = "bullet panel" } = {}) {
  addShape(slide, slideNo, "roundRect", position, fill, stroke, 1.2, role);
  const rowHeight = Math.max(42, Math.floor((position.height - 28) / Math.max(items.length, 1)));
  let top = position.top + 14;
  for (const item of items) {
    addShape(
      slide,
      slideNo,
      "ellipse",
      { left: position.left + 18, top: top + Math.max(8, Math.floor((rowHeight - 10) / 2)), width: 10, height: 10 },
      accent,
      "#00000000",
      0,
      "bullet dot",
    );
    addText(
      slide,
      slideNo,
      item,
      { left: position.left + 40, top, width: position.width - 56, height: rowHeight - 6 },
      {
        fontSize,
        color: theme.ink,
        face: BODY_FACE,
        role: "bullet text",
      },
    );
    top += rowHeight;
  }
}

function addStatCard(slide, slideNo, label, value, position) {
  addShape(slide, slideNo, "roundRect", position, theme.softRed, "#00000000", 0, "stat card");
  addText(
    slide,
    slideNo,
    label,
    { left: position.left + 16, top: position.top + 12, width: position.width - 32, height: 20 },
    { fontSize: 16, color: theme.ink, bold: true, face: BODY_FACE, autoFit: null, role: "stat label" },
  );
  addText(
    slide,
    slideNo,
    value,
    { left: position.left + 16, top: position.top + 34, width: position.width - 32, height: position.height - 44 },
    { fontSize: 24, color: theme.bitRed, bold: true, face: TITLE_FACE, role: "stat value" },
  );
}

function addMiniClaimCard(slide, slideNo, label, value, caption, position, accent = theme.bitRed) {
  addShape(slide, slideNo, "roundRect", position, "#FFFFFF", theme.line, 1.1, "mini claim card");
  addText(
    slide,
    slideNo,
    label,
    { left: position.left + 16, top: position.top + 12, width: position.width - 32, height: 20 },
    { fontSize: 15, color: theme.ink, bold: true, face: BODY_FACE, autoFit: null, role: "mini claim label" },
  );
  addText(
    slide,
    slideNo,
    value,
    { left: position.left + 16, top: position.top + 38, width: position.width - 32, height: 34 },
    { fontSize: 28, color: accent, bold: true, face: TITLE_FACE, autoFit: "shrinkText", role: "mini claim value" },
  );
  addText(
    slide,
    slideNo,
    caption,
    { left: position.left + 16, top: position.top + 80, width: position.width - 32, height: position.height - 92 },
    { fontSize: 13, color: theme.muted, face: BODY_FACE, role: "mini claim caption" },
  );
}

function addSimpleTable(slide, slideNo, columns, rows, position, {
  headerFill = theme.bitGreen,
  headerColor = "#FFFFFF",
  rowFill = "#FFFFFF",
  altFill = theme.warmWhite,
  fontSize = 15,
  headerSize = 14,
  accentColumn = -1,
  role = "table",
} = {}) {
  const colWidths = columns.map((col) => col.width || 1);
  const totalWeight = colWidths.reduce((sum, w) => sum + w, 0);
  const actualWidths = colWidths.map((w) => (position.width * w) / totalWeight);
  const headerHeight = 38;
  const rowHeight = (position.height - headerHeight) / Math.max(rows.length, 1);
  let left = position.left;
  columns.forEach((col, idx) => {
    const width = actualWidths[idx];
    addShape(slide, slideNo, "rect", { left, top: position.top, width, height: headerHeight }, headerFill, "#FFFFFF", 0.8, `${role} header cell`);
    addText(slide, slideNo, col.label, { left: left + 8, top: position.top + 9, width: width - 16, height: headerHeight - 14 }, {
      fontSize: headerSize,
      color: headerColor,
      bold: true,
      face: BODY_FACE,
      align: col.align || "center",
      autoFit: "shrinkText",
      role: `${role} header text`,
    });
    left += width;
  });
  rows.forEach((row, rIdx) => {
    left = position.left;
    const top = position.top + headerHeight + rIdx * rowHeight;
    columns.forEach((col, cIdx) => {
      const width = actualWidths[cIdx];
      addShape(slide, slideNo, "rect", { left, top, width, height: rowHeight }, rIdx % 2 === 0 ? rowFill : altFill, theme.line, 0.7, `${role} body cell`);
      addText(slide, slideNo, row[cIdx] || "", { left: left + 8, top: top + 8, width: width - 16, height: rowHeight - 12 }, {
        fontSize,
        color: cIdx === accentColumn ? theme.bitRed : theme.ink,
        bold: cIdx === 0 || cIdx === accentColumn,
        face: BODY_FACE,
        align: col.align || "center",
        autoFit: "shrinkText",
        role: `${role} body text`,
      });
      left += width;
    });
  });
}

function addLabelChip(slide, slideNo, text, position, fill = theme.softGreen, color = theme.bitGreen, role = "chip") {
  addShape(slide, slideNo, "roundRect", position, fill, "#00000000", 0, role);
  addText(
    slide,
    slideNo,
    text,
    { left: position.left + 12, top: position.top + 8, width: position.width - 24, height: position.height - 16 },
    {
      fontSize: 14,
      color,
      bold: true,
      face: BODY_FACE,
      align: "center",
      valign: "middle",
      role: `${role} text`,
    },
  );
}

function addFlowNode(slide, slideNo, node, position, { fill = "#FFFFFF", stroke = theme.line, accent = theme.bitGreen, role = "flow node" } = {}) {
  addShape(slide, slideNo, "roundRect", position, fill, stroke, 1.1, role);
  addText(slide, slideNo, node.title, { left: position.left + 14, top: position.top + 12, width: position.width - 28, height: 24 }, {
    fontSize: node.titleSize || 17,
    color: accent,
    bold: true,
    face: BODY_FACE,
    align: "center",
    autoFit: "shrinkText",
    role: `${role} title`,
  });
  if (node.caption) {
    addText(slide, slideNo, node.caption, { left: position.left + 14, top: position.top + 42, width: position.width - 28, height: position.height - 50 }, {
      fontSize: node.captionSize || 12,
      color: theme.muted,
      face: BODY_FACE,
      align: "center",
      role: `${role} caption`,
    });
  }
}

function addArrow(slide, slideNo, from, to, role = "arrow", color = theme.copper) {
  const midY = from.top + from.height / 2 - 14;
  addText(slide, slideNo, "→", { left: from.left + from.width + 6, top: midY, width: Math.max(24, to.left - from.left - from.width - 12), height: 28 }, {
    fontSize: 25,
    color,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: null,
    role,
  });
}

function addVerticalArrow(slide, slideNo, x, y, role = "vertical arrow", color = theme.copper) {
  addText(slide, slideNo, "↓", { left: x, top: y, width: 28, height: 28 }, {
    fontSize: 22,
    color,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: null,
    role,
  });
}

async function addImageCard(slide, slideNo, { left, top, width, height }, imageFile, label, role = "image card", fit = "contain") {
  addShape(slide, slideNo, "roundRect", { left, top, width, height }, "#FFFFFF", theme.line, 1.1, role);
  if (label) {
    addText(slide, slideNo, label, { left: left + 18, top: top + 12, width: width - 36, height: 18 }, {
      fontSize: 14,
      color: theme.bitGreen,
      bold: true,
      face: MONO_FACE,
      autoFit: null,
      role: `${role} label`,
    });
  }
  const imageTop = label ? top + 38 : top + 10;
  const imageHeight = label ? height - 50 : height - 20;
  await addImage(slide, slideNo, imageFile, { left: left + 10, top: imageTop, width: width - 20, height: imageHeight }, fit, `${role} image`);
}

function addSpeakerNotes(slide, content) {
  slide.speakerNotes.setText(content || "");
}

async function renderCover(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addShape(slide, slideNo, "rect", { left: 0, top: 0, width: W, height: H }, theme.warmWhite, "#00000000", 0, "background");
  addShape(slide, slideNo, "rect", { left: 0, top: 0, width: 708, height: H }, theme.bitRed, "#00000000", 0, "cover left panel");
  addShape(slide, slideNo, "rect", { left: 16, top: 16, width: 676, height: 688 }, "#FFFFFF0E", "#FFFFFF2B", 1.2, "cover inner frame");
  if (data.heroMode === "wide") {
    addShape(slide, slideNo, "roundRect", { left: 730, top: 96, width: 500, height: 356 }, "#FFFFFF", theme.line, 1.1, "cover wide frame");
    await addImage(slide, slideNo, data.image, { left: 744, top: 112, width: 472, height: 324 }, "contain", "cover hero wide", "roundRect");
    addShape(slide, slideNo, "roundRect", { left: 730, top: 472, width: 500, height: 118 }, theme.softGreen, "#00000000", 0, "cover thesis chip");
    addText(slide, slideNo, data.heroCaption || "高速、密集、未知环境中的视觉避障任务", { left: 760, top: 504, width: 440, height: 44 }, {
      fontSize: 20,
      color: theme.bitGreen,
      bold: true,
      face: BODY_FACE,
      align: "center",
      role: "cover hero caption",
    });
  } else {
    await addImage(slide, slideNo, data.image, { left: 730, top: 52, width: 500, height: 616 }, data.heroFit || "cover", "cover hero", "roundRect");
    addShape(slide, slideNo, "rect", { left: 730, top: 52, width: 500, height: 616 }, "#1F5A4540", "#00000000", 0, "cover image tint");
  }
  await addImage(slide, slideNo, data.logo, { left: 1130, top: 74, width: 74, height: 74 }, "contain", "cover logo");
  addText(slide, slideNo, data.kicker, { left: 70, top: 68, width: 360, height: 20 }, {
    fontSize: 15,
    color: "#F5E7D8",
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "cover kicker",
  });
  addText(slide, slideNo, data.title, { left: 70, top: 118, width: 600, height: 160 }, {
    fontSize: 34,
    color: "#FFFFFF",
    bold: true,
    face: TITLE_FACE,
    role: "cover title",
  });
  addText(slide, slideNo, data.subtitle, { left: 72, top: 292, width: 560, height: 96 }, {
    fontSize: 19,
    color: "#F7EDE0",
    face: BODY_FACE,
    role: "cover subtitle",
  });
  addShape(slide, slideNo, "roundRect", { left: 70, top: 434, width: 430, height: 196 }, "#FFFFFF12", "#FFFFFF2E", 1.1, "cover details panel");
  addText(slide, slideNo, data.details.join("\n"), { left: 92, top: 458, width: 386, height: 156 }, {
    fontSize: 18,
    color: "#FFFFFF",
    face: BODY_FACE,
    role: "cover details",
  });
  addText(slide, slideNo, `${deckMeta.schoolEn} · ${deckMeta.major}`, { left: 730, top: 674, width: 476, height: 18 }, {
    fontSize: 12,
    color: "#FFFFFFD0",
    face: MONO_FACE,
    align: "right",
    autoFit: null,
    role: "cover footer",
  });
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderAgenda(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, "Defense Outline");
  addTitle(slide, slideNo, data.title, 86, 820);
  const cards = [
    { left: 70, top: 210 },
    { left: 660, top: 210 },
    { left: 70, top: 418 },
    { left: 660, top: 418 },
  ];
  data.sections.forEach((section, idx) => {
    const card = cards[idx];
    addShape(slide, slideNo, "roundRect", { left: card.left, top: card.top, width: 550, height: 156 }, "#FFFFFF", theme.line, 1.2, "agenda card");
    addShape(slide, slideNo, "roundRect", { left: card.left + 24, top: card.top + 24, width: 64, height: 64 }, idx % 2 === 0 ? theme.bitRed : theme.bitGreen, "#00000000", 0, "agenda number");
    addText(slide, slideNo, String(idx + 1), { left: card.left + 24, top: card.top + 32, width: 64, height: 30 }, {
      fontSize: 26,
      color: "#FFFFFF",
      bold: true,
      face: TITLE_FACE,
      align: "center",
      autoFit: null,
      role: "agenda number text",
    });
    addText(slide, slideNo, section, { left: card.left + 112, top: card.top + 30, width: 388, height: 88 }, {
      fontSize: 27,
      color: theme.ink,
      bold: true,
      face: TITLE_FACE,
      role: "agenda text",
    });
  });
  addFooterBand(slide, slideNo, "整套汇报按“背景—方法—结果—结论”四段展开", theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderImageBullets(slide, slideNo, data, mirrored = false) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 690);
  const mediaPos = mirrored
    ? { left: 680, top: 190, width: 540, height: 400 }
    : { left: 58, top: 190, width: 600, height: 400 };
  const textPos = mirrored
    ? { left: 58, top: 190, width: 590, height: 352 }
    : { left: 692, top: 190, width: 530, height: 352 };
  addShape(slide, slideNo, "roundRect", mediaPos, "#FFFFFF", theme.line, 1.1, "image card");
  await addImage(slide, slideNo, data.image, { left: mediaPos.left + 10, top: mediaPos.top + 10, width: mediaPos.width - 20, height: mediaPos.height - 20 }, "contain", "main image");
  addBulletPanel(slide, slideNo, data.bullets, textPos, { accent: mirrored ? theme.bitGreen : theme.bitRed, fontSize: 19 });
  addFooterBand(slide, slideNo, data.highlight, mirrored ? theme.bitGreen : theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderResult(slide, slideNo, data, mirrored = false) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 760);
  const mediaPos = mirrored
    ? { left: 680, top: 190, width: 540, height: 400 }
    : { left: 58, top: 190, width: 600, height: 400 };
  const textPos = mirrored
    ? { left: 58, top: 190, width: 590, height: 352 }
    : { left: 692, top: 190, width: 530, height: 352 };
  addShape(slide, slideNo, "roundRect", mediaPos, "#FFFFFF", theme.line, 1.1, "result image card");
  await addImage(
    slide,
    slideNo,
    data.image,
    { left: mediaPos.left + 10, top: mediaPos.top + 10, width: mediaPos.width - 20, height: mediaPos.height - 20 },
    "contain",
    "result image",
  );
  addBulletPanel(slide, slideNo, data.bullets, textPos, { accent: mirrored ? theme.bitGreen : theme.bitRed, fontSize: 19 });
  addFooterBand(slide, slideNo, data.metric, data.id === "full-ssm" ? theme.copper : theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderChallenge(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 850);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 190, width: 470, height: 110 }, theme.softGreen, "#00000000", 0, "io card");
  addText(slide, slideNo, data.io.join("\n"), { left: 82, top: 212, width: 420, height: 70 }, {
    fontSize: 20,
    color: theme.bitGreen,
    bold: true,
    face: BODY_FACE,
    role: "io text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 58, top: 320, width: 470, height: 270 }, { accent: theme.bitGreen, fontSize: 18 });
  addShape(slide, slideNo, "roundRect", { left: 548, top: 190, width: 674, height: 400 }, "#FFFFFF", theme.line, 1.1, "challenge image card");
  await addImage(slide, slideNo, data.image, { left: 560, top: 202, width: 650, height: 376 }, "contain", "challenge image");
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderPlatform(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 860);
  const left = 58;
  const top = 182;
  addShape(slide, slideNo, "roundRect", { left, top, width: 728, height: 408 }, "#FFFFFF", theme.line, 1.1, "platform media area");
  addShape(slide, slideNo, "roundRect", { left: 72, top: 196, width: 314, height: 172 }, theme.warmWhite, theme.line, 0.8, "spheres card");
  addShape(slide, slideNo, "roundRect", { left: 402, top: 196, width: 314, height: 172 }, theme.warmWhite, theme.line, 0.8, "trees card");
  addShape(slide, slideNo, "roundRect", { left: 72, top: 382, width: 644, height: 190 }, theme.warmWhite, theme.line, 0.8, "pipeline card");
  addText(slide, slideNo, "Spheres（ID）", { left: 90, top: 204, width: 180, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "platform label",
  });
  addText(slide, slideNo, "Trees（OOD）", { left: 420, top: 204, width: 180, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "platform label",
  });
  addText(slide, slideNo, "Data Collection Pipeline", { left: 90, top: 390, width: 220, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "platform label",
  });
  await addImage(slide, slideNo, data.images[0], { left: 84, top: 226, width: 290, height: 126 }, "contain", "spheres image");
  await addImage(slide, slideNo, data.images[1], { left: 414, top: 226, width: 290, height: 126 }, "contain", "trees image");
  await addImage(slide, slideNo, data.images[2], { left: 84, top: 418, width: 620, height: 142 }, "contain", "pipeline image");
  addBulletPanel(slide, slideNo, data.bullets, { left: 812, top: 182, width: 410, height: 408 }, { accent: theme.bitRed, fontSize: 18 });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderDualResult(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 780);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 188, width: 560, height: 396 }, "#FFFFFF", theme.line, 1.1, "dual image one");
  addShape(slide, slideNo, "roundRect", { left: 634, top: 188, width: 588, height: 194 }, "#FFFFFF", theme.line, 1.1, "dual image two");
  addText(slide, slideNo, "DAgger 轮次实验", { left: 80, top: 198, width: 200, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "dual label",
  });
  addText(slide, slideNo, "RACS 安全—平滑权衡", { left: 656, top: 198, width: 240, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "dual label",
  });
  await addImage(slide, slideNo, data.images[0], { left: 72, top: 224, width: 532, height: 344 }, "contain", "dual image left");
  await addImage(slide, slideNo, data.images[1], { left: 648, top: 218, width: 560, height: 150 }, "contain", "dual image right");
  addBulletPanel(slide, slideNo, data.bullets, { left: 634, top: 396, width: 588, height: 188 }, { accent: theme.bitRed, fontSize: 16 });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderTrap(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 770);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 184, width: 560, height: 414 }, "#FFFFFF", theme.line, 1.1, "trap image");
  addShape(slide, slideNo, "roundRect", { left: 634, top: 184, width: 588, height: 188 }, "#FFFFFF", theme.line, 1.1, "trap image 2");
  await addImage(slide, slideNo, data.images[0], { left: 72, top: 196, width: 532, height: 388 }, "contain", "trap drift");
  await addImage(slide, slideNo, data.images[1], { left: 648, top: 206, width: 560, height: 152 }, "contain", "trap lateral drift");
  let statTop = 392;
  for (const [label, value] of data.stats) {
    addStatCard(slide, slideNo, label, value, { left: 654, top: statTop, width: 550, height: 62 });
    statTop += 74;
  }
  addFooterBand(slide, slideNo, data.note, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderProtocol(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 790);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 184, width: 1164, height: 160 }, "#FFFFFF", theme.line, 1.1, "lifecycle area");
  let pillLeft = 78;
  data.lifecycle.forEach((step, idx) => {
    addShape(slide, slideNo, "roundRect", { left: pillLeft, top: 234, width: 166, height: 56 }, theme.bitGreen, "#00000000", 0, "lifecycle pill");
    addText(slide, slideNo, step, { left: pillLeft, top: 250, width: 166, height: 24 }, {
      fontSize: 22,
      color: "#FFFFFF",
      bold: true,
      face: TITLE_FACE,
      align: "center",
      autoFit: null,
      role: "lifecycle text",
    });
    if (idx < data.lifecycle.length - 1) {
      addText(slide, slideNo, "→", { left: pillLeft + 176, top: 238, width: 34, height: 32 }, {
        fontSize: 24,
        color: theme.copper,
        bold: true,
        face: TITLE_FACE,
        align: "center",
        autoFit: null,
        role: "lifecycle arrow",
      });
    }
    pillLeft += 220;
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 58, top: 362, width: 1164, height: 228 }, { accent: theme.bitGreen, fontSize: 18, role: "protocol bullets" });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderFinal(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 810);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 184, width: 680, height: 190 }, "#FFFFFF", theme.line, 1.1, "final spheres card");
  addShape(slide, slideNo, "roundRect", { left: 58, top: 390, width: 680, height: 190 }, "#FFFFFF", theme.line, 1.1, "final trees card");
  addShape(slide, slideNo, "roundRect", { left: 756, top: 184, width: 466, height: 190 }, "#FFFFFF", theme.line, 1.1, "final latency card");
  addText(slide, slideNo, "Spheres（ID）", { left: 76, top: 194, width: 180, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "final label",
  });
  addText(slide, slideNo, "Trees（OOD）", { left: 76, top: 400, width: 180, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "final label",
  });
  addText(slide, slideNo, "Inference Latency", { left: 774, top: 194, width: 180, height: 18 }, {
    fontSize: 14,
    color: theme.bitGreen,
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "final label",
  });
  await addImage(slide, slideNo, data.images[0], { left: 72, top: 220, width: 652, height: 140 }, "contain", "final spheres");
  await addImage(slide, slideNo, data.images[1], { left: 72, top: 426, width: 652, height: 140 }, "contain", "final trees");
  await addImage(slide, slideNo, data.images[2], { left: 770, top: 220, width: 438, height: 136 }, "contain", "final latency");
  addBulletPanel(slide, slideNo, data.bullets, { left: 756, top: 390, width: 466, height: 228 }, { accent: theme.bitRed, fontSize: 15, role: "final bullets" });
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderConclusion(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 1080);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 200, width: 560, height: 352 }, "#FFFFFF", theme.line, 1.1, "conclusion left");
  addShape(slide, slideNo, "roundRect", { left: 662, top: 200, width: 560, height: 352 }, "#FFFFFF", theme.line, 1.1, "conclusion right");
  addText(slide, slideNo, data.leftTitle || "结论", { left: 82, top: 222, width: 160, height: 26 }, {
    fontSize: 24,
    color: theme.bitRed,
    bold: true,
    face: TITLE_FACE,
    autoFit: null,
    role: "column title",
  });
  addText(slide, slideNo, data.rightTitle || "局限与展望", { left: 686, top: 222, width: 220, height: 26 }, {
    fontSize: 24,
    color: theme.bitGreen,
    bold: true,
    face: TITLE_FACE,
    autoFit: null,
    role: "column title",
  });
  addBulletPanel(slide, slideNo, data.conclusions, { left: 76, top: 262, width: 524, height: 266 }, { accent: theme.bitRed, fontSize: 18, role: "conclusion bullets" });
  addBulletPanel(slide, slideNo, data.future, { left: 680, top: 262, width: 524, height: 266 }, { accent: theme.bitGreen, fontSize: 18, role: "future bullets" });
  addFooterBand(slide, slideNo, data.footer || "结论回答贡献，展望回答边界与下一步工作。", theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderThanks(slide, slideNo, data) {
  slide.background.fill = theme.bitRed;
  addShape(slide, slideNo, "rect", { left: 0, top: 0, width: W, height: H }, theme.bitRed, "#00000000", 0, "thanks background");
  addShape(slide, slideNo, "rect", { left: 0, top: 0, width: W, height: H }, "#1F5A4560", "#00000000", 0, "thanks tint");
  await addImage(slide, slideNo, data.image, { left: 640, top: 138, width: 570, height: 320 }, "contain", "thanks hero", "roundRect");
  addShape(slide, slideNo, "rect", { left: 640, top: 138, width: 570, height: 320 }, "#1F5A4524", "#00000000", 0, "thanks image tint");
  await addImage(slide, slideNo, data.logo, { left: 1106, top: 92, width: 78, height: 78 }, "contain", "thanks logo");
  addText(slide, slideNo, data.kicker, { left: 70, top: 100, width: 180, height: 20 }, {
    fontSize: 15,
    color: "#E7D7C3",
    bold: true,
    face: MONO_FACE,
    autoFit: null,
    role: "thanks kicker",
  });
  addText(slide, slideNo, data.title, { left: 70, top: 214, width: 540, height: 92 }, {
    fontSize: 48,
    color: "#FFFFFF",
    bold: true,
    face: TITLE_FACE,
    role: "thanks title",
  });
  addText(slide, slideNo, data.subtitle, { left: 74, top: 334, width: 420, height: 40 }, {
    fontSize: 24,
    color: "#F2E6D6",
    face: BODY_FACE,
    role: "thanks subtitle",
  });
  addShape(slide, slideNo, "roundRect", { left: 70, top: 444, width: 320, height: 54 }, "#FFFFFF18", "#FFFFFF2C", 1.1, "thanks chip");
  addText(slide, slideNo, `${deckMeta.school} · ${deckMeta.institute}`, { left: 92, top: 460, width: 276, height: 20 }, {
    fontSize: 16,
    color: "#FFFFFF",
    bold: true,
    face: BODY_FACE,
    autoFit: null,
    role: "thanks chip text",
  });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderBackgroundEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 760);
  await addImageCard(slide, slideNo, { left: 58, top: 184, width: 690, height: 406 }, data.image, "图1.1：典型应用场景与共性挑战", "background main");
  addShape(slide, slideNo, "roundRect", { left: 774, top: 184, width: 448, height: 126 }, theme.softRed, "#00000000", 0, "background metric");
  addText(slide, slideNo, data.metric.label, { left: 802, top: 202, width: 392, height: 22 }, {
    fontSize: 16,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    autoFit: null,
    role: "background metric label",
  });
  addText(slide, slideNo, data.metric.value, { left: 802, top: 232, width: 392, height: 44 }, {
    fontSize: 30,
    color: theme.bitRed,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: "shrinkText",
    role: "background metric value",
  });
  addText(slide, slideNo, data.metric.caption, { left: 802, top: 278, width: 392, height: 18 }, {
    fontSize: 13,
    color: theme.muted,
    face: BODY_FACE,
    align: "center",
    autoFit: null,
    role: "background metric caption",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 774, top: 330, width: 448, height: 260 }, { accent: theme.bitRed, fontSize: 17, role: "background bullets" });
  addFooterBand(slide, slideNo, data.highlight, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderProblemEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 820);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 188, width: 470, height: 110 }, theme.softGreen, "#00000000", 0, "problem io");
  addText(slide, slideNo, data.io.join("\n"), { left: 82, top: 210, width: 420, height: 72 }, {
    fontSize: 20,
    color: theme.bitGreen,
    bold: true,
    face: BODY_FACE,
    role: "problem io text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 58, top: 318, width: 470, height: 272 }, { accent: theme.bitGreen, fontSize: 18, role: "problem bullets" });
  await addImageCard(slide, slideNo, { left: 548, top: 188, width: 674, height: 402 }, data.image, "图1.6：Batch / Streaming / 错误重置", "problem figure");
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderFrameworkEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 760);
  await addImageCard(slide, slideNo, { left: 58, top: 188, width: 720, height: 404 }, data.image, "图3.2：策略网络总体架构", "framework main");
  addBulletPanel(slide, slideNo, data.bullets, { left: 796, top: 188, width: 426, height: 258 }, { accent: theme.bitRed, fontSize: 17, role: "framework bullets" });
  await addImageCard(slide, slideNo, { left: 796, top: 464, width: 426, height: 128 }, data.inset, "图1.8：技术路线总览", "framework inset");
  addFooterBand(slide, slideNo, data.highlight, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderPlatformV2(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 860);
  await addImageCard(slide, slideNo, { left: 58, top: 186, width: 350, height: 180 }, data.images[0], "Spheres（ID）", "platform spheres");
  await addImageCard(slide, slideNo, { left: 422, top: 186, width: 350, height: 180 }, data.images[1], "Trees（OOD）", "platform trees");
  await addImageCard(slide, slideNo, { left: 58, top: 384, width: 714, height: 206 }, data.images[2], "图2.10：数据采集管线", "platform pipeline");
  addBulletPanel(slide, slideNo, data.bullets, { left: 796, top: 186, width: 426, height: 340 }, { accent: theme.bitRed, fontSize: 17, role: "platform bullets" });
  addShape(slide, slideNo, "roundRect", { left: 796, top: 542, width: 426, height: 48 }, theme.softCopper, "#00000000", 0, "protocol note");
  addText(slide, slideNo, "统一协议：5 个速度档 / ID+OOD / 10 次重复 / 5 类指标", { left: 818, top: 556, width: 392, height: 22 }, {
    fontSize: 15,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    autoFit: null,
    role: "protocol note text",
  });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderMergedIntro(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 880);
  await addImageCard(slide, slideNo, { left: 58, top: 184, width: 520, height: 298 }, data.image, "图1.1：场景与共性挑战", "intro image");
  addShape(slide, slideNo, "roundRect", { left: 604, top: 184, width: 618, height: 104 }, theme.softRed, "#00000000", 0, "intro metric");
  addText(slide, slideNo, data.metric.label, { left: 634, top: 202, width: 558, height: 22 }, {
    fontSize: 16,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    autoFit: null,
    role: "intro metric label",
  });
  addText(slide, slideNo, data.metric.value, { left: 634, top: 232, width: 558, height: 38 }, {
    fontSize: 30,
    color: theme.bitRed,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    role: "intro metric value",
  });
  addShape(slide, slideNo, "roundRect", { left: 604, top: 312, width: 618, height: 88 }, theme.softGreen, "#00000000", 0, "intro io");
  addText(slide, slideNo, data.io.join("\n"), { left: 634, top: 330, width: 558, height: 48 }, {
    fontSize: 18,
    color: theme.bitGreen,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "intro io text",
  });
  addBulletPanel(slide, slideNo, data.challenges, { left: 604, top: 424, width: 618, height: 158 }, { accent: theme.bitRed, fontSize: 16, role: "intro challenges" });
  addFooterBand(slide, slideNo, data.footer, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderRouteProtocol(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  const laneTop = 182;
  const laneHeight = 104;
  data.chains.forEach((chain, idx) => {
    const top = laneTop + idx * 128;
    const accent = idx === 1 ? theme.bitGreen : theme.bitRed;
    addShape(slide, slideNo, "roundRect", { left: 58, top, width: 1164, height: laneHeight }, idx === 1 ? theme.softGreen : theme.softRed, "#00000000", 0, "route lane");
    addText(slide, slideNo, chain.label, { left: 84, top: top + 18, width: 190, height: 30 }, {
      fontSize: 22,
      color: accent,
      bold: true,
      face: TITLE_FACE,
      autoFit: "shrinkText",
      role: "route lane label",
    });
    addText(slide, slideNo, chain.steps.join("  →  "), { left: 292, top: top + 20, width: 890, height: 30 }, {
      fontSize: 20,
      color: theme.ink,
      bold: true,
      face: BODY_FACE,
      align: "center",
      role: "route lane steps",
    });
    addText(slide, slideNo, chain.caption, { left: 292, top: top + 58, width: 890, height: 24 }, {
      fontSize: 14,
      color: theme.muted,
      face: BODY_FACE,
      align: "center",
      role: "route lane caption",
    });
  });
  addShape(slide, slideNo, "roundRect", { left: 58, top: 566, width: 1164, height: 54 }, theme.softCopper, "#00000000", 0, "route protocol");
  addText(slide, slideNo, data.protocol, { left: 82, top: 582, width: 1116, height: 24 }, {
    fontSize: 16,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "route protocol text",
  });
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderNetworkMethod(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  const nodes = data.flow;
  const left = 72;
  const top = 176;
  const width = 250;
  const height = 52;
  nodes.forEach((node, idx) => {
    const y = top + idx * 64;
    addFlowNode(slide, slideNo, node, { left, top: y, width, height }, { fill: idx === 4 ? theme.softGreen : "#FFFFFF", accent: idx === 4 ? theme.bitGreen : theme.bitRed, role: "network flow node" });
    if (idx < nodes.length - 1) {
      addVerticalArrow(slide, slideNo, left + width / 2 - 14, y + height + 2, "network flow arrow");
    }
  });
  await addImageCard(slide, slideNo, { left: 360, top: 176, width: 396, height: 282 }, data.image, "图3.2：策略网络架构", "network method image");
  addBulletPanel(slide, slideNo, data.points, { left: 786, top: 176, width: 436, height: 282 }, { accent: theme.bitGreen, fontSize: 16, role: "network points" });
  addShape(slide, slideNo, "roundRect", { left: 360, top: 482, width: 862, height: 92 }, theme.softCopper, "#00000000", 0, "network control");
  addText(slide, slideNo, data.control, { left: 390, top: 512, width: 802, height: 30 }, {
    fontSize: 20,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "network control text",
  });
  addFooterBand(slide, slideNo, data.footer, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderTrainDeployMethod(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 920);
  addText(slide, slideNo, "训练链路：BC → DAgger", { left: 68, top: 178, width: 360, height: 28 }, {
    fontSize: 22,
    color: theme.bitRed,
    bold: true,
    face: TITLE_FACE,
    role: "train lane title",
  });
  const trainBoxes = data.train.map((title, idx) => ({ title, caption: data.trainCaptions[idx] || "" }));
  const trainPositions = [
    { left: 68, top: 224 },
    { left: 278, top: 224 },
    { left: 488, top: 224 },
    { left: 488, top: 320 },
    { left: 278, top: 320 },
    { left: 68, top: 320 },
  ];
  const tCards = trainBoxes.map((node, idx) => ({
    ...trainPositions[idx],
    width: 174,
    height: 72,
    node,
  }));
  tCards.forEach((card, idx) => {
    addFlowNode(slide, slideNo, card.node, card, { fill: "#FFFFFF", accent: theme.bitRed, role: "train node" });
  });
  addArrow(slide, slideNo, tCards[0], tCards[1], "train arrow");
  addArrow(slide, slideNo, tCards[1], tCards[2], "train arrow");
  addVerticalArrow(slide, slideNo, 560, 294, "train down arrow");
  addText(slide, slideNo, "←", { left: 452, top: 342, width: 36, height: 28 }, {
    fontSize: 25,
    color: theme.copper,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: null,
    role: "train left arrow",
  });
  addText(slide, slideNo, "←", { left: 242, top: 342, width: 36, height: 28 }, {
    fontSize: 25,
    color: theme.copper,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: null,
    role: "train left arrow",
  });
  addText(slide, slideNo, "部署链路：Policy → RACS → Controller", { left: 68, top: 464, width: 430, height: 28 }, {
    fontSize: 22,
    color: theme.bitGreen,
    bold: true,
    face: TITLE_FACE,
    role: "deploy lane title",
  });
  const dCards = data.deploy.map((title, idx) => ({ left: 68 + idx * 206, top: 510, width: 170, height: 74, node: { title, caption: data.deployCaptions[idx] || "" } }));
  dCards.forEach((card, idx) => {
    addFlowNode(slide, slideNo, card.node, card, { fill: theme.softGreen, accent: theme.bitGreen, role: "deploy node" });
    if (idx < dCards.length - 1) addArrow(slide, slideNo, card, dCards[idx + 1], "deploy arrow", theme.bitGreen);
  });
  addShape(slide, slideNo, "roundRect", { left: 760, top: 188, width: 462, height: 154 }, theme.softRed, "#00000000", 0, "bc formula");
  addText(slide, slideNo, "BC Loss", { left: 790, top: 212, width: 402, height: 26 }, { fontSize: 20, color: theme.bitRed, bold: true, face: TITLE_FACE, align: "center", role: "bc formula title" });
  addText(slide, slideNo, data.bcFormula, { left: 790, top: 252, width: 402, height: 34 }, { fontSize: 20, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "bc formula text" });
  addText(slide, slideNo, data.bcCaption, { left: 790, top: 296, width: 402, height: 26 }, { fontSize: 14, color: theme.muted, face: BODY_FACE, align: "center", role: "bc formula caption" });
  addShape(slide, slideNo, "roundRect", { left: 760, top: 370, width: 462, height: 154 }, theme.softCopper, "#00000000", 0, "racs formula box");
  addText(slide, slideNo, "RACS Projection", { left: 790, top: 394, width: 402, height: 26 }, { fontSize: 20, color: theme.bitGreen, bold: true, face: TITLE_FACE, align: "center", role: "racs formula title" });
  addText(slide, slideNo, data.racsFormula, { left: 790, top: 432, width: 402, height: 42 }, { fontSize: 18, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "racs formula text" });
  addText(slide, slideNo, data.racsCaption, { left: 790, top: 484, width: 402, height: 24 }, { fontSize: 14, color: theme.muted, face: BODY_FACE, align: "center", role: "racs formula caption" });
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderDaggerRacsResult(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  await addImageCard(slide, slideNo, { left: 58, top: 184, width: 536, height: 236 }, data.daggerImage, "图3.7：DAgger 高速碰撞事件收敛", "combined dagger");
  await addImageCard(slide, slideNo, { left: 58, top: 440, width: 536, height: 150 }, data.racsImage, "图3.15：RACS 降低 Command Jerk", "combined racs");
  addMiniClaimCard(slide, slideNo, "DAgger", "54 条 / 9.2%", "少量闭环偏离状态让高速段碰撞方差收敛。", { left: 628, top: 184, width: 280, height: 150 }, theme.bitRed);
  addMiniClaimCard(slide, slideNo, "RACS", "< 0.1 ms", "部署侧后处理，以极低开销约束相邻速度指令变化。", { left: 942, top: 184, width: 280, height: 150 }, theme.bitGreen);
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 628, top: 370, width: 594, height: 150 },
    { headerFill: theme.bitGreen, fontSize: 15, headerSize: 13, accentColumn: 2, role: "dagger racs comparison" },
  );
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderStreamMethod(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  addShape(slide, slideNo, "roundRect", { left: 58, top: 184, width: 520, height: 154 }, theme.softRed, "#00000000", 0, "batch box");
  addText(slide, slideNo, "Batch training", { left: 86, top: 208, width: 464, height: 26 }, { fontSize: 22, color: theme.bitRed, bold: true, face: TITLE_FACE, align: "center", role: "batch title" });
  addText(slide, slideNo, "{x_1, ..., x_T} → {y_1, ..., y_T}", { left: 86, top: 252, width: 464, height: 34 }, { fontSize: 20, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "batch formula" });
  addShape(slide, slideNo, "roundRect", { left: 58, top: 362, width: 520, height: 154 }, theme.softGreen, "#00000000", 0, "stream box");
  addText(slide, slideNo, "Streaming deployment", { left: 86, top: 386, width: 464, height: 26 }, { fontSize: 22, color: theme.bitGreen, bold: true, face: TITLE_FACE, align: "center", role: "stream title" });
  addText(slide, slideNo, "x_t + h_{t-1} → h_t → y_t", { left: 86, top: 430, width: 464, height: 34 }, { fontSize: 20, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "stream formula" });
  addShape(slide, slideNo, "roundRect", { left: 620, top: 184, width: 602, height: 74 }, theme.softCopper, "#00000000", 0, "equivalence box");
  addText(slide, slideNo, data.equivalence, { left: 650, top: 208, width: 542, height: 28 }, { fontSize: 21, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "equivalence text" });
  addSimpleTable(
    slide,
    slideNo,
    data.conditions.columns,
    data.conditions.rows,
    { left: 620, top: 278, width: 602, height: 144 },
    { headerFill: theme.bitGreen, fontSize: 15, headerSize: 13, accentColumn: 0, role: "stream conditions" },
  );
  addSimpleTable(
    slide,
    slideNo,
    data.lifecycle.columns,
    data.lifecycle.rows,
    { left: 620, top: 446, width: 602, height: 114 },
    { headerFill: theme.bitRed, fontSize: 14, headerSize: 13, accentColumn: 1, role: "stream lifecycle" },
  );
  addFooterBand(slide, slideNo, data.footer, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderAblationMethod(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  const left = 68;
  const top = 176;
  const width = 270;
  const height = 48;
  data.steps.forEach((step, idx) => {
    const y = top + idx * 58;
    addFlowNode(slide, slideNo, { title: step, caption: "" }, { left, top: y, width, height }, { fill: idx === data.steps.length - 1 ? theme.softGreen : "#FFFFFF", accent: idx === data.steps.length - 1 ? theme.bitGreen : theme.bitRed, role: "ablation step" });
    if (idx < data.steps.length - 1) addVerticalArrow(slide, slideNo, left + width / 2 - 14, y + height - 2, "ablation arrow");
  });
  addSimpleTable(
    slide,
    slideNo,
    data.variables.columns,
    data.variables.rows,
    { left: 382, top: 176, width: 840, height: 162 },
    { headerFill: theme.bitGreen, fontSize: 15, headerSize: 13, accentColumn: 0, role: "variables table" },
  );
  addSimpleTable(
    slide,
    slideNo,
    data.logic.columns,
    data.logic.rows,
    { left: 382, top: 366, width: 840, height: 162 },
    { headerFill: theme.bitRed, fontSize: 15, headerSize: 13, accentColumn: 2, role: "judgement table" },
  );
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderRiskMethod(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  const cards = data.flow.map((node, idx) => ({ left: 58 + idx * 228, top: 178, width: 184, height: 92, node }));
  cards.forEach((card, idx) => {
    addFlowNode(slide, slideNo, card.node, card, { fill: idx === 1 ? theme.softRed : "#FFFFFF", accent: idx === 1 ? theme.bitRed : theme.bitGreen, role: "risk flow node" });
    if (idx < cards.length - 1) addArrow(slide, slideNo, card, cards[idx + 1], "risk flow arrow");
  });
  addShape(slide, slideNo, "roundRect", { left: 58, top: 310, width: 540, height: 142 }, theme.softCopper, "#00000000", 0, "risk loss");
  addText(slide, slideNo, "Weighted Huber Loss", { left: 86, top: 334, width: 484, height: 26 }, { fontSize: 21, color: theme.bitRed, bold: true, face: TITLE_FACE, align: "center", role: "risk loss title" });
  addText(slide, slideNo, data.loss, { left: 86, top: 374, width: 484, height: 28 }, { fontSize: 20, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "risk loss formula" });
  addText(slide, slideNo, data.lossCaption, { left: 86, top: 414, width: 484, height: 22 }, { fontSize: 14, color: theme.muted, face: BODY_FACE, align: "center", role: "risk loss caption" });
  addShape(slide, slideNo, "roundRect", { left: 628, top: 310, width: 594, height: 142 }, theme.softGreen, "#00000000", 0, "omega box");
  addText(slide, slideNo, "Omega-event", { left: 656, top: 334, width: 538, height: 26 }, { fontSize: 21, color: theme.bitGreen, bold: true, face: TITLE_FACE, align: "center", role: "omega title" });
  addText(slide, slideNo, data.omega, { left: 656, top: 374, width: 538, height: 28 }, { fontSize: 20, color: theme.ink, bold: true, face: MONO_FACE, align: "center", role: "omega formula method" });
  addText(slide, slideNo, data.omegaCaption, { left: 656, top: 414, width: 538, height: 22 }, { fontSize: 14, color: theme.muted, face: BODY_FACE, align: "center", role: "omega method caption" });
  addSimpleTable(
    slide,
    slideNo,
    data.versions.columns,
    data.versions.rows,
    { left: 58, top: 482, width: 1164, height: 108 },
    { headerFill: theme.bitGreen, fontSize: 14, headerSize: 13, accentColumn: 2, role: "risk versions" },
  );
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderLimitations(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  addBulletPanel(slide, slideNo, data.limits, { left: 58, top: 246, width: 540, height: 300 }, { accent: theme.bitRed, fontSize: 17, role: "limits panel" });
  addBulletPanel(slide, slideNo, data.future, { left: 682, top: 246, width: 540, height: 300 }, { accent: theme.bitGreen, fontSize: 17, role: "future panel" });
  addText(slide, slideNo, "局限", { left: 82, top: 204, width: 120, height: 26 }, { fontSize: 24, color: theme.bitRed, bold: true, face: TITLE_FACE, autoFit: null, role: "limits label" });
  addText(slide, slideNo, "下一步", { left: 706, top: 204, width: 120, height: 26 }, { fontSize: 24, color: theme.bitGreen, bold: true, face: TITLE_FACE, autoFit: null, role: "future label" });
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

function renderAppendixProtocol(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 900);
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 58, top: 184, width: 1164, height: 252 },
    { headerFill: theme.bitGreen, fontSize: 15, headerSize: 14, accentColumn: 0, role: "appendix protocol table" },
  );
  addBulletPanel(slide, slideNo, data.notes, { left: 58, top: 466, width: 1164, height: 124 }, { accent: theme.bitRed, fontSize: 16, role: "appendix protocol notes" });
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderMainEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 780);
  await addImageCard(slide, slideNo, { left: 58, top: 188, width: 708, height: 302 }, data.mainImage, "图3.5：ViT+Mamba vs ViT+LSTM", "main result");
  await addImageCard(slide, slideNo, { left: 58, top: 506, width: 708, height: 84 }, data.stripImage, "图3.6：System Timing Consistency", "timing strip");
  addShape(slide, slideNo, "roundRect", { left: 790, top: 188, width: 432, height: 56 }, theme.softGreen, "#00000000", 0, "main control note");
  addText(slide, slideNo, data.control, { left: 812, top: 202, width: 388, height: 28 }, {
    fontSize: 16,
    color: theme.bitGreen,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "main control text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 790, top: 262, width: 432, height: 146 }, { accent: theme.bitRed, fontSize: 15, role: "main bullets" });
  addStatCard(slide, slideNo, data.stats[0][0], data.stats[0][1], { left: 790, top: 426, width: 432, height: 76 });
  addStatCard(slide, slideNo, data.stats[1][0], data.stats[1][1], { left: 790, top: 514, width: 432, height: 76 });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderDaggerEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 820);
  await addImageCard(slide, slideNo, { left: 58, top: 186, width: 720, height: 296 }, data.topImage, "图3.7：DAgger 轮次碰撞事件次数", "dagger top");
  addShape(slide, slideNo, "roundRect", { left: 58, top: 500, width: 720, height: 90 }, theme.softGreen, "#00000000", 0, "dagger protocol strip");
  addText(slide, slideNo, data.protocol, { left: 86, top: 522, width: 664, height: 44 }, {
    fontSize: 19,
    color: theme.bitGreen,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "dagger protocol text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 802, top: 186, width: 420, height: 214 }, { accent: theme.bitGreen, fontSize: 16, role: "dagger bullets" });
  addMiniClaimCard(slide, slideNo, data.efficiency[0], data.efficiency[1], data.efficiency[2], { left: 802, top: 420, width: 200, height: 170 }, theme.bitRed);
  addMiniClaimCard(slide, slideNo, data.efficiency2[0], data.efficiency2[1], data.efficiency2[2], { left: 1022, top: 420, width: 200, height: 170 }, theme.bitGreen);
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderRacsEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 800);
  await addImageCard(slide, slideNo, { left: 58, top: 186, width: 700, height: 280 }, data.mainImage, "图3.15：Command Jerk 随速度变化", "racs main");
  addShape(slide, slideNo, "roundRect", { left: 58, top: 484, width: 700, height: 106 }, theme.softCopper, "#00000000", 0, "racs formula");
  addText(slide, slideNo, data.formula, { left: 86, top: 506, width: 644, height: 28 }, {
    fontSize: 18,
    color: theme.ink,
    bold: true,
    face: MONO_FACE,
    align: "center",
    role: "racs formula text",
  });
  addText(slide, slideNo, data.definition, { left: 86, top: 542, width: 644, height: 24 }, {
    fontSize: 15,
    color: theme.muted,
    face: BODY_FACE,
    align: "center",
    role: "racs definition text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 784, top: 186, width: 438, height: 226 }, { accent: theme.bitRed, fontSize: 16, role: "racs bullets" });
  addShape(slide, slideNo, "roundRect", { left: 784, top: 432, width: 438, height: 158 }, theme.softRed, "#00000000", 0, "racs metric");
  addText(slide, slideNo, "< 0.1 ms", { left: 814, top: 456, width: 378, height: 38 }, {
    fontSize: 34,
    color: theme.bitRed,
    bold: true,
    face: TITLE_FACE,
    align: "center",
    autoFit: null,
    role: "racs metric value",
  });
  addText(slide, slideNo, data.metric, { left: 810, top: 504, width: 386, height: 58 }, {
    fontSize: 16,
    color: theme.ink,
    face: BODY_FACE,
    align: "center",
    role: "racs metric text",
  });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderTrapEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 780);
  await addImageCard(slide, slideNo, { left: 58, top: 184, width: 560, height: 308 }, data.leftImage, "图4.5：轨迹漂移对比", "trap left");
  addShape(slide, slideNo, "roundRect", { left: 634, top: 184, width: 588, height: 56 }, theme.softRed, "#00000000", 0, "trap condition");
  addText(slide, slideNo, data.condition, { left: 662, top: 200, width: 532, height: 24 }, {
    fontSize: 16,
    color: theme.bitRed,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "trap condition text",
  });
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 634, top: 256, width: 588, height: 236 },
    { headerFill: theme.bitRed, fontSize: 17, headerSize: 14, accentColumn: 2, role: "trap comparison table" },
  );
  await addImageCard(slide, slideNo, { left: 58, top: 508, width: 1164, height: 82 }, data.stripImage, "图4.7：重置频率消融", "trap strip");
  addFooterBand(slide, slideNo, data.note, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderProtocolEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 790);
  await addImageCard(slide, slideNo, { left: 58, top: 186, width: 676, height: 178 }, data.topImage, "图4.3：状态生命周期状态机", "protocol top");
  await addImageCard(slide, slideNo, { left: 58, top: 378, width: 676, height: 212 }, data.bottomImage, "图4.4：Batch / Stream / Reset 时间轴", "protocol bottom");
  let cTop = 186;
  for (const item of data.conditions) {
    addShape(slide, slideNo, "roundRect", { left: 756, top: cTop, width: 466, height: 54 }, theme.softGreen, "#00000000", 0, "protocol condition");
    addText(slide, slideNo, item, { left: 782, top: cTop + 13, width: 414, height: 24 }, {
      fontSize: 17,
      color: theme.bitGreen,
      bold: true,
      face: BODY_FACE,
      align: "center",
      role: "protocol condition text",
    });
    cTop += 66;
  }
  addBulletPanel(slide, slideNo, data.bullets, { left: 756, top: 390, width: 466, height: 88 }, { accent: theme.bitGreen, fontSize: 15, role: "protocol bullets v2" });
  addShape(slide, slideNo, "roundRect", { left: 756, top: 500, width: 466, height: 90 }, theme.softCopper, "#00000000", 0, "protocol metric");
  addText(slide, slideNo, data.metric, { left: 782, top: 522, width: 414, height: 48 }, {
    fontSize: 18,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "protocol metric text",
  });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderSsmBottleneck(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 830);
  await addImageCard(slide, slideNo, { left: 58, top: 182, width: 720, height: 252 }, data.topImage, "图5.19：第5章迭代路径总览", "ssm top");
  addMiniClaimCard(slide, slideNo, data.stats[0][0], data.stats[0][1], data.stats[0][2], { left: 804, top: 182, width: 418, height: 118 }, theme.bitGreen);
  addMiniClaimCard(slide, slideNo, data.stats[1][0], data.stats[1][1], data.stats[1][2], { left: 804, top: 316, width: 418, height: 118 }, theme.bitRed);
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 58, top: 456, width: 1164, height: 134 },
    { headerFill: theme.bitGreen, fontSize: 15, headerSize: 14, accentColumn: 2, role: "ssm logic table" },
  );
  addFooterBand(slide, slideNo, data.footer, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderDistillEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 810);
  const stageWidth = 352;
  const stageTop = 192;
  data.stages.forEach((stage, idx) => {
    const left = 58 + idx * 404;
    addShape(slide, slideNo, "roundRect", { left, top: stageTop, width: stageWidth, height: 178 }, idx === 1 ? theme.softRed : theme.softGreen, "#00000000", 0, "distill stage");
    addText(slide, slideNo, stage.name, { left: left + 18, top: stageTop + 16, width: stageWidth - 36, height: 26 }, {
      fontSize: 22,
      color: idx === 1 ? theme.bitRed : theme.bitGreen,
      bold: true,
      face: TITLE_FACE,
      align: "center",
      autoFit: null,
      role: "distill stage title",
    });
    addText(slide, slideNo, stage.metric, { left: left + 18, top: stageTop + 56, width: stageWidth - 36, height: 40 }, {
      fontSize: 25,
      color: theme.ink,
      bold: true,
      face: TITLE_FACE,
      align: "center",
      role: "distill stage metric",
    });
    addText(slide, slideNo, stage.caption, { left: left + 24, top: stageTop + 108, width: stageWidth - 48, height: 48 }, {
      fontSize: 14,
      color: theme.muted,
      face: BODY_FACE,
      align: "center",
      role: "distill stage caption",
    });
    if (idx < data.stages.length - 1) {
      addText(slide, slideNo, "→", { left: left + stageWidth + 12, top: stageTop + 72, width: 38, height: 38 }, {
        fontSize: 30,
        color: theme.copper,
        bold: true,
        face: TITLE_FACE,
        align: "center",
        autoFit: null,
        role: "distill stage arrow",
      });
    }
  });
  addShape(slide, slideNo, "roundRect", { left: 58, top: 394, width: 560, height: 126 }, theme.softCopper, "#00000000", 0, "omega formula");
  addText(slide, slideNo, data.formula, { left: 86, top: 420, width: 504, height: 30 }, {
    fontSize: 20,
    color: theme.ink,
    bold: true,
    face: MONO_FACE,
    align: "center",
    role: "omega formula text",
  });
  addText(slide, slideNo, data.formulaCaption, { left: 86, top: 464, width: 504, height: 30 }, {
    fontSize: 15,
    color: theme.muted,
    face: BODY_FACE,
    align: "center",
    role: "omega caption text",
  });
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 646, top: 394, width: 576, height: 126 },
    { headerFill: theme.bitRed, fontSize: 15, headerSize: 13, accentColumn: 2, role: "distill fail table" },
  );
  addBulletPanel(slide, slideNo, data.bullets, { left: 58, top: 532, width: 1164, height: 88 }, { accent: theme.bitGreen, fontSize: 15, role: "distill bullets" });
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderFinalEvidence(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 810);
  addSimpleTable(
    slide,
    slideNo,
    data.table.columns,
    data.table.rows,
    { left: 58, top: 184, width: 760, height: 338 },
    { headerFill: theme.bitRed, fontSize: 15, headerSize: 13, accentColumn: 3, role: "final result table" },
  );
  addMiniClaimCard(slide, slideNo, "OOD 高速效率", "Mean Vx +40%–45%", "Trees 9/12 m/s 高速段前向速度提升，说明不是靠降速换安全。", { left: 844, top: 184, width: 378, height: 108 }, theme.bitGreen);
  addMiniClaimCard(slide, slideNo, "实时闭环", "21–23 ms", "最终模型评测口径下推理延迟，仍低于 50 ms 闭环阈值。", { left: 844, top: 310, width: 378, height: 108 }, theme.bitRed);
  addShape(slide, slideNo, "roundRect", { left: 844, top: 436, width: 378, height: 86 }, theme.softCopper, "#00000000", 0, "final caveat");
  addText(slide, slideNo, data.caveat, { left: 866, top: 456, width: 334, height: 44 }, {
    fontSize: 15,
    color: theme.ink,
    bold: true,
    face: BODY_FACE,
    align: "center",
    role: "final caveat text",
  });
  addBulletPanel(slide, slideNo, data.bullets, { left: 58, top: 538, width: 1164, height: 52 }, { accent: theme.bitGreen, fontSize: 15, role: "final bullets v3" });
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderAppendixGrid4(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 860);
  const cards = [
    { left: 58, top: 182, width: 560, height: 190 },
    { left: 662, top: 182, width: 560, height: 190 },
    { left: 58, top: 392, width: 560, height: 190 },
    { left: 662, top: 392, width: 560, height: 190 },
  ];
  for (let i = 0; i < data.images.length; i += 1) {
    await addImageCard(slide, slideNo, cards[i], data.images[i], data.labels[i], `appendix4 card ${i + 1}`);
  }
  addFooterBand(slide, slideNo, data.footer, theme.bitGreen);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function renderAppendixGrid5(slide, slideNo, data) {
  slide.background.fill = theme.warmWhite;
  addHeader(slide, slideNo, data.kicker);
  addTitle(slide, slideNo, data.title, 82, 860);
  const cards = [
    { left: 58, top: 182, width: 368, height: 168 },
    { left: 456, top: 182, width: 368, height: 168 },
    { left: 854, top: 182, width: 368, height: 168 },
    { left: 156, top: 374, width: 412, height: 208 },
    { left: 712, top: 374, width: 412, height: 208 },
  ];
  for (let i = 0; i < data.images.length; i += 1) {
    await addImageCard(slide, slideNo, cards[i], data.images[i], data.labels[i], `appendix5 card ${i + 1}`);
  }
  addFooterBand(slide, slideNo, data.footer, theme.bitRed);
  addSpeakerNotes(slide, data.speakerNotes);
}

async function buildPresentation() {
  await ensureDirs();
  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  for (const [index, data] of slideDeck.entries()) {
    const slideNo = index + 1;
    const slide = presentation.slides.add();
    switch (data.type) {
      case "cover":
        await renderCover(slide, slideNo, data);
        break;
      case "agenda":
        renderAgenda(slide, slideNo, data);
        break;
      case "background-evidence":
        await renderBackgroundEvidence(slide, slideNo, data);
        break;
      case "merged-intro":
        await renderMergedIntro(slide, slideNo, data);
        break;
      case "problem-evidence":
        await renderProblemEvidence(slide, slideNo, data);
        break;
      case "framework-evidence":
        await renderFrameworkEvidence(slide, slideNo, data);
        break;
      case "route-protocol":
        renderRouteProtocol(slide, slideNo, data);
        break;
      case "platform-v2":
        await renderPlatformV2(slide, slideNo, data);
        break;
      case "network-method":
        await renderNetworkMethod(slide, slideNo, data);
        break;
      case "train-deploy-method":
        renderTrainDeployMethod(slide, slideNo, data);
        break;
      case "main-evidence":
        await renderMainEvidence(slide, slideNo, data);
        break;
      case "dagger-evidence":
        await renderDaggerEvidence(slide, slideNo, data);
        break;
      case "dagger-racs-result":
        await renderDaggerRacsResult(slide, slideNo, data);
        break;
      case "racs-evidence":
        await renderRacsEvidence(slide, slideNo, data);
        break;
      case "stream-method":
        renderStreamMethod(slide, slideNo, data);
        break;
      case "trap-evidence":
        await renderTrapEvidence(slide, slideNo, data);
        break;
      case "protocol-evidence":
        await renderProtocolEvidence(slide, slideNo, data);
        break;
      case "ablation-method":
        renderAblationMethod(slide, slideNo, data);
        break;
      case "ssm-bottleneck":
        await renderSsmBottleneck(slide, slideNo, data);
        break;
      case "risk-method":
        renderRiskMethod(slide, slideNo, data);
        break;
      case "distill-evidence":
        await renderDistillEvidence(slide, slideNo, data);
        break;
      case "final-evidence":
        await renderFinalEvidence(slide, slideNo, data);
        break;
      case "limitations":
        renderLimitations(slide, slideNo, data);
        break;
      case "appendix-protocol":
        renderAppendixProtocol(slide, slideNo, data);
        break;
      case "appendix-grid4":
        await renderAppendixGrid4(slide, slideNo, data);
        break;
      case "appendix-grid5":
        await renderAppendixGrid5(slide, slideNo, data);
        break;
      case "challenge":
        await renderChallenge(slide, slideNo, data);
        break;
      case "platform":
        await renderPlatform(slide, slideNo, data);
        break;
      case "dual-result":
        await renderDualResult(slide, slideNo, data);
        break;
      case "trap":
        await renderTrap(slide, slideNo, data);
        break;
      case "protocol":
        renderProtocol(slide, slideNo, data);
        break;
      case "final-result":
        await renderFinal(slide, slideNo, data);
        break;
      case "conclusion":
        renderConclusion(slide, slideNo, data);
        break;
      case "thanks":
        await renderThanks(slide, slideNo, data);
        break;
      case "image-bullets":
        await renderImageBullets(slide, slideNo, data, slideNo % 2 === 1 && slideNo !== 3 ? true : false);
        break;
      case "result":
        await renderResult(slide, slideNo, data, slideNo % 2 === 1 && slideNo !== 7 ? true : false);
        break;
      default:
        throw new Error(`Unknown slide type: ${data.type}`);
    }
  }
  return presentation;
}

async function writeSupportFiles() {
  const speechPath = path.join(OUT_BASE, "speech_notes_v4.md");
  const figurePath = path.join(OUT_BASE, "figure_map_v4.md");
  const speechParts = ["# Speech Notes v4", ""];
  const figureRows = [
    "# Figure / Table Evidence Map v4",
    "",
    "| PPT页 | 标题 | thesis图/表/正文依据 | thesis页码/章节 | 使用方式 / 本地素材 |",
    "|---|---|---|---|---|",
  ];
  slideDeck.forEach((slide, index) => {
    const slideNo = index + 1;
    speechParts.push(`## Slide ${slideNo} · ${slide.title}`);
    speechParts.push(slide.speakerNotes || "");
    speechParts.push("");
    if ((slide.figures || []).length === 0) {
      figureRows.push(`| ${slideNo} | ${slide.title} | - | - | - |`);
      return;
    }
    for (const fig of slide.figures) {
      figureRows.push(`| ${slideNo} | ${slide.title} | ${fig.figure} | ${fig.page} | ${fig.source} |`);
    }
  });
  await fs.writeFile(speechPath, speechParts.join("\n"), "utf8");
  await fs.writeFile(figurePath, figureRows.join("\n") + "\n", "utf8");
}

async function saveBlob(blob, filePath) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function writeInspect(presentation) {
  const records = [
    {
      kind: "deck",
      slideCount: presentation.slides.count,
      slideSize: { width: W, height: H },
    },
    ...inspectRecords,
  ];
  await fs.writeFile(INSPECT_PATH, records.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8");
}

async function exportDeck(presentation) {
  await writeInspect(presentation);
  for (let index = 0; index < presentation.slides.items.length; index += 1) {
    const slide = presentation.slides.items[index];
    const previewBlob = await presentation.export({ slide, format: "png", scale: 1 });
    await saveBlob(previewBlob, path.join(PREVIEW_DIR, `slide-${String(index + 1).padStart(2, "0")}.png`));
  }
  const pptxBlob = await PresentationFile.exportPptx(presentation);
  const outputPath = path.join(OUT_DIR, "output_v4.pptx");
  await pptxBlob.save(outputPath);
  return outputPath;
}

const presentation = await buildPresentation();
await writeSupportFiles();
const outputPath = await exportDeck(presentation);
console.log(outputPath);

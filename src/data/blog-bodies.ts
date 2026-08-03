import type { BlogBlock } from "@/data/blog";

/**
 * Long-form copy for the demo posts, keyed by slug.
 * Replaced automatically as soon as the admin panel sends a body/content field.
 */
export const DEMO_BODIES: Record<string, BlogBlock[]> = {
  "reading-a-gauge-swatch": [
    {
      type: "p",
      text: "A gauge swatch is the cheapest insurance in crochet and knitting. Ten minutes of yarn and a square of fabric decide whether the sweater you spend six weeks on fits the person you made it for.",
    },
    { type: "h2", text: "Swatch bigger than you think you need" },
    {
      type: "p",
      text: "Work at least 15cm square. Edge stitches lie differently from the middle of a fabric, so a tiny swatch measures the edges more than the body. Work the swatch in the exact stitch pattern the garment uses — single crochet and half double crochet do not behave the same way, and neither do stocking stitch and rib.",
    },
    { type: "h2", text: "Block it the way you will wash it" },
    {
      type: "p",
      text: "Soak the swatch in lukewarm water with a drop of mild soap, press the water out in a towel and lay it flat without stretching. Cotton relaxes. Acrylic settles and rarely moves again. Wool blooms and can grow by a full stitch over 10cm. Measuring before blocking tells you nothing about the finished garment.",
    },
    {
      type: "quote",
      text: "The swatch is not a formality. It is the first row of the garment, worked honestly.",
    },
    { type: "h2", text: "When the numbers disagree with the pattern" },
    {
      type: "p",
      text: "If you have more stitches per 10cm than the pattern asks for, your fabric is tighter — go up a hook or needle size. Fewer stitches means a looser fabric, so go down. Change hook size before you change yarn: the same base in the same weight can hit two different gauges in two different hands.",
    },
    {
      type: "p",
      text: "Note the finished numbers, the hook, the lot number and the date on a paper tag and keep the swatch. A drawer of labelled swatches is the most useful reference book you will ever own.",
    },
  ],
  "how-to-read-a-yarn-label": [
    {
      type: "p",
      text: "Every band around a ball of yarn is a small specification sheet. Once you know the order in which the information appears, you can judge a yarn in about five seconds.",
    },
    { type: "h2", text: "Fibre, weight, length" },
    {
      type: "p",
      text: "Fibre content tells you how the finished fabric will behave: acrylic holds shape and washes hard, cotton breathes and drapes, wool blooms and insulates. Ball weight and length together give you the real information — 100g over 250m is a chunky yarn, 100g over 500m is a fine one.",
    },
    { type: "h2", text: "Hook, needle and gauge" },
    {
      type: "p",
      text: "The recommended hook or needle size and the gauge square printed beside it are a starting point, not a rule. They describe the mill's tension, not yours. Swatch anyway.",
    },
    { type: "h2", text: "Dye lot" },
    {
      type: "p",
      text: "The lot number is the one line most people ignore and later regret ignoring. Buy every ball for a project from the same lot, and buy one more than you need.",
    },
  ],
  "why-dye-lots-matter": [
    {
      type: "p",
      text: "Two skeins of the same shade dyed two weeks apart can be almost identical in the ball and clearly different across a finished blanket. Nothing has gone wrong — that is how dyeing works.",
    },
    { type: "h2", text: "What changes between lots" },
    {
      type: "p",
      text: "Water temperature, the exact minutes in the vat, humidity in the drying room and the base yarn's own absorbency all shift the final depth of shade by a fraction. Across a wide flat piece, a fraction reads as a stripe.",
    },
    {
      type: "quote",
      text: "You never see a dye lot difference in the ball. You see it in the twelfth row.",
    },
    { type: "h2", text: "The fix: alternate balls" },
    {
      type: "p",
      text: "If you must mix lots, alternate two balls every two rows. The change becomes a gradient your eye reads as texture instead of a hard line. For garments, work the whole yoke from one lot so the difference falls somewhere less visible.",
    },
  ],
  "cotton-vs-acrylic": [
    {
      type: "p",
      text: "Neither fibre is better. They solve different problems, and most of the disappointment we hear about comes from asking one to do the other's job.",
    },
    { type: "h2", text: "Cotton" },
    {
      type: "p",
      text: "Dense, cool, with beautiful stitch definition and a drape that gets better with washing. It has no memory, so ribbing stretches out and stays out. Ideal for summer tops, bags, market totes, dishcloths and amigurumi that needs crisp shaping.",
    },
    { type: "h2", text: "Acrylic" },
    {
      type: "p",
      text: "Light, warm, springy and forgiving in the wash — which is exactly what a baby blanket, a school jumper or a first project needs. It resists moths, holds bright shades well and costs less per metre.",
    },
    { type: "h2", text: "Choosing quickly" },
    {
      type: "p",
      text: "Will it be washed often by someone who is not you? Acrylic. Does it need to breathe against skin in warm weather? Cotton. Does it need to hold a sculpted shape? Cotton. Does it need to be soft, warm and affordable at blanket scale? Acrylic.",
    },
  ],
  "inside-a-small-batch-dye-day": [
    {
      type: "p",
      text: "A dye day is one vat, one shade and one afternoon. By evening the yarn is hanging in the drying room and the log book has a new page.",
    },
    { type: "h2", text: "Morning: the base" },
    {
      type: "p",
      text: "Skeins are weighed, pre-soaked and left to wet out completely. Yarn that has not absorbed water evenly cannot take dye evenly, and no amount of stirring later will fix it.",
    },
    { type: "h2", text: "Afternoon: the vat" },
    {
      type: "p",
      text: "Dye goes in cold, heat rises slowly and the skeins are turned gently. Rushing the temperature is what makes a shade blotchy. When the water clears, the fibre has taken everything it will take.",
    },
    { type: "h2", text: "Evening: the log book" },
    {
      type: "p",
      text: "Grams of dye, litres of water, minutes at temperature, the lot number and a snipped length of the finished yarn taped to the page. That page is the only reason we can repeat a shade six months later.",
    },
  ],
  "amigurumi-yarn-guide": [
    {
      type: "p",
      text: "Amigurumi is worked tightly and stuffed firmly, which puts demands on yarn that a scarf never will.",
    },
    { type: "h2", text: "Stitch definition first" },
    {
      type: "p",
      text: "A smooth, tightly twisted yarn keeps every single crochet visible, so faces read clearly and increases stay countable. Fluffy or loosely spun yarn hides the stitches and makes shaping guesswork.",
    },
    { type: "h2", text: "Stop the stuffing showing through" },
    {
      type: "p",
      text: "Work a hook size or two smaller than the label suggests. The fabric should feel stiff in your hand — if you can see light through the swatch, the stuffing will show through the finished toy.",
    },
    { type: "h2", text: "Safety and washing" },
    {
      type: "p",
      text: "For anything a small child will hold, choose a machine-washable base, embroider the features instead of using plastic eyes, and close every seam twice.",
    },
  ],
  "baby-safe-dyes": [
    {
      type: "p",
      text: "\"Baby-safe\" is not a marketing word for us. It is a short list of tests a shade has to pass before it goes anywhere near a blanket.",
    },
    { type: "h2", text: "Colour fastness" },
    {
      type: "p",
      text: "A sample is rubbed dry and wet against white cotton, and soaked in warm water with mild soap. Any colour that transfers means the shade goes back to the vat, not to the shelf.",
    },
    { type: "h2", text: "Residue and rinse" },
    {
      type: "p",
      text: "Skeins are rinsed until the water runs clear and pH-neutral. Leftover dye or fixative is what irritates skin, so this stage is not shortened.",
    },
    { type: "h2", text: "Handle after washing" },
    {
      type: "p",
      text: "The last test is the simplest: wash the swatch three times and hold it against your wrist. If it has gone scratchy, the shade is fine for a bag and wrong for a baby.",
    },
  ],
  "winding-a-centre-pull-cake": [
    {
      type: "p",
      text: "A well wound cake feeds from the centre without collapsing and without stretching the yarn on the way in. Three things decide whether that happens.",
    },
    { type: "h2", text: "Tension" },
    {
      type: "p",
      text: "Wind loose. Yarn wound under tension stays stretched for weeks, which quietly changes your gauge and slackens the finished fabric once it relaxes.",
    },
    { type: "h2", text: "Angle" },
    {
      type: "p",
      text: "Crossing layers at an angle is what stops the cake telescoping. Straight, stacked layers slide into each other the moment you pull from the centre.",
    },
    { type: "h2", text: "Speed" },
    {
      type: "p",
      text: "Slow and even beats fast and enthusiastic. Fast winding heats and stretches the strand, and heat is what sets that stretch in place.",
    },
  ],
  "building-a-colour-card": [
    {
      type: "p",
      text: "A colour card is only useful if it tells the truth about the yarn you will actually receive. Ours is built from the yarn, not from a screen.",
    },
    { type: "h2", text: "One swatch per lot" },
    {
      type: "p",
      text: "Every lot is swatched, blocked and pinned to the wall with its number and date. Shades drift over years; the wall shows the drift instead of hiding it.",
    },
    { type: "h2", text: "Photograph in the same light" },
    {
      type: "p",
      text: "Same window, same time of day, no filters. A shade photographed in warm evening light can look like a different colour family entirely.",
    },
    {
      type: "quote",
      text: "If the card and the skein disagree, the card is wrong. Reshoot it.",
    },
  ],
  "washing-hand-knits": [
    {
      type: "p",
      text: "Most hand-knits are not ruined by wear. They are ruined in ten minutes at the sink.",
    },
    { type: "h2", text: "Water and soap" },
    {
      type: "p",
      text: "Lukewarm water, a small amount of mild soap, no agitation. Heat and rubbing are what felt wool. Let the piece sit for ten minutes and rinse at the same temperature.",
    },
    { type: "h2", text: "Getting the water out" },
    {
      type: "p",
      text: "Never wring. Press the piece between your palms, then roll it in a dry towel and press again. A wet garment lifted by its shoulders will stretch and stay stretched.",
    },
    { type: "h2", text: "Drying flat" },
    {
      type: "p",
      text: "Lay it flat, pat it back to its measurements and leave it away from direct sun and radiators. This one habit keeps shape for years.",
    },
  ],
};

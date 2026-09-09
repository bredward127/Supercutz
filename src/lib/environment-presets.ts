// Selectable environment prompt fragments for the "Environment description"
// field. Data only — each preset's `prompt` is inserted into the field
// verbatim when selected; the field stays freely editable afterward.

export interface EnvironmentPreset {
  id: string;
  label: string;
  prompt: string;
}

export const CUSTOM_ENVIRONMENT_PRESET_ID = "custom";

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    id: "modern-home-office",
    label: "Modern Home Office",
    prompt:
      "A clean, modern home office with a tidy desk, a laptop, soft natural window light, and minimal decor in the background. Preserve the presenter's face, body, and motion exactly as they appear in the source footage — only the room around them changes.",
  },
  {
    id: "night-seller-desk-3am-workspace",
    label: "Night Seller Desk / 3AM Workspace",
    prompt:
      "A dim home office late at night, lit mainly by a single desk lamp and a glowing monitor, with a dark window behind — the scrappy, dedicated feel of an online seller working at 3AM. Keep the presenter's identity, expressions, and movements unchanged from the source video; only the lighting and room change.",
  },
  {
    id: "ecommerce-packing-station",
    label: "Ecommerce Packing Station",
    prompt:
      "A small ecommerce packing station covered in shipping boxes, bubble wrap, and a roll of packing tape, with shelves of inventory visible behind. Do not alter the presenter's appearance or motion — only the surrounding workspace changes.",
  },
  {
    id: "warehouse-aisle",
    label: "Warehouse Aisle",
    prompt:
      "A tall warehouse aisle lined with industrial metal shelving stocked with boxes, a concrete floor, and overhead fluorescent lighting. Keep the presenter exactly as filmed — same face, body, and motion — and swap only the environment around them.",
  },
  {
    id: "clean-product-studio-table",
    label: "Clean Product Studio Table",
    prompt:
      "A minimal product photography setup: a seamless white or light-gray backdrop, soft diffused studio lighting, and a clean table surface for displaying a product. Preserve the presenter's identity and motion unchanged from the source footage; only the backdrop and table change.",
  },
  {
    id: "bright-listing-kitchen",
    label: "Bright Listing Kitchen",
    prompt:
      "A bright, staged kitchen typical of a real estate listing — white cabinetry, marble countertops, stainless appliances, and large windows letting in daylight. The presenter's face, body, and actions must stay identical to the source footage; only the kitchen setting changes.",
  },
  {
    id: "staged-living-room",
    label: "Staged Living Room",
    prompt:
      "A tastefully staged living room with a neutral sofa, a coffee table, and an area rug, lit with soft natural light in the style of a real estate listing. Do not change the presenter's identity or movement; only the room around them changes.",
  },
  {
    id: "open-house-entryway",
    label: "Open-House Entryway",
    prompt:
      "A welcoming home entryway with a clean front door, a console table, and natural daylight — set up as if for an open house. Keep the presenter exactly as they appear in the source video; only the entryway changes.",
  },
  {
    id: "real-estate-agent-office",
    label: "Real Estate Agent Office",
    prompt:
      "A tidy real estate agent's office with a desk, a laptop, property flyers or a small listing sign, and tasteful professional decor. Preserve the presenter's identity, expression, and motion from the source footage exactly; only the office setting changes.",
  },
  {
    id: "front-porch-curb-appeal",
    label: "Front Porch / Curb Appeal",
    prompt:
      "A home's front porch and curb view, with a clean doorway, porch furniture or planters, and daylight showing a well-kept exterior. The presenter's face, body, and movements must stay exactly as filmed; only the exterior setting changes.",
  },
  {
    id: "kitchen-sink-repair",
    label: "Kitchen Sink Repair",
    prompt:
      "Under or beside a kitchen sink mid-repair, with visible pipes, a wrench or tools nearby, and a cabinet door open — a realistic plumbing work setting. Keep the presenter's identity and motion unchanged from the source video; only the repair environment changes.",
  },
  {
    id: "bathroom-vanity-repair",
    label: "Bathroom Vanity Repair",
    prompt:
      "A bathroom vanity mid-repair, with an open cabinet or exposed plumbing beneath the sink, tools laid out nearby, and tile visible behind. Preserve the presenter exactly as they appear in the source footage; only the bathroom setting changes.",
  },
  {
    id: "basement-utility-room",
    label: "Basement Utility Room",
    prompt:
      "A basement utility room with a water heater, exposed pipes or ductwork, a concrete floor, and dim overhead lighting — a realistic home-service setting. Do not alter the presenter's identity, face, or movements; only the utility room changes.",
  },
  {
    id: "service-van-interior",
    label: "Service Van Interior",
    prompt:
      "The interior of a service or contractor van, with shelving of tools and supplies, an organized cargo area, and the side door open to daylight. Keep the presenter's body, face, and motion exactly as in the source footage; only the van interior changes.",
  },
  {
    id: "customer-front-door",
    label: "Customer Front Door",
    prompt:
      "A customer's front doorstep as seen from a technician's point of view, with a porch, a doorbell, and the exterior of a home — as if arriving for a service call. Preserve the presenter's identity and movement unchanged from the source video; only the doorstep environment changes.",
  },
  {
    id: "gym-floor",
    label: "Gym Floor",
    prompt:
      "An open gym floor with workout equipment, mirrors along one wall, and bright overhead lighting — a typical fitness studio setting. The presenter's face, body, and actions must remain identical to the source footage; only the gym environment changes.",
  },
  {
    id: "grocery-store-aisle",
    label: "Grocery Store Aisle",
    prompt:
      "A well-lit grocery store aisle with stocked shelves of products on either side and a clean floor. Keep the presenter exactly as they appear in the source video — same identity and motion; only the aisle around them changes.",
  },
  {
    id: "coffee-shop",
    label: "Coffee Shop",
    prompt:
      "A cozy coffee shop interior with a counter, an espresso machine, a few tables, and warm ambient lighting. Preserve the presenter's identity, expression, and motion from the source footage exactly; only the coffee shop setting changes.",
  },
  {
    id: "parking-lot-street",
    label: "Parking Lot / Street",
    prompt:
      "An outdoor parking lot or street setting with parked cars, pavement, daylight, and an urban or suburban backdrop. Do not change the presenter's face, body, or movements; only the outdoor environment changes.",
  },
  {
    id: "minimal-white-studio",
    label: "Minimal White Studio",
    prompt:
      "A minimal, seamless white studio backdrop with soft, even lighting and no distracting props. Keep the presenter's identity and motion exactly as filmed; only the background changes to this plain studio.",
  },
];

export function getEnvironmentPresetById(id: string): EnvironmentPreset | undefined {
  return ENVIRONMENT_PRESETS.find((preset) => preset.id === id);
}

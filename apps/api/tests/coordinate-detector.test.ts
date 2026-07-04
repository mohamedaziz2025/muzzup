import { describe, expect, it } from "vitest";
import { detectLeakedCoordinates } from "../src/modules/chat/coordinate-detector.js";

describe("detectLeakedCoordinates", () => {
  it("flags an email address", () => {
    expect(detectLeakedCoordinates("Contactez-moi à amine@example.com").flagged).toBe(true);
  });

  it("flags a French mobile number", () => {
    expect(detectLeakedCoordinates("Mon numéro est 06 12 34 56 78").flagged).toBe(true);
  });

  it("flags an external URL", () => {
    expect(detectLeakedCoordinates("Voir https://wa.me/33612345678 pour discuter").flagged).toBe(true);
  });

  it("flags a phone number spelled out digit by digit", () => {
    expect(
      detectLeakedCoordinates("zero six un deux trois quatre cinq six sept huit").flagged,
    ).toBe(true);
  });

  it("does not flag an ordinary business message", () => {
    const result = detectLeakedCoordinates(
      "Le chiffre d'affaires a augmenté de 12% ce trimestre, très bonne dynamique.",
    );
    expect(result.flagged).toBe(false);
  });
});

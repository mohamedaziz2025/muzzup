import { describe, expect, it } from "vitest";
import { authService } from "../src/modules/auth/auth.service.js";
import { UserModel } from "../src/models/user.model.js";

const ctx = { ip: "127.0.0.1", userAgent: "vitest" };

function registerInput(overrides: Partial<Parameters<typeof authService.register>[0]> = {}) {
  return {
    email: "vendeur@example.com",
    password: "Sup3r$ecurePass!",
    fullName: "Amine Vendeur",
    locale: "fr" as const,
    acceptedTermsAt: new Date(),
    ...overrides,
  };
}

describe("authService.register", () => {
  it("creates a user with a hashed password and issues a token pair", async () => {
    const { user, tokens } = await authService.register(registerInput(), ctx);

    expect(user.email).toBe("vendeur@example.com");
    expect(user.passwordHash).not.toBe("Sup3r$ecurePass!");
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(user.roles).toContain("member");
  });

  it("rejects registration with an already-used email", async () => {
    await authService.register(registerInput(), ctx);
    await expect(authService.register(registerInput(), ctx)).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe("authService.login", () => {
  it("logs in with correct credentials", async () => {
    await authService.register(registerInput({ email: "login@example.com" }), ctx);
    const result = await authService.login(
      { email: "login@example.com", password: "Sup3r$ecurePass!" },
      ctx,
    );
    expect(result.requiresTotp).toBe(false);
    if (!result.requiresTotp) {
      expect(result.tokens.accessToken).toBeTruthy();
    }
  });

  it("rejects an incorrect password without revealing which field is wrong", async () => {
    await authService.register(registerInput({ email: "wrongpass@example.com" }), ctx);
    await expect(
      authService.login({ email: "wrongpass@example.com", password: "wrong-password" }, ctx),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects login for an unknown email", async () => {
    await expect(
      authService.login({ email: "ghost@example.com", password: "whatever123!" }, ctx),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("authService.refresh", () => {
  it("rotates the refresh token and rejects reuse of the old one", async () => {
    const { tokens } = await authService.register(
      registerInput({ email: "rotate@example.com" }),
      ctx,
    );

    const refreshed = await authService.refresh(tokens.refreshToken, ctx);
    expect(refreshed.tokens.refreshToken).not.toBe(tokens.refreshToken);

    await expect(authService.refresh(tokens.refreshToken, ctx)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("authService 2FA lifecycle", () => {
  it("enables 2FA only after a valid TOTP confirmation, then requires it at login", async () => {
    const { user } = await authService.register(registerInput({ email: "totp@example.com" }), ctx);
    const { otpAuthUrl } = await authService.init2fa(user._id.toString());
    expect(otpAuthUrl).toContain("otpauth://totp/");

    const secretMatch = /secret=([A-Z0-9]+)/.exec(otpAuthUrl);
    expect(secretMatch).not.toBeNull();
    const { authenticator } = await import("otplib");
    const validCode = authenticator.generate(secretMatch![1]!);

    await authService.confirm2fa(user._id.toString(), validCode);

    const loginAttempt = await authService.login(
      { email: "totp@example.com", password: "Sup3r$ecurePass!" },
      ctx,
    );
    expect(loginAttempt.requiresTotp).toBe(true);

    const refreshedUser = await UserModel.findById(user._id).exec();
    expect(refreshedUser?.twoFactor.enabled).toBe(true);
  });
});

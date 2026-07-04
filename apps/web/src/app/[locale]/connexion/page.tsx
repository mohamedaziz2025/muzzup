"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { UserPublic } from "@muzzap/shared";
import { AuthCard } from "@/components/auth/auth-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, Link } from "@/i18n/navigation";

interface LoginResponse {
  requiresTotp?: boolean;
  user?: UserPublic;
  accessToken?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password, ...(totpCode ? { totpCode } : {}) },
        skipAuth: true,
      }),
    onSuccess: (data) => {
      if (data.requiresTotp) {
        setNeedsTotp(true);
        return;
      }
      if (data.user && data.accessToken) {
        setSession({ user: data.user, accessToken: data.accessToken });
        router.push("/tableau-de-bord");
      }
    },
  });

  return (
    <AuthCard title="Connexion" subtitle="Accédez à votre espace MUZZUP.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {needsTotp && (
          <div>
            <Label htmlFor="totp">Code d&apos;authentification (2FA)</Label>
            <Input
              id="totp"
              inputMode="numeric"
              maxLength={6}
              required
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
            />
          </div>
        )}
        {mutation.isError && (
          <p className="text-sm text-danger">
            {mutation.error instanceof ApiError ? mutation.error.message : "Une erreur est survenue"}
          </p>
        )}
        <Button type="submit" className="w-full glow-royal-hover" disabled={mutation.isPending}>
          {mutation.isPending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm text-secondary">
        <Link href="/mot-de-passe-oublie" className="hover:text-primary">
          Mot de passe oublié ?
        </Link>
        <p>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-cyan hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

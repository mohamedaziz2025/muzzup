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

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<{ user: UserPublic; accessToken: string }>("/auth/register", {
        method: "POST",
        body: {
          fullName,
          email,
          password,
          locale: "fr",
          acceptedTermsAt: new Date().toISOString(),
        },
        skipAuth: true,
      }),
    onSuccess: (data) => {
      setSession(data);
      router.push("/tableau-de-bord");
    },
  });

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Rejoignez la communauté d'entrepreneurs MUZZUP."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!acceptedTerms) return;
          mutation.mutate();
        }}
      >
        <div>
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            required
            minLength={2}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
          </p>
        </div>
        <label className="flex items-start gap-2 text-xs text-secondary">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5"
          />
          J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité.
        </label>
        {mutation.isError && (
          <p className="text-sm text-danger">
            {mutation.error instanceof ApiError ? mutation.error.message : "Une erreur est survenue"}
          </p>
        )}
        <Button
          type="submit"
          className="w-full glow-royal-hover"
          disabled={mutation.isPending || !acceptedTerms}
        >
          {mutation.isPending ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-secondary">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-cyan hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  );
}

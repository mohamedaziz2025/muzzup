"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/auth-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";

function ResetPasswordContent() {
  const token = useSearchParams().get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch("/auth/password-reset/confirm", {
        method: "POST",
        body: { token, newPassword },
        skipAuth: true,
      }),
  });

  if (!token) {
    return (
      <AuthCard title="Réinitialisation du mot de passe">
        <p className="text-danger">Lien de réinitialisation manquant ou invalide.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe">
      {mutation.isSuccess ? (
        <div>
          <p className="text-secondary">Votre mot de passe a été réinitialisé.</p>
          <Link href="/connexion" className="mt-4 inline-block text-cyan hover:underline">
            Se connecter
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-danger">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : "Une erreur est survenue"}
            </p>
          )}
          <Button type="submit" className="w-full glow-royal-hover" disabled={mutation.isPending}>
            {mutation.isPending ? "Réinitialisation..." : "Réinitialiser"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

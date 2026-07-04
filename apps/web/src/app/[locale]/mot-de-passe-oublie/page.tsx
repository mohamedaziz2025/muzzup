"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/auth-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch("/auth/password-reset/request", { method: "POST", body: { email }, skipAuth: true }),
  });

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Recevez un lien de réinitialisation par email."
    >
      {mutation.isSuccess ? (
        <p className="text-secondary">
          Si un compte existe avec cette adresse, un email vient de vous être envoyé.
        </p>
      ) : (
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
          <Button type="submit" className="w-full glow-royal-hover" disabled={mutation.isPending}>
            {mutation.isPending ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

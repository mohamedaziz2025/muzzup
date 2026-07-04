"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Link } from "@/i18n/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification manquant.");
      return;
    }
    apiFetch("/auth/verify-email", { method: "POST", body: { token }, skipAuth: true })
      .then(() => {
        setStatus("success");
        setMessage("Votre adresse email est confirmée.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Lien invalide ou expiré.");
      });
  }, [token]);

  return (
    <AuthCard title="Vérification de l'email">
      <p className={status === "error" ? "text-danger" : "text-secondary"}>{message}</p>
      {status !== "pending" && (
        <Link href="/connexion" className="mt-4 inline-block text-cyan hover:underline">
          Aller à la connexion
        </Link>
      )}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

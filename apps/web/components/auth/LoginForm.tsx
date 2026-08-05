"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  FormInput,
  PasswordInput,
  SubmitButton,
} from "@/components/auth";
import { setStoredUser } from "@/lib/auth-storage";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth";
import { AuthApiError, login as loginUser } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const user = await loginUser({
        email: data.email,
        password: data.password,
      });

      setStoredUser(user);
      toast.success("Login realizado com sucesso.");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : "Não foi possível entrar. Tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormInput
        label="E-mail"
        type="email"
        placeholder="Digite seu e-mail corporativo"
        autoComplete="email"
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <PasswordInput
        label="Senha"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      <div className="-mt-2 flex justify-end">
        <button
          type="button"
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Esqueceu a senha?
        </button>
      </div>

      <SubmitButton className="mt-2" isLoading={isSubmitting}>
        Entrar
      </SubmitButton>
    </form>
  );
}

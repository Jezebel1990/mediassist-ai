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
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { AuthApiError, register as registerUser } from "@/services/auth.service";

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);

    try {
      await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      toast.success("Conta criada com sucesso.");
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : "Não foi possível criar a conta. Tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormInput
        label="Nome Completo"
        placeholder="Digite seu nome completo"
        autoComplete="name"
        error={errors.fullName?.message}
        disabled={isSubmitting}
        {...register("fullName")}
      />

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
        placeholder="Crie uma senha"
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      <PasswordInput
        label="Confirmar senha"
        placeholder="Confirme sua senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
        {...register("confirmPassword")}
      />

      <SubmitButton className="mt-2" isLoading={isSubmitting}>
        Criar Conta
      </SubmitButton>
    </form>
  );
}

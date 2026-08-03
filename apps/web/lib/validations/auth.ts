import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "E-mail corporativo é obrigatório")
  .email("Informe um e-mail válido");

export const passwordSchema = z
  .string()
  .min(1, "Senha é obrigatória")
  .min(8, "A senha deve ter no mínimo 8 caracteres");

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Nome completo é obrigatório"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Shared base for the future Login form. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

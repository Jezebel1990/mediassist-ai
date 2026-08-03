import {
  AuthBanner,
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  Logo,
} from "@/components/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      banner={
        <AuthBanner
          imageSrc="/health.png"
          imageAlt="Equipe médica em ambiente clínico"
          title={"Otimize o atendimento\ncom respostas inteligentes"}
          description="O MediAssist AI centraliza o conhecimento da clínica, permitindo consultar políticas, procedimentos, convênios e documentos internos com respostas confiáveis baseadas na documentação oficial."
        />
      }
    >
      <Logo />
      <AuthCard>
        <AuthHeader
          title="Criar Conta"
          description="Preencha os dados abaixo para se cadastrar."
        />
        <RegisterForm />
        <AuthFooter
          prompt="Já possui uma conta?"
          actionLabel="Entrar"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}

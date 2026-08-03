import {
  AuthBanner,
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthLayout,
  LoginForm,
  Logo,
} from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthLayout
      banner={
        <AuthBanner
          imageSrc="/health.png"
          imageAlt="Equipe médica em ambiente clínico"
          title={"Otimize o atendimento\ncom respostas inteligentes"}
          description="O MediAssist AI centraliza o conhecimento da clínica, permitindo consultar políticas, procedimentos, convênios e documentos internos com respostas confiáveis baseadas na documentação oficial."
          showIcon={true}
        />
      }
    >
      <Logo />
      <AuthCard>
        <AuthHeader
          title="Bem-vindo de volta!"
          description="Entre no MediAssist AI para continuar."
        />
        <LoginForm />
        <AuthFooter
          prompt="Não possui uma conta?"
          actionLabel="Cadastre-se agora"
          href="/register"
        />
      </AuthCard>
    </AuthLayout>
  );
}

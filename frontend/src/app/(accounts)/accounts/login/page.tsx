import LoginForm from "@/components/LoginForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Login() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center">
      <div className="flex flex-col items-center border-1 border-gray-300 w-[350px] mb-[10px] py-[10px]">
        <Logo className="mt-9 mb-3 text-5xl flex justify-center" />
        <LoginForm />
        <Link href="/accounts/password/reset" className="text-[16px] mt-3">Forgot password?</Link>
      </div>
      <div className="flex justify-center items-center gap-1 border-1 border-gray-300 w-[350px] py-[25px] leading-none">
        <p className="text-sm">Don't have an account?</p>
        <Link href="/accounts/emailsignup" className="text-blue-500 text-sm">
          Sign up
        </Link>
      </div>
    </div>
  );
}

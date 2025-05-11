import LoginForm from "@/components/LoginForm";
import localFont from "next/font/local";
import Link from "next/link";

const myFont = localFont({
  src: "../../../../public/fonts/blue_vinyl_regular_ps_ot.otf",
  display: "swap",
});

export default function Login() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center">
      <div className="flex flex-col items-center border-1 border-gray-300 w-[350px] mb-[10px] py-[10px]">
        <h1 className={`${myFont.className} font-thin text-5xl mt-9 mb-3`}>
          Instagram
        </h1>
        <LoginForm />
        <Link href="accounts/password/reset" className="text-[16px] mt-3">Forgot password?</Link>
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

"use client";

import { useRouter } from "next/navigation";
import Button from "@/app/_components/common/button/Button";
import Alberta from "@/assets/icons/alberta";
import Salvation from "@/assets/icons/salvation";
import style from "./Logout.module.scss";

export default function LoginPage() {
  const router = useRouter();
  function redirectLogin() {
    router.push("/login");
  }
  return (
    <div className={style.mainPage}>
      <div className={style.container}>
        <div className={style.icons}>
          <Salvation></Salvation>
          <Alberta></Alberta>
        </div>
        <div className={style.logoutText}>You’ve logged out of the Navigation Centre</div>
        <Button width={"100%"} height={"54px"} fontSize={"16px"} onClick={redirectLogin}>
          Log in
        </Button>
      </div>
    </div>
  );
}

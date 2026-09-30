import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { getProfile } from "@/lib/api/account";
import { getRegistrationFormData } from "@/lib/api/auth";

export const metadata: Metadata = {
  title: "Профіль",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const [profile, form] = await Promise.all([
    getProfile(),
    getRegistrationFormData(),
  ]);

  if (!profile) {
    return (
      <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
        Не вдалося завантажити профіль. Оновіть сторінку або спробуйте пізніше.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
            Дані профілю
          </h2>
          {/* Номер клієнта питає менеджер по телефону — тримаємо на видноті */}
          {profile.number && (
            <span className="tnum rounded-[8px] bg-blue-25 px-3 py-1.5 text-[14px] leading-[1.5] text-blue-300">
              Клієнт №{profile.number}
            </span>
          )}
        </div>

        <ProfileForm profile={profile} regions={form.regions} />
      </section>

      <section className="flex flex-col gap-5 border-t border-grey-200 pt-10">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Зміна пароля
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}

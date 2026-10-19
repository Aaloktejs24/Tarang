"use client";

import { useEffect } from "react";
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import { useProfile } from "../../../hooks/useProfile";
import Loader from "../../../components/common/Loader";

export default function HomePage() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "institute" || profile.role === "organisation") {
        router.replace("/dashboard/home/institute");
      } else {
        router.replace("/dashboard/home/feed");
      }
    }
  }, [profile, loading, router]);

  return <Loader />;
}

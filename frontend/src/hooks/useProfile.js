"use client";
import { useContext } from "react";
import { ProfileContext } from "../contexts/ProfileContext";

export const useProfile = () => {
  return useContext(ProfileContext);
};
